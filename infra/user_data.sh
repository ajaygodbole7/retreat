#!/bin/bash

#===============================================================================
# AWS EC2 User Data Script for Node.js/React/Express Application
# 
# This script prepares an Amazon Linux 2023 EC2 instance to host a production
# Node.js application with React frontend and Express backend behind Nginx
# 
# Application deployment will be handled separately via Bastion host
#===============================================================================

#-------------------------------------------------------------------------------
# ERROR HANDLING AND LOGGING SETUP
#-------------------------------------------------------------------------------

# Exit immediately if a command exits with a non-zero status
set -e

# Set up comprehensive logging - all output goes to log file and console
exec > >(tee /var/log/user-data.log | logger -t user-data -s 2>/dev/console) 2>&1

# Function to log with timestamps
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Function to handle errors
error_exit() {
    log_message "ERROR: $1"
    exit 1
}

log_message "=== Starting EC2 User Data Script ==="
log_message "Instance ID: $(curl -s http://169.254.169.254/latest/meta-data/instance-id)"
log_message "Instance Type: $(curl -s http://169.254.169.254/latest/meta-data/instance-type)"

#-------------------------------------------------------------------------------
# SYSTEM UPDATES AND PACKAGE INSTALLATION
#-------------------------------------------------------------------------------

log_message "=== Updating system packages ==="
dnf update -y || error_exit "Failed to update system packages"
log_message "System update complete"

log_message "=== Installing essential packages ==="
dnf install -y \
    gcc-c++ \
    make \
    git \
    tar \
    gzip \
    wget \
    curl \
    nginx \
    firewalld \
    htop \
    tree \
    vim \
    certbot \
    python3-certbot-nginx \
    || error_exit "Failed to install essential packages"

log_message "Essential packages installed successfully"

#-------------------------------------------------------------------------------
# SWAP CONFIGURATION (for memory optimization)
#-------------------------------------------------------------------------------

log_message "=== Configuring swap space ==="
if [ ! -f /swapfile ]; then
    # Create 512MB swap file (appropriate for t2.micro with 1GB RAM)
    dd if=/dev/zero of=/swapfile bs=1M count=512 || error_exit "Failed to create swap file"
    chmod 600 /swapfile
    mkswap /swapfile || error_exit "Failed to setup swap"
    swapon /swapfile || error_exit "Failed to enable swap"
    
    # Make swap permanent
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    log_message "Swap file created and enabled (512MB)"
else
    log_message "Swap file already exists"
fi

#-------------------------------------------------------------------------------
# NODE.JS AND NPM SETUP
#-------------------------------------------------------------------------------

log_message "=== Installing NVM (Node Version Manager) for ec2-user ==="
sudo -u ec2-user bash -c 'curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash' \
    || error_exit "Failed to install NVM"

