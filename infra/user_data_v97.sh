#!/bin/bash

#===============================================================================
# AWS EC2 User Data Script for Node.js/React/Express Application
# Minimal setup - complex scripts downloaded after boot
#===============================================================================

set -e
exec > >(tee /var/log/user-data.log | logger -t user-data -s 2>/dev/console) 2>&1

log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

error_exit() {
    log_message "ERROR: $1"
    exit 1
}

log_message "=== Starting EC2 User Data Script ==="

#-------------------------------------------------------------------------------
# SYSTEM UPDATES AND PACKAGE INSTALLATION
#-------------------------------------------------------------------------------

log_message "Updating system packages..."
dnf update -y || error_exit "Failed to update system"

log_message "Installing essential packages..."
dnf install -y --allowerasing gcc-c++ make git wget curl nginx firewalld htop tree vim certbot python3-certbot-nginx bind-utils || error_exit "Failed to install packages"

#-------------------------------------------------------------------------------
# SWAP CONFIGURATION (512MB for t2.micro)
#-------------------------------------------------------------------------------

if [ ! -f /swapfile ]; then
    dd if=/dev/zero of=/swapfile bs=1M count=512
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    log_message "Swap file created (512MB)"
fi

#-------------------------------------------------------------------------------
# NODE.JS SETUP
#-------------------------------------------------------------------------------

log_message "Installing NVM and Node.js..."
sudo -u ec2-user bash -c 'curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash'
sudo -u ec2-user bash -c 'export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" && nvm install --lts && npm install -g pm2@latest'

#-------------------------------------------------------------------------------
# DIRECTORY SETUP
#-------------------------------------------------------------------------------

mkdir -p /home/ec2-user/retreat-app/{server,frontend,logs,scripts}
mkdir -p /var/www/html/retreat-app
chown -R ec2-user:ec2-user /home/ec2-user/retreat-app
chown -R nginx:nginx /var/www/html/retreat-app

# Create basic environment file
sudo -u ec2-user bash -c 'cat > /home/ec2-user/retreat-app/server/.env.production << "EOF"
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://username:password@your-rds-endpoint:5432/database_name
JWT_SECRET=your-super-secure-jwt-secret-change-me-in-production
SESSION_SECRET=your-super-secure-session-secret-change-me-in-production
FRONTEND_URL=http://YOUR_ELASTIC_IP
LOG_DETAILED_ENABLED=false
LOG_REQUEST_BODY_ENABLED=false
ALLOW_API_TESTING=false
EOF'

# Create PM2 ecosystem config
sudo -u ec2-user bash -c 'cat > /home/ec2-user/retreat-app/server/ecosystem.config.js << "EOF"
module.exports = {
    apps: [{
        name: "retreat-api",
        script: "./dist/index.js",
        instances: 1,
        exec_mode: "fork",
        env: {
            NODE_ENV: "production",
            PORT: "3001",
        },
        log_date_format: "YYYY-MM-DD HH:mm:ss Z",
        out_file: "/dev/stdout",
        error_file: "/dev/stderr",
        merge_logs: true,
        max_memory_restart: "400M",
        node_args: "--max-old-space-size=384"
    }]
};
EOF'

#-------------------------------------------------------------------------------
# NGINX CONFIGURATION
#-------------------------------------------------------------------------------

cat > /etc/nginx/conf.d/retreat-app.conf << 'EOF'
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=general:10m rate=30r/s;

upstream nodejs_backend {
    server 127.0.0.1:3001;
    keepalive 64;
}

server {
    listen 80;
    server_name _;
    root /var/www/html/retreat-app;
    index index.html index.htm;
    
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    server_tokens off;
    
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|webp|avif)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }
    
    location ~* \.html$ {
        expires 1h;
        add_header Cache-Control "public, must-revalidate";
        try_files $uri =404;
    }
    
    location /health {
        limit_req zone=general burst=5 nodelay;
        proxy_pass http://nodejs_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 3s;
        proxy_send_timeout 3s;
        proxy_read_timeout 3s;
    }
    
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
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        proxy_buffering on;
        proxy_buffer_size 128k;
        proxy_buffers 4 256k;
        proxy_busy_buffers_size 256k;
    }
    
    # React SPA served by Nginx (static files)
    location / {
        limit_req zone=general burst=50 nodelay;
        try_files $uri $uri/ /index.html; # Serve file, directory, or fallback to index.html for SPA routing
    }
    
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

nginx -t || error_exit "Nginx configuration test failed"

#-------------------------------------------------------------------------------
# FIREWALL AND SERVICES
#-------------------------------------------------------------------------------

systemctl start firewalld
systemctl enable firewalld
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --permanent --add-service=ssh
firewall-cmd --reload

systemctl enable nginx
systemctl start nginx

#-------------------------------------------------------------------------------
# PM2 STARTUP
#-------------------------------------------------------------------------------

sudo -u ec2-user bash -c 'export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" && pm2 startup | grep "sudo.*pm2" | bash && pm2 save'

#-------------------------------------------------------------------------------
# ENVIRONMENT SETUP
#-------------------------------------------------------------------------------

sudo -u ec2-user bash -c 'cat >> ~/.bashrc << "EOF"
export NODE_ENV=production
export NODE_OPTIONS="--max-old-space-size=384"
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
export PM2_HOME="$HOME/.pm2"
export APP_DIR="$HOME/retreat-app"
alias app-logs="pm2 logs retreat-api"
alias app-status="pm2 status"
alias app-restart="pm2 restart retreat-api"
alias app-deploy="cd /home/ec2-user/retreat-app && ./scripts/deploy.sh"
alias nginx-reload="sudo systemctl reload nginx"
alias nginx-status="sudo systemctl status nginx"
EOF'

