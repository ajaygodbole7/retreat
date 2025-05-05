// src/middleware/requestLogger.ts
import { Request, Response, NextFunction } from 'express';
import { selectAndRedactHeaders, createRedactedCopy } from '../utils/loggingUtils';

// Read config from environment variables at startup
const logDetailedEnabled = process.env.LOG_DETAILED_ENABLED === 'true';
const logRequestBodyEnabled = process.env.LOG_REQUEST_BODY_ENABLED === 'true';

// Log initial status on startup
if (logDetailedEnabled) {
    console.log("Detailed Request Logging ENABLED.");
    if (logRequestBodyEnabled) console.log(" > Request Body Logging ENABLED.");
    else console.log(" > Request Body Logging DISABLED.");
} else {
    console.log("Detailed Request Logging DISABLED.");
}

export const logRequestResponseInfo = (req: Request, res: Response, next: NextFunction) => {
    const startTime = process.hrtime(); // Start timer for duration

    // Log essential request info immediately if detailed logging is on
    if (logDetailedEnabled) {
        const requestLog: any = { // Use 'any' for flexibility during build
            level: "info", // Or "debug"
            type: "request_start",
            timestamp: new Date().toISOString(),
            requestId: (req as any).id, // Assert 'any' to access id
            method: req.method,
            url: req.originalUrl || req.url,
            sourceIp: req.ip || req.connection?.remoteAddress,
            headers: selectAndRedactHeaders(req.headers), // Log selected+redacted headers
        };
        // Include redacted body if enabled and present
        if (logRequestBodyEnabled && req.body && Object.keys(req.body).length > 0) {
            requestLog.body = createRedactedCopy(req.body);
        }

        // Use console.log for simplicity, replace with logger.info/debug later
        console.log(JSON.stringify(requestLog));
    }

    // Add listener for response finish event
    res.on('finish', () => {
        // Calculate duration
        const hrtime = process.hrtime(startTime);
        const durationMs = hrtime[0] * 1000 + hrtime[1] / 1e6;

        // Check res.locals for an error message set by the errorHandler
        const errorMessage = res.locals.errorMessage;

        const responseLog: any = { // Use 'any' for flexibility
            level: res.statusCode >= 400 ? "warn" : "info", // Log 4xx/5xx as warn/error
            type: "request_finish",
            timestamp: new Date().toISOString(),
            requestId: (req as any).id, // Assert 'any' to access id
            method: req.method,
            url: req.originalUrl || req.url,
            statusCode: res.statusCode,
            durationMs: parseFloat(durationMs.toFixed(3)) // Log duration
        };

        // Add error message if it exists (from errorHandler)
        if (errorMessage) {
            responseLog.errorMessage = errorMessage;
            // Optionally upgrade log level if there's an error message, even for 4xx
            if (responseLog.level === 'warn') responseLog.level = 'error';
        }

        // Always log finished request if detailed logging is on,
        // OR if it's an error (status >= 400), ensuring errors are always logged at finish.
        if (logDetailedEnabled || responseLog.statusCode >= 400) {
            console.log(JSON.stringify(responseLog));
        }
    });

    next(); // Pass control to the next middleware
};