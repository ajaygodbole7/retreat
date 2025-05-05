import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodTypeAny } from 'zod';

interface ValidateRequestOptions {
    params?: ZodTypeAny;
    query?: ZodTypeAny;
    body?: ZodTypeAny;
}

export const validateRequest = (options: ValidateRequestOptions) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (options.params) {
                req.params = await options.params.parseAsync(req.params);
            }

            if (options.query) {
                // Validate the query parameters
                const validatedQuery = await options.query.parseAsync(req.query);

                // Clear and update the query object properties individually
                // This preserves the original req.query object but updates its contents
                const originalQuery = req.query;

                // Remove all existing properties
                Object.keys(originalQuery).forEach(key => {
                    delete (originalQuery as any)[key];
                });

                // Add the validated properties
                Object.entries(validatedQuery).forEach(([key, value]) => {
                    (originalQuery as any)[key] = value;
                });

                // Now req.query contains the validated data without reassigning the object
            }

            if (options.body) {
                req.body = await options.body.parseAsync(req.body);
            }

            next();
        } catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({
                    status: 'error',
                    message: 'Validation error',
                    errors: error.errors
                });
                return;
            }

            next(error);
        }
    };
};