#-------------------------------------------------------------------------------
# DOWNLOAD DEPLOYMENT SCRIPTS
#-------------------------------------------------------------------------------

log_message "Creating deployment scripts..."

# Simple health check
sudo -u ec2-user bash -c 'cat > /home/ec2-user/retreat-app/scripts/health-check.sh << "EOF"
#!/bin/bash
LOG_FILE="/home/ec2-user/retreat-app/logs/health-check.log"
API_HEALTH_URL="http://localhost:3001/health"
log_health() {
    echo "[$(date "+%Y-%m-%d %H:%M:%S")] $1" >> "$LOG_FILE"
}
if curl -f -s "$API_HEALTH_URL" > /dev/null; then
    log_health "SUCCESS: retreat-api Express server is healthy"
    exit 0
else
    log_health "ERROR: retreat-api Express server health check failed"
    exit 1
fi
EOF'

# Simple deploy script
sudo -u ec2-user bash -c 'cat > /home/ec2-user/retreat-app/scripts/deploy.sh << "EOF"
#!/bin/bash
set -e
APP_DIR="/home/ec2-user/retreat-app"
SERVER_DIR="$APP_DIR/server"
FRONTEND_DIR="$APP_DIR/frontend"
WEB_ROOT="/var/www/html/retreat-app"

echo "Starting deployment..."

# Verify structure
[ ! -d "$SERVER_DIR" ] && echo "ERROR: server/ directory not found" && exit 1
[ ! -d "$FRONTEND_DIR" ] && echo "ERROR: frontend/ directory not found" && exit 1
[ ! -f "$SERVER_DIR/dist/index.js" ] && echo "ERROR: server/dist/index.js not found" && exit 1
[ ! -d "$FRONTEND_DIR/dist" ] && echo "ERROR: frontend/dist/ not found" && exit 1

# Deploy frontend
echo "Deploying React frontend..."
sudo cp -r "$FRONTEND_DIR/dist/"* "$WEB_ROOT/"
sudo chown -R nginx:nginx "$WEB_ROOT"
sudo chmod -R 755 "$WEB_ROOT"

# Deploy backend
cd "$SERVER_DIR"
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Handle dependencies
if [ -d "node_modules" ]; then
    echo "Using uploaded node_modules..."
else
    echo "Installing dependencies..."
    if [ -f "package-lock.json" ]; then
        npm ci --omit=dev --silent
    else
        npm install --omit=dev --silent
    fi
    if grep -q "@prisma" package.json 2>/dev/null; then
        npx prisma generate
    fi
fi

# Start app
pm2 delete retreat-api 2>/dev/null || true
pm2 start ecosystem.config.js
sleep 10
pm2 save
sudo systemctl reload nginx

# Health check
if /home/ec2-user/retreat-app/scripts/health-check.sh; then
    echo "✅ Deployment successful!"
    echo "Frontend: http://$(curl -s http://checkip.amazonaws.com)/"
    echo "API: http://$(curl -s http://checkip.amazonaws.com)/api/"
    echo "⚠️  Run setup-ssl.sh for HTTPS"
else
    echo "❌ Health check failed"
    pm2 logs retreat-api --lines 20
    exit 1
fi
EOF'

# SSL setup script (minimal)
sudo -u ec2-user bash -c 'cat > /home/ec2-user/retreat-app/scripts/setup-ssl.sh << "EOF"
#!/bin/bash
set -e
SERVER_IP=$(curl -s http://checkip.amazonaws.com)
DOMAIN="$SERVER_IP.nip.io"
echo "Setting up SSL for $DOMAIN..."

# Update nginx config
sudo sed -i "s/server_name _;/server_name $DOMAIN;/" /etc/nginx/conf.d/retreat-app.conf
sudo nginx -t && sudo systemctl reload nginx

# Get certificate
sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN --redirect

# Update app config
sudo -u ec2-user sed -i "s|FRONTEND_URL=http://.*|FRONTEND_URL=https://$DOMAIN|" /home/ec2-user/retreat-app/server/.env.production

# Restart app
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
pm2 restart retreat-api

# Setup auto-renewal
(sudo crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | sudo crontab -

echo "✅ SSL setup complete!"
echo "Your app: https://$DOMAIN"
EOF'

chmod +x /home/ec2-user/retreat-app/scripts/*.sh

#-------------------------------------------------------------------------------
# SYSTEM OPTIMIZATION
#-------------------------------------------------------------------------------

cat >> /etc/security/limits.conf << 'EOF'
ec2-user soft nofile 65536
ec2-user hard nofile 65536
ec2-user soft nproc 32768
ec2-user hard nproc 32768
EOF

cat > /etc/sysctl.d/99-nodejs-optimization.conf << 'EOF'
net.core.somaxconn = 65536
net.core.netdev_max_backlog = 5000
net.ipv4.tcp_max_syn_backlog = 8192
vm.swappiness = 10
vm.dirty_ratio = 15
vm.dirty_background_ratio = 5
EOF

sysctl -p /etc/sysctl.d/99-nodejs-optimization.conf

#-------------------------------------------------------------------------------
# COMPLETION
#-------------------------------------------------------------------------------

log_message "=== User Data Script Completed Successfully ==="
log_message "Next steps:"
log_message "1. Build locally: npm run build (frontend & server)"
log_message "2. Transfer files to /home/ec2-user/retreat-app/"
log_message "3. Configure .env.production with RDS details"
log_message "4. Run: ./scripts/deploy.sh"
log_message "5. Run: ./scripts/setup-ssl.sh"
log_message "Instance ready for deployment!"

echo "$(date)" > /tmp/user-data-completed
exit 0