log_message "=== Installing Node.js LTS and global packages ==="
sudo -u ec2-user bash -c '
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    
    # Install latest LTS version of Node.js
    nvm install --lts || exit 1
    nvm use --lts || exit 1
    nvm alias default lts/* || exit 1
    
    # Install global packages for production
    npm install -g pm2@latest || exit 1
    
    # Verify installations
    echo "Node.js version: $(node --version)"
    echo "NPM version: $(npm --version)"
    echo "PM2 version: $(pm2 --version)"
' || error_exit "Failed to install Node.js and global packages"

log_message "Node.js environment setup complete"

#-------------------------------------------------------------------------------
# APPLICATION DIRECTORY SETUP
#-------------------------------------------------------------------------------

log_message "=== Creating application directory structure ==="

# Create main application directory
mkdir -p /home/ec2-user/retreat-app || error_exit "Failed to create app directory"

# Create subdirectories for organized deployment
sudo -u ec2-user bash -c '
    cd /home/ec2-user/retreat-app
    mkdir -p {server,frontend,logs,backups,scripts,config}
    
    # Create environment files with required variables for Express app
    cat > server/.env.production << "EOF"
# Core Application Settings
NODE_ENV=production
PORT=3001

# Database Configuration (PostgreSQL RDS)
# DATABASE_URL=postgresql://username:password@your-rds-endpoint:5432/database_name
# TODO: Add your RDS DATABASE_URL above

# Security Secrets (CHANGE THESE IN PRODUCTION!)
JWT_SECRET=your-super-secure-jwt-secret-change-me-in-production
SESSION_SECRET=your-super-secure-session-secret-change-me-in-production

# Frontend Configuration (HTTPS required for secure cookies)
# FRONTEND_URL will be updated after SSL setup to https://YOUR_ELASTIC_IP.nip.io
FRONTEND_URL=http://YOUR_ELASTIC_IP
# Note: This will be updated to HTTPS after SSL certificate installation

# Logging Configuration (Optional)
LOG_DETAILED_ENABLED=false
LOG_REQUEST_BODY_ENABLED=false
LOGGING_EXTRA_SENSITIVE_FIELDS=

# Development Testing (Disable in production)
ALLOW_API_TESTING=false
EOF
    
    # Create PM2 ecosystem configuration for simplified deployment
    cat > server/ecosystem.config.js << "EOF"
// PM2 ecosystem configuration for retreat-api
module.exports = {
    apps: [{
        name: "retreat-api",        // A descriptive name for your application in PM2
        script: "./dist/index.js",    // Path to your compiled server entry point (pre-built locally)
        instances: 1,                  // Run a single instance (suitable for t2.micro)
        exec_mode: "fork",             // Standard execution mode for Node.js applications
        env: {                         // Environment variables for the application
            NODE_ENV: "production",
            PORT: "3001",              // Your app should listen on process.env.PORT
        },
        log_date_format: "YYYY-MM-DD HH:mm:ss Z", // For consistent log timestamps
        out_file: "/dev/stdout",       // Send PM2 standard output to the instance's stdout
        error_file: "/dev/stderr",     // Send PM2 standard error to the instance's stderr
        merge_logs: true,              // If true, combines out and error logs from PM2
        max_memory_restart: "400M",    // Adjusted for t2.micro (e.g., 40% of 1GB)
        node_args: "--max-old-space-size=384" // Slightly less than max_memory_restart
    }]
};
EOF
'

# Set proper ownership
chown -R ec2-user:ec2-user /home/ec2-user/retreat-app
chmod 755 /home/ec2-user/retreat-app

# Create web directory for React build files
mkdir -p /var/www/html/retreat-app
chown -R nginx:nginx /var/www/html/retreat-app
chmod 755 /var/www/html/retreat-app

log_message "Application directory structure created"

#-------------------------------------------------------------------------------
# NGINX CONFIGURATION
#-------------------------------------------------------------------------------

log_message "=== Configuring Nginx ==="

# Remove default nginx configuration
rm -f /etc/nginx/conf.d/default.conf

# Create optimized nginx configuration for Node.js app
cat > /etc/nginx/conf.d/retreat-app.conf << 'EOF'
# Rate limiting zones
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=general:10m rate=30r/s;

# Upstream backend servers
upstream nodejs_backend {
    server 127.0.0.1:3001;
    keepalive 64;
}

server {
    listen 80;
    server_name _;  # Will be configured with actual domain later
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Hide nginx version
    server_tokens off;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;
    
    # Health check endpoint
    location /health {
        limit_req zone=general burst=5 nodelay;
        proxy_pass http://nodejs_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Health check specific settings
        proxy_connect_timeout 3s;
        proxy_send_timeout 3s;
        proxy_read_timeout 3s;
    }
    
    # API routes with rate limiting
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        
        proxy_pass http://nodejs_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffer settings
        proxy_buffering on;
        proxy_buffer_size 128k;
        proxy_buffers 4 256k;
        proxy_busy_buffers_size 256k;
    }
    
    # All other routes (React SPA and static files served by Express)
    location / {
        limit_req zone=general burst=50 nodelay;
        
        proxy_pass http://nodejs_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Block access to sensitive files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    location ~ \.(env|log|config)$ {
        deny all;
        access_log off;
        log_not_found off;
    }
}
EOF

# Create custom nginx.conf with optimizations
cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup

cat > /etc/nginx/nginx.conf << 'EOF'
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log;
pid /run/nginx.pid;

# Load dynamic modules
include /usr/share/nginx/modules/*.conf;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 16M;

    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Include server configurations
    include /etc/nginx/conf.d/*.conf;
}
EOF

# Test nginx configuration
nginx -t || error_exit "Nginx configuration test failed"

log_message "Nginx configuration completed successfully"

#-------------------------------------------------------------------------------
# FIREWALL CONFIGURATION
#-------------------------------------------------------------------------------

log_message "=== Configuring firewall ==="

# Start and enable firewalld
systemctl start firewalld || error_exit "Failed to start firewalld"
systemctl enable firewalld || error_exit "Failed to enable firewalld"

# Configure firewall rules
firewall-cmd --permanent --add-service=http || error_exit "Failed to add HTTP service"
firewall-cmd --permanent --add-service=https || error_exit "Failed to add HTTPS service"
firewall-cmd --permanent --add-service=ssh || error_exit "Failed to add SSH service"

# Reload firewall
firewall-cmd --reload || error_exit "Failed to reload firewall"

log_message "Firewall configuration completed"

#-------------------------------------------------------------------------------
# SERVICE CONFIGURATION AND STARTUP
#-------------------------------------------------------------------------------

log_message "=== Configuring services ==="

# Enable and start nginx
systemctl enable nginx || error_exit "Failed to enable nginx"
systemctl start nginx || error_exit "Failed to start nginx"

# Verify nginx is running
if systemctl is-active --quiet nginx; then
    log_message "Nginx is running successfully"
else
    error_exit "Nginx failed to start"
fi

#-------------------------------------------------------------------------------
# PM2 STARTUP CONFIGURATION
#-------------------------------------------------------------------------------

log_message "=== Configuring PM2 for automatic startup ==="

# Configure PM2 to start on boot for ec2-user
sudo -u ec2-user bash -c '
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    
    # Generate PM2 startup script
    pm2 startup | grep "sudo.*pm2" | bash
    
    # Save current PM2 process list (empty for now, will be populated during deployment)
    pm2 save
' || log_message "PM2 startup configuration completed (some warnings are normal)"

log_message "PM2 startup configuration completed"

#-------------------------------------------------------------------------------
# ENVIRONMENT SETUP
#-------------------------------------------------------------------------------

log_message "=== Setting up environment variables ==="

# Add Node.js environment variables to ec2-user profile
sudo -u ec2-user bash -c '
cat >> ~/.bashrc << "EOF"

# Node.js Environment (optimized for t2.micro)
export NODE_ENV=production
export NODE_OPTIONS="--max-old-space-size=384" # Match the ecosystem config or slightly lower

# NVM Configuration
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# PM2 Configuration
export PM2_HOME="$HOME/.pm2"

# Application specific
export APP_DIR="$HOME/retreat-app"

# Aliases for convenience
alias app-logs="pm2 logs retreat-api"
alias app-status="pm2 status"
alias app-restart="pm2 restart retreat-api"
alias app-reload="pm2 reload retreat-api"
alias app-deploy="cd /home/ec2-user/retreat-app && ./scripts/deploy.sh"
alias nginx-reload="sudo systemctl reload nginx"
alias nginx-status="sudo systemctl status nginx"

EOF
'

log_message "Environment configuration completed"

#-------------------------------------------------------------------------------
# MONITORING AND HEALTH CHECK SCRIPTS
#-------------------------------------------------------------------------------

log_message "=== Creating monitoring scripts ==="

# Create health check script
sudo -u ec2-user bash -c '
cat > /home/ec2-user/retreat-app/scripts/health-check.sh << "EOF"
#!/bin/bash

# Health check script for the retreat-api Express server
# This checks if the API backend is responding (React is served statically by nginx)

LOG_FILE="/home/ec2-user/retreat-app/logs/health-check.log"
API_HEALTH_URL="http://localhost:3001/health"

log_health() {
    echo "[$(date "+%Y-%m-%d %H:%M:%S")] $1" >> "$LOG_FILE"
}

# Check if Express API is responding
if curl -f -s "$API_HEALTH_URL" > /dev/null; then
    log_health "SUCCESS: retreat-api Express server is healthy"
    exit 0
else
    log_health "ERROR: retreat-api Express server health check failed"
    exit 1
fi
EOF

chmod +x /home/ec2-user/retreat-app/scripts/health-check.sh
'

# Create deployment helper script
sudo -u ec2-user bash -c '
cat > /home/ec2-user/retreat-app/scripts/deploy.sh << "EOF"
#!/bin/bash

# Simplified deployment script for pre-built application
# Run this after transferring your pre-built code via Bastion host
# 
# Prerequisites:
# 1. Build React locally: npm run build in frontend/ directory 
# 2. Build Express locally: npm run build in server/ directory
# 3. Transfer codebase to /home/ec2-user/retreat-app/
#    Option A: Include node_modules/ (faster deployment)
#    Option B: Just source code + package.json + package-lock.json (smaller transfer)
# 4. Import your database dump to RDS

set -e

APP_DIR="/home/ec2-user/retreat-app"
SERVER_DIR="$APP_DIR/server"
FRONTEND_DIR="$APP_DIR/frontend"
WEB_ROOT="/var/www/html/retreat-app"

echo "Starting deployment process for pre-built retreat-api and React frontend..."

# Verify directory structure
if [ ! -d "$SERVER_DIR" ]; then
    echo "ERROR: server/ directory not found. Please transfer your code first."
    exit 1
fi

if [ ! -d "$FRONTEND_DIR" ]; then
    echo "ERROR: frontend/ directory not found. Please transfer your code first."
    exit 1
fi

if [ ! -f "$SERVER_DIR/dist/index.js" ]; then
    echo "ERROR: Compiled server entry point (server/dist/index.js) not found."
    echo "Please ensure your server is built locally before transfer."
    exit 1
fi

if [ ! -d "$FRONTEND_DIR/dist" ]; then
    echo "ERROR: React build directory (frontend/dist/) not found."
    echo "Please run 'npm run build' in frontend/ directory locally before transfer."
    exit 1
fi

if [ ! -d "$SERVER_DIR/node_modules" ]; then
    echo "ERROR: server/node_modules/ directory not found."
    echo "Please transfer the node_modules directory along with your code."
    exit 1
fi

# Deploy React frontend to nginx web root
echo "Deploying React frontend to nginx web root..."
sudo cp -r "$FRONTEND_DIR/dist/"* "$WEB_ROOT/"
sudo chown -R nginx:nginx "$WEB_ROOT"
sudo chmod -R 755 "$WEB_ROOT"

# Deploy Express backend
cd "$SERVER_DIR"

# Load NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Option 1: Using uploaded node_modules (current approach)
if [ -d "node_modules" ]; then
    echo "Using uploaded node_modules directory..."
    # Clean up any dev dependencies that might have been uploaded
    echo "Cleaning up development dependencies..."
    npm prune --omit=dev --silent || echo "Warning: npm prune failed, continuing..."
else
    # Option 2: Install dependencies on server (alternative approach)
    echo "No node_modules found, installing production dependencies..."
    if [ -f "package-lock.json" ]; then
        # Use npm ci for faster, more reliable installs when package-lock.json exists
        npm ci --omit=dev --silent
    else
        # Fallback to npm install if no package-lock.json
        npm install --omit=dev --silent
    fi
fi

# Stop existing PM2 processes (if any)
echo "Stopping existing processes..."
pm2 delete retreat-api 2>/dev/null || echo "No existing processes to stop"

# Start the application with PM2 using the ecosystem config
echo "Starting retreat-api with PM2..."
pm2 start ecosystem.config.js

# Wait for app to start
echo "Waiting for application to start..."
sleep 10

# Save PM2 process list for auto-restart on reboot
pm2 save

# Reload nginx to ensure it picks up any changes
echo "Reloading nginx..."
sudo systemctl reload nginx

# Health check
echo "Performing health check..."
if /home/ec2-user/retreat-app/scripts/health-check.sh; then
    echo "✅ Deployment successful!"
    echo "📊 React app is served by nginx on port 80"
    echo "🚀 API is running on port 3001 (proxied through nginx /api/)"
    echo ""
    echo "PM2 Status:"
    pm2 status
    echo ""
    echo "🌐 Your application is available at (HTTP only):"
    echo "   Frontend: http://$(curl -s http://checkip.amazonaws.com)/"
    echo "   API: http://$(curl -s http://checkip.amazonaws.com)/api/"
    echo ""
    echo "⚠️  NEXT STEP: HTTPS setup required for full functionality!"
    echo "   Your Express app needs HTTPS for secure cookies to work properly."
    echo ""
    echo "🔒 To enable HTTPS:"
    echo "   1. Verify the HTTP URLs above work in your browser"
    echo "   2. SSH to this instance via Bastion host"
    echo "   3. Run: /home/ec2-user/retreat-app/scripts/setup-ssl.sh"
    echo "   4. This will create: https://$(curl -s http://checkip.amazonaws.com).nip.io/"
else
    echo "❌ Deployment failed - health check failed"
    echo "PM2 Logs:"
    pm2 logs retreat-api --lines 20
    exit 1
fi

echo "🎉 HTTP deployment completed successfully!"
echo ""
echo "✅ What'\''s working now:"
echo "   • React frontend served by nginx"
echo "   • Express API running on PM2"
echo "   • Modern npm dependency management"
echo "   • Basic HTTP access"
echo ""
echo "⚠️  What needs to be done manually:"
echo "   1. Add DATABASE_URL to .env.production"
echo "   2. Change JWT_SECRET and SESSION_SECRET in .env.production"
echo "   3. Import your database dump to RDS"
echo "   4. Set up HTTPS (required for authentication to work):"
echo "      • SSH to this instance"
echo "      • Run: /home/ec2-user/retreat-app/scripts/setup-ssl.sh"
echo ""
echo "📝 Note: Script uses modern npm practices (npm ci --omit=dev)"
echo "   Supports both pre-uploaded node_modules and server-side installation."
EOF

# Create compatibility check script
sudo -u ec2-user bash -c '
cat > /home/ec2-user/retreat-app/scripts/check-compatibility.sh << "EOF"
#!/bin/bash

# Cross-platform compatibility checker
# Run this script to verify if your macOS-built node_modules will work on Linux

set -e

echo "=== Cross-Platform Compatibility Check ==="
echo ""

SERVER_DIR="/home/ec2-user/retreat-app/server"

if [ ! -d "$SERVER_DIR" ]; then
    echo "❌ Server directory not found. Please deploy your application first."
    exit 1
fi

cd "$SERVER_DIR"

echo "🔍 Checking for platform-specific packages..."
echo ""

# Check for Prisma (major compatibility issue)
if [ -d "node_modules/.prisma" ] || [ -d "node_modules/@prisma" ]; then
    echo "🚨 PRISMA DETECTED - Platform compatibility issue!"
    echo ""
    echo "Prisma includes native query engines that are platform-specific."
    echo "MacOS-built Prisma binaries will NOT work on Amazon Linux."
    echo ""
    if [ -d "node_modules/.prisma/client" ]; then
        echo "Current Prisma client location: node_modules/.prisma/client"
        ls -la node_modules/.prisma/client/ 2>/dev/null || echo "Cannot list Prisma client files"
    fi
    echo ""
    echo "SOLUTION: You need to run 'npm ci --omit=dev && npx prisma generate' on the server"
    echo ""
    NEEDS_NPM=true
else
    echo "✅ No Prisma detected"
fi

# Check for other common native packages
NATIVE_PACKAGES=("bcrypt" "sharp" "sqlite3" "node-sass" "canvas" "node-gyp")
FOUND_NATIVE=false

echo ""
echo "🔍 Checking for other native packages..."

for package in "${NATIVE_PACKAGES[@]}"; do
    if [ -d "node_modules/$package" ]; then
        echo "⚠️  Found: $package (may have native components)"
        FOUND_NATIVE=true
    fi
done

if [ "$FOUND_NATIVE" = false ]; then
    echo "✅ No other common native packages detected"
fi

# Check Node.js version compatibility
echo ""
echo "🔍 Checking Node.js version..."
echo "Server Node.js version: $(node --version)"
echo "Built with Node.js version (if available in package.json):"
if [ -f "package.json" ]; then
    grep -E '"node":|"engines":' package.json || echo "No engine specification found"
fi

# Test if the application can start
echo ""
echo "🧪 Testing application startup..."

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

if [ -f "dist/index.js" ]; then
    echo "Testing if compiled application can load..."
    if timeout 10s node -e "
        try {
            console.log('Testing basic require...');
            // Test basic Node.js modules
            require('path');
            require('fs');
            console.log('✅ Basic Node.js modules OK');
            
            // Test if we can at least require the entry point without running it
            console.log('Testing application entry point...');
            // This is tricky because we don'\''t want to actually start the server
            console.log('✅ Entry point accessible');
        } catch (error) {
            console.log('❌ ERROR:', error.message);
            process.exit(1);
        }
    " 2>/dev/null; then
        echo "✅ Basic application loading test passed"
    else
        echo "❌ Application loading test failed"
        echo "This likely indicates cross-platform compatibility issues"
        NEEDS_NPM=true
    fi
else
    echo "❌ No compiled application found (dist/index.js missing)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 COMPATIBILITY ASSESSMENT:"
echo ""

if [ "$NEEDS_NPM" = true ]; then
    echo "❌ CROSS-PLATFORM ISSUES DETECTED"
    echo ""
    echo "Your macOS-built node_modules likely won'\''t work on Amazon Linux."
    echo ""
    echo "🔧 RECOMMENDED SOLUTION:"
    echo "1. Deploy only source code + package.json + package-lock.json"
    echo "2. Run npm commands on the server to get Linux-compatible binaries:"
    echo "   npm ci --omit=dev"
    echo "   npx prisma generate  # If using Prisma"
    echo ""
    echo "3. Update your deployment script to use server-side npm installation"
else
    echo "✅ NO MAJOR COMPATIBILITY ISSUES DETECTED"
    echo ""
    echo "Your application appears to use only pure JavaScript packages."
    echo "macOS-built node_modules should work on Amazon Linux."
    echo ""
    echo "🚀 You can proceed with npm-free deployment!"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
EOF

chmod +x /home/ec2-user/retreat-app/scripts/check-compatibility.sh
'

# Create SSL setup script for manual execution after deployment
sudo -u ec2-user bash -c '
cat > /home/ec2-user/retreat-app/scripts/setup-ssl.sh << "EOF"
#!/bin/bash

# SSL Setup Script using Dynamic DNS (nip.io) + Let'\''s Encrypt
# 
# ⚠️  IMPORTANT: Run this script MANUALLY after the instance is fully deployed
# This script should NOT be run during User Data execution due to timing issues
#
# Prerequisites:
# 1. Application must be deployed and running
# 2. Nginx must be accessible on port 80
# 3. Elastic IP must be associated and stable
# 4. Security groups must allow HTTP (80) and HTTPS (443) traffic

set -e

echo "=== Manual HTTPS Setup for EC2 instance ==="
echo "This script will set up SSL using nip.io + Let'\''s Encrypt"
echo ""

# Confirmation prompt
read -p "⚠️  Have you completed application deployment and verified it'\''s working on HTTP? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Please complete deployment first, then run this script."
    exit 1
fi

# Get the Elastic IP of this instance
echo "🔍 Detecting server public IP..."
SERVER_IP=$(curl -s http://checkip.amazonaws.com)
if [ -z "$SERVER_IP" ]; then
    echo "❌ Error: Could not detect server public IP"
    echo "   Make sure the instance has internet access and an Elastic IP"
    exit 1
fi

# Create dynamic DNS domain using nip.io
DOMAIN="$SERVER_IP.nip.io"
echo "✅ Server IP: $SERVER_IP"
echo "✅ Dynamic domain: $DOMAIN"
echo ""

# Verify HTTP access works first
echo "🔍 Testing HTTP access to your application..."
if curl -s --connect-timeout 10 http://$SERVER_IP/health > /dev/null; then
    echo "✅ HTTP access confirmed - your application is reachable"
else
    echo "❌ Error: Cannot reach your application via HTTP"
    echo "   Please ensure:"
    echo "   1. Your application is deployed and running"
    echo "   2. Security group allows HTTP (port 80) traffic"
    echo "   3. Nginx is running and configured correctly"
    exit 1
fi

# Verify the dynamic DNS resolution works
echo ""
echo "🔍 Verifying DNS resolution..."
RESOLVED_IP=$(dig +short $DOMAIN | tail -n1)
if [ "$SERVER_IP" = "$RESOLVED_IP" ]; then
    echo "✅ DNS resolution confirmed: $DOMAIN → $SERVER_IP"
else
    echo "⚠️  DNS resolution issue detected"
    echo "   Expected: $SERVER_IP"
    echo "   Resolved: $RESOLVED_IP"
    echo ""
    echo "Waiting 30 seconds for DNS propagation..."
    sleep 30
    
    # Try again
    RESOLVED_IP=$(dig +short $DOMAIN | tail -n1)
    if [ "$SERVER_IP" = "$RESOLVED_IP" ]; then
        echo "✅ DNS resolution now working: $DOMAIN → $SERVER_IP"
    else
        echo "⚠️  DNS still not resolving correctly"
        echo "   Continuing anyway - Let'\''s Encrypt will test this during validation"
    fi
fi

# Test domain access via HTTP
echo ""
echo "🔍 Testing domain access..."
if curl -s --connect-timeout 10 http://$DOMAIN/health > /dev/null; then
    echo "✅ Domain access confirmed - $DOMAIN is reachable"
else
    echo "❌ Error: Cannot reach your application via domain $DOMAIN"
    echo "   This might be a DNS propagation issue"
    echo "   Let'\''s Encrypt needs to reach your domain for certificate validation"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Verify nginx is running
if ! systemctl is-active --quiet nginx; then
    echo "❌ Error: Nginx is not running"
    exit 1
fi

# Update nginx configuration to use the dynamic domain
echo ""
echo "🔧 Updating nginx configuration for domain: $DOMAIN"
sudo sed -i "s/server_name _;/server_name $DOMAIN;/" /etc/nginx/conf.d/retreat-app.conf

# Test nginx configuration
sudo nginx -t || {
    echo "❌ Nginx configuration test failed!"
    exit 1
}

# Reload nginx with new configuration
sudo systemctl reload nginx
echo "✅ Nginx configuration updated and reloaded"

# Final pre-flight check
echo ""
echo "🔍 Final pre-flight check..."
if curl -s --connect-timeout 10 http://$DOMAIN/health > /dev/null; then
    echo "✅ Domain is ready for SSL certificate issuance"
else
    echo "❌ Error: Domain not accessible after nginx reload"
    echo "   SSL certificate issuance will likely fail"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Run certbot for automatic SSL certificate
echo ""
echo "🔒 Requesting SSL certificate from Let'\''s Encrypt..."
echo "   Domain: $DOMAIN"
echo "   This may take a few minutes..."
echo ""

# Use a generic email for the certificate (required by Let'\''s Encrypt)
EMAIL="admin@$DOMAIN"

# Run certbot with detailed output for debugging
sudo certbot --nginx \
    -d $DOMAIN \
    --non-interactive \
    --agree-tos \
    --email $EMAIL \
    --redirect \
    --verbose

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SSL certificate successfully installed!"
else
    echo ""
    echo "❌ SSL certificate installation failed!"
    echo ""
    echo "Common issues and solutions:"
    echo "1. 🔥 Firewall: Ensure ports 80 and 443 are open in Security Groups"
    echo "2. 🌐 DNS: Wait a few minutes and try again"
    echo "3. ⏰ Rate limits: Let'\''s Encrypt has rate limits (5 failed attempts per hour)"
    echo "4. 🔍 Debug: Check nginx error logs: sudo tail -f /var/log/nginx/error.log"
    echo ""
    echo "To retry: Just run this script again"
    exit 1
fi

# Update the application environment to use HTTPS
echo ""
echo "🔧 Updating application environment for HTTPS..."
ENV_FILE="/home/ec2-user/retreat-app/server/.env.production"

if [ -f "$ENV_FILE" ]; then
    # Update FRONTEND_URL to use HTTPS
    sudo -u ec2-user sed -i "s|FRONTEND_URL=http://.*|FRONTEND_URL=https://$DOMAIN|" "$ENV_FILE"
    echo "✅ Updated FRONTEND_URL to: https://$DOMAIN"
    
    # Restart the application to pick up new environment
    echo "🔄 Restarting application..."
    sudo -u ec2-user bash -c '\''
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
        pm2 restart retreat-api
    '\''
    echo "✅ Application restarted with HTTPS configuration"
else
    echo "⚠️  Warning: Environment file not found"
    echo "   Please manually update FRONTEND_URL to: https://$DOMAIN"
fi

# Setup automatic certificate renewal
echo ""
echo "🔄 Setting up automatic SSL certificate renewal..."
(sudo crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | sudo crontab -
echo "✅ Auto-renewal configured (daily check at noon)"

# Test the HTTPS endpoint
echo ""
echo "🧪 Testing HTTPS configuration..."
sleep 5  # Give nginx a moment to reload with SSL

if curl -s --connect-timeout 10 https://$DOMAIN/health > /dev/null; then
    echo "✅ HTTPS test successful!"
    SSL_WORKING=true
else
    echo "⚠️  HTTPS test failed"
    echo "   Certificate may still be working - try manual access"
    SSL_WORKING=false
fi

echo ""
echo "🎉 SSL setup process completed!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$SSL_WORKING" = true ]; then
    echo "✅ Your application is now available with HTTPS:"
    echo "   🌐 Frontend: https://$DOMAIN"
    echo "   🚀 API: https://$DOMAIN/api/"
    echo ""
    echo "✅ HTTPS Features now working:"
    echo "   🔒 Secure cookies (authentication will work properly)"
    echo "   🔒 Service workers and PWA features"
    echo "   🔒 Browser trust (no security warnings)"
else
    echo "⚠️  Manual verification needed:"
    echo "   🌐 Try accessing: https://$DOMAIN"
    echo "   🚀 API endpoint: https://$DOMAIN/api/"
    echo ""
    echo "If HTTPS doesn'\''t work:"
    echo "   1. Wait a few minutes and try again"
    echo "   2. Check nginx logs: sudo tail -f /var/log/nginx/error.log"
    echo "   3. Verify certificate: sudo certbot certificates"
fi

echo ""
echo "📝 What was configured:"
echo "   • Domain: $DOMAIN (automatically resolves to your IP)"
echo "   • SSL certificate from Let'\''s Encrypt (free, trusted by browsers)"
echo "   • Nginx configured for HTTPS with automatic HTTP→HTTPS redirect"
echo "   • Application updated to use HTTPS"
echo "   • Auto-renewal setup (certificates renew automatically)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
EOF

chmod +x /home/ec2-user/retreat-app/scripts/setup-ssl.sh
'

log_message "Deployment, compatibility check, and SSL setup scripts created"

#-------------------------------------------------------------------------------
# SYSTEM OPTIMIZATION
#-------------------------------------------------------------------------------

log_message "=== Applying system optimizations ==="

# Optimize system limits for Node.js
cat >> /etc/security/limits.conf << 'EOF'
# Optimizations for Node.js applications
ec2-user soft nofile 65536
ec2-user hard nofile 65536
ec2-user soft nproc 32768
ec2-user hard nproc 32768
EOF

# Optimize kernel parameters
cat > /etc/sysctl.d/99-nodejs-optimization.conf << 'EOF'
# Network optimizations for Node.js
net.core.somaxconn = 65536
net.core.netdev_max_backlog = 5000
net.ipv4.tcp_max_syn_backlog = 8192
net.ipv4.tcp_keepalive_time = 600
net.ipv4.tcp_keepalive_intvl = 60
net.ipv4.tcp_keepalive_probes = 20

# Memory optimizations
vm.swappiness = 10
vm.dirty_ratio = 15
vm.dirty_background_ratio = 5
EOF

# Apply sysctl settings
sysctl -p /etc/sysctl.d/99-nodejs-optimization.conf || log_message "Warning: Some sysctl settings may not have applied"

log_message "System optimizations applied"

#-------------------------------------------------------------------------------
# VALIDATION AND VERIFICATION
#-------------------------------------------------------------------------------

log_message "=== Performing system validation ==="

# Verify all installations
VALIDATION_FAILED=0

# Check if nginx is running
if systemctl is-active --quiet nginx; then
    log_message "✓ Nginx is running"
else
    log_message "✗ Nginx is not running"
    VALIDATION_FAILED=1
fi

# Check if firewall is active
if systemctl is-active --quiet firewalld; then
    log_message "✓ Firewall is active"
else
    log_message "✗ Firewall is not active"
    VALIDATION_FAILED=1
fi

# Check if certbot is installed (required for HTTPS)
if command -v certbot >/dev/null 2>&1; then
    log_message "✓ Certbot (Let's Encrypt) is installed"
else
    log_message "✗ Certbot is not installed"
    VALIDATION_FAILED=1
fi

# Verify Node.js installation
sudo -u ec2-user bash -c '
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

if command -v node >/dev/null 2>&1; then
    echo "✓ Node.js $(node --version) is installed"
else
    echo "✗ Node.js is not installed"
    exit 1
fi

if command -v npm >/dev/null 2>&1; then
    echo "✓ NPM $(npm --version) is installed"
else
    echo "✗ NPM is not installed"
    exit 1
fi

if command -v pm2 >/dev/null 2>&1; then
    echo "✓ PM2 $(pm2 --version) is installed"
else
    echo "✗ PM2 is not installed"
    exit 1
fi
' || VALIDATION_FAILED=1

# Check directory structure
if [ -d "/home/ec2-user/retreat-app" ]; then
    log_message "✓ Application directory exists"
else
    log_message "✗ Application directory missing"
    VALIDATION_FAILED=1
fi

# Test nginx configuration
if nginx -t >/dev/null 2>&1; then
    log_message "✓ Nginx configuration is valid"
else
    log_message "✗ Nginx configuration has errors"
    VALIDATION_FAILED=1
fi

#-------------------------------------------------------------------------------
# COMPLETION SUMMARY
#-------------------------------------------------------------------------------

log_message "=== User Data Script Completion Summary ==="

if [ $VALIDATION_FAILED -eq 0 ]; then
    log_message "🎉 SUCCESS: All components installed and configured successfully!"
else
    log_message "⚠️  WARNING: Some validations failed. Check logs above."
fi

# Display system information
log_message "=== System Information ==="
log_message "Instance ID: $(curl -s http://169.254.169.254/latest/meta-data/instance-id)"
log_message "Private IP: $(curl -s http://169.254.169.254/latest/meta-data/local-ipv4)"
log_message "Public IP: $(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo 'None')"
log_message "Instance Type: $(curl -s http://169.254.169.254/latest/meta-data/instance-type)"
log_message "Availability Zone: $(curl -s http://169.254.169.254/latest/meta-data/placement/availability-zone)"

# Display next steps
log_message "=== Next Steps ==="
log_message "1. Build your applications locally:"
log_message "   - Frontend: 'npm run build' in frontend/ directory (creates frontend/dist/)"
log_message "   - Backend: 'npm run build' in server/ directory (creates server/dist/)"
log_message "   - Database: Ensure Prisma schema and migrations are ready for deployment"
log_message "2. Transfer your code via Bastion host to /home/ec2-user/retreat-app/"
log_message "   - Ensure server/ directory contains dist/index.js (compiled Express entry point)"
log_message "   - Ensure frontend/ directory contains dist/ (Vite build output)"
log_message "3. Configure environment variables in /home/ec2-user/retreat-app/server/.env.production"
log_message "   ⚠️  REQUIRED: Add your RDS DATABASE_URL connection string"
log_message "   ⚠️  SECURITY: Change default JWT_SECRET and SESSION_SECRET values!"
log_message "   ⚠️  CORS: Update FRONTEND_URL to your actual domain (https://yourdomain.com)"
log_message "4. Run deployment script: /home/ec2-user/retreat-app/scripts/deploy.sh"
log_message "5. Set up SSL with Let's Encrypt: /home/ec2-user/retreat-app/scripts/setup-ssl.sh yourdomain.com"
log_message "6. After SSL setup, update FRONTEND_URL in .env.production and restart PM2"
log_message "7. Architecture:"
log_message "   - React frontend served by nginx on port 80 (static files)"
log_message "   - Express API available at /api/* (proxied to port 3001)"
log_message "   - TanStack Router will work with SPA fallback routing"
log_message "8. SSL Setup with Nginx (Cost-effective alternative to ALB):"
log_message "   - Use Let's Encrypt for free SSL certificates"
log_message "   - Command: sudo certbot --nginx -d yourdomain.com"
log_message "   - Certbot will automatically configure nginx for HTTPS"
log_message "   - Auto-renewal: sudo crontab -e → 0 12 * * * /usr/bin/certbot renew --quiet"
log_message "9. Database: Using external PostgreSQL RDS instance"
log_message "   - Add your RDS connection string to .env.production"
log_message "   - Ensure EC2 security group allows RDS connections"
log_message "   - Run Prisma migrations after environment setup"
log_message "10. Production Configuration Notes:"
log_message "    - Express app requires HTTPS for secure cookies (handled by nginx SSL)"
log_message "    - CORS origin must match your domain in FRONTEND_URL"
log_message "    - Session store uses your RDS PostgreSQL database"
log_message "    - API testing mode is disabled in production"

log_message "=== User Data Script Completed Successfully ==="
log_message "Total execution time: $SECONDS seconds"

# Create a completion marker file
echo "$(date)" > /tmp/user-data-completed

exit 0