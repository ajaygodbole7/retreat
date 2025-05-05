// src/middleware/errorHandler.ts
// ... (Keep AppError class and handlePrismaError helper as before) ...

import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

export class AppError extends Error {
    statusCode: number;
    status: string;
    isOperational: boolean;
    details?: any;
    constructor(message: string, statusCode: number, details?: any) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${ statusCode }`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
        this.details = details;
        Error.captureStackTrace(this, this.constructor);
    }
}

// --- Helper Function for Handling Prisma Errors ---
interface PrismaErrorResponse {
    statusCode: number;
    status: 'fail' | 'error';
    message: string;
    details: any;
}
function handlePrismaError(err: Prisma.PrismaClientKnownRequestError): PrismaErrorResponse {
    let statusCode = 400;
    let status: 'fail' | 'error' = 'fail';
    let message = 'Database request error.';
    const details = { code: err.code, meta: err.meta, name: err.name || 'PrismaKnownRequestError' };
    switch (err.code) {
        case 'P2002':
            statusCode = 409;
            message = `Conflict: A record with this identifier already exists.`;
            if (err.meta?.target && Array.isArray(err.meta.target)) {
                message += ` (Constraint failed on: ${ (err.meta.target as string[]).join(', ') })`;
            }
            break;
        case 'P2025':
            statusCode = 404;
            message = 'Resource not found. The item you tried to modify or delete does not exist.';
            break;
        case 'P2003':
            statusCode = 400;
            message = 'Invalid operation: Cannot perform action due to related data.';
            if (err.meta?.field_name) {
                message += ` (Check field: ${ err.meta.field_name })`;
            }
            break;
        default:
            // Use 'any' cast to access potential requestId property if attached to error object elsewhere
            console.warn(`Unhandled Prisma Known Request Error Code: ${ err.code } (Req ID: ${ (err as any).requestId || 'N/A' })`);
            break;
    }
    return { statusCode, status, message, details };
}

// --- Central Error Handling Middleware ---
export const errorHandler = (
    err: unknown,
    req: Request,
    res: Response,
    _next: NextFunction
): void => {
    const requestId = (req as any).id || 'N/A';
    let statusCode = 500;
    let status = 'error';
    let message = 'Internal Server Error';
    let errorDetails: any = {};
    let logLevel: 'error' | 'warn' = 'error';
    let clientSafeMessage = 'An internal error occurred.'; // Default client message

    // --- Error Type Identification ---
    if (err instanceof AppError) {
        // ... handle AppError ...
        statusCode = err.statusCode;
        status = err.status;
        message = err.message; // Original message for logging
        clientSafeMessage = err.message; // AppErrors are usually safe for client
        errorDetails = { name: err.name || 'AppError', details: err.details };
        logLevel = statusCode >= 500 ? 'error' : 'warn';
    } else if (err instanceof ZodError) {
        // ... handle ZodError ...
        statusCode = 400;
        status = 'fail';
        message = 'Validation Error'; // Original message for logging
        clientSafeMessage = 'Invalid input provided.'; // Generic client message
        errorDetails = { name: 'ZodValidationError', errors: err.errors };
        logLevel = 'warn';
    } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
        // ... handle Prisma errors ...
        const prismaResponse = handlePrismaError(err);
        statusCode = prismaResponse.statusCode;
        status = prismaResponse.status;
        message = prismaResponse.message; // Original message for logging
        clientSafeMessage = prismaResponse.message; // Prisma messages are often specific but generally safe
        errorDetails = prismaResponse.details;
        logLevel = statusCode >= 500 ? 'error' : 'warn';
    } else if (err instanceof SyntaxError && 'status' in err && err.status === 400 && 'body' in err) {
        // ... handle SyntaxError ...
        statusCode = 400;
        status = 'fail';
        message = 'Invalid JSON payload received.';
        clientSafeMessage = message;
        errorDetails = { name: 'SyntaxError', reason: err.message };
        logLevel = 'warn';
    } else if (err instanceof Error) {
        // ... handle generic Error ...
        statusCode = 500;
        status = 'error';
        message = err.message || 'An unexpected error occurred.'; // Original message for logging
        clientSafeMessage = 'An unexpected internal error occurred.'; // Generic client message
        errorDetails = { name: err.name || 'Error', stack: err.stack };
        logLevel = 'error';
        console.error(`Unhandled Generic Error Encountered (Req ID: ${ requestId }):`, err);
    } else {
        // ... handle unknown thrown type ...
        statusCode = 500;
        status = 'error';
        message = 'An unknown error occurred.';
        clientSafeMessage = 'An unexpected internal error occurred.';
        errorDetails = { type: typeof err, value: String(err).substring(0, 100) };
        logLevel = 'error';
        console.error(`Unknown Thrown Type Encountered (Req ID: ${ requestId }):`, err);
    }

    // --- Prepare Client Response Payload ---
    const responsePayload: { status: string; message: string; errors?: any; requestId: string } = {
        status: status,
        message: clientSafeMessage, // Use the client-safe message
        ...(errorDetails.errors && status === 'fail' && { errors: errorDetails.errors }), // Only show Zod errors
        requestId: requestId
    };

    // --- Store error message for the 'finish' listener in requestLogger ---
    // We use the original, more detailed message here for internal logging context
    res.locals.errorMessage = message; // Set the original error message

    // --- Log Detailed Error Information (Server-Side) ---
    const errorLog = { /* ... same detailed errorLog structure as before ... */
        level: logLevel, type: "error_response", timestamp: new Date().toISOString(),
        requestId: requestId,
        request: { method: req.method, url: req.originalUrl || req.url, sourceIp: req.ip || req.connection?.remoteAddress },
        error: {
            name: errorDetails.name || (err instanceof Error ? err.name : 'UnknownError'),
            message: message, // Log the original message
            details: errorDetails,
            stack: (logLevel === 'error' && errorDetails.stack) ? errorDetails.stack.substring(0, 1500) : undefined
        },
        response: { statusCode: statusCode, payloadSent: responsePayload }
    };
    if (errorLog.error.stack === undefined) delete errorLog.error.stack;
    if (errorLog.error.details?.errors === undefined && responsePayload.errors) { /* no-op */ }
    else if (errorLog.error.details?.errors) { delete errorLog.error.details.errors; }

    if (logLevel === 'error') console.error(JSON.stringify(errorLog));
    else console.warn(JSON.stringify(errorLog));

    // --- Send Response to Client ---
    if (!res.headersSent) {
        res.status(statusCode).json(responsePayload);
    } else {
        console.error(`Error Handler (Req ID: ${ requestId }): Headers already sent. Could not send error response for status ${ statusCode }. Error was: ${ message }`);
    }
};