// anita4/server/ecosystem.config.js
module.exports = {
    apps: [{
        name: "retreat-api",        // A descriptive name for your application in PM2
        script: "./dist/index.js",    // Path to your compiled server entry point (relative to `server/`)
        // Ensure this matches the output directory of your 'npm run build' (tsc)
        instances: 1,                  // Run a single instance (for "Single Instance" EB environment)
        exec_mode: "fork",             // Standard execution mode for Node.js applications
        env_production: {              // Environment variables specifically for PM2 when running in production mode
            NODE_ENV: "production",
            // PORT will be provided by the Elastic Beanstalk platform (usually 8081).
            // Your server/src/index.ts should listen on `process.env.PORT`.
        },
        log_date_format: "YYYY-MM-DD HH:mm:ss Z", // For consistent log timestamps
        out_file: "/dev/stdout",       // Send PM2 standard output to the instance's stdout (EB captures this)
        error_file: "/dev/stderr",     // Send PM2 standard error to the instance's stderr
        merge_logs: true,              // If true, combines out and error logs from PM2
        // watch: false,               // Disable watch mode in production on EB
        // max_memory_restart: '1G',   // Optional: restart if app exceeds memory limit
    }]
}