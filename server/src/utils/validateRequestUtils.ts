// src/utils/validateRequestUtils.ts
import { Request } from 'express';
import { z } from 'zod';
import { AppError } from '../middleware/errorHandler';
import { HttpStatus } from '../constants/httpStatus';

/**
 * Parses and validates a value using a Zod schema
 * @param schema Zod schema to validate against
 * @param data Data to validate
 * @returns Validated and typed data
 */
export function parseWithZod<T extends z.ZodType>(schema: T, data: unknown): z.infer<T> {
    try {
        return schema.parse(data);
    } catch (error) {
        if (error instanceof z.ZodError) {
            // Convert Zod error to AppError with formatted validation details
            const errorMessage = error.errors.map(e =>
                `${e.path.join('.')}: ${e.message}`
            ).join(', ');

            throw new AppError(`Validation error: ${errorMessage}`, HttpStatus.BAD_REQUEST);
        }
        throw error;
    }
}

/**
 * Helper to safely parse a string to integer with error handling
 * @param value String value to parse
 * @param errorMessage Optional custom error message
 * @returns Parsed integer
 * @throws AppError if parsing fails
 */
export function parseIntSafe(value: string | undefined, errorMessage?: string): number {
    if (!value) {
        throw new AppError(errorMessage || 'ID parameter is required', HttpStatus.BAD_REQUEST);
    }

    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
        throw new AppError(errorMessage || 'ID must be a valid number', HttpStatus.BAD_REQUEST);
    }

    return parsed;
}

/**
 * Convenient function to parse and validate request params
 * @param req Express request object
 * @param paramName Name of the parameter to extract and parse
 * @param errorMessage Optional custom error message
 * @returns Parsed integer
 */
export function parseIdParam(req: Request, paramName: string = 'id', errorMessage?: string): number {
    return parseIntSafe(req.params[paramName], errorMessage || `Invalid ${paramName} parameter`);
}

/**
 * Convenient function to parse and validate request body with Zod
 * @param req Express request object 
 * @param schema Zod schema to validate against
 * @returns Validated and typed request body
 */
export function parseBody<T extends z.ZodType>(req: Request, schema: T): z.infer<T> {
    return parseWithZod(schema, req.body);
}

/**
 * Convenient function to parse and validate request query with Zod
 * @param req Express request object
 * @param schema Zod schema to validate against
 * @returns Validated and typed query params
 */
export function parseQuery<T extends z.ZodType>(req: Request, schema: T): z.infer<T> {
    return parseWithZod(schema, req.query);
}