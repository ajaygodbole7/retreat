import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

interface ValidateRequestOptions {
    params?: AnyZodObject;
    query?: AnyZodObject;
    body?: AnyZodObject;
}

export const validateRequest = (options: ValidateRequestOptions) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (options.params) {
                req.params = await options.params.parseAsync(req.params);
            }

            if (options.query) {
                req.query = await options.query.parseAsync(req.query);
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