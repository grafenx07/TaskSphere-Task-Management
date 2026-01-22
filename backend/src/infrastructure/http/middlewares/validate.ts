import { Request, Response, NextFunction } from 'express';
import { AppError } from './app-error';

/**
 * Validation middleware factory
 * Can be used with validation libraries like Zod, Joi, or Yup
 */
export const validate = (schema: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Example with Zod (install zod package to use)
      // await schema.parseAsync({
      //   body: req.body,
      //   query: req.query,
      //   params: req.params,
      // });

      next();
    } catch (error: any) {
      const errors = error.errors?.map((err: any) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      throw AppError.validationError('Validation failed', errors);
    }
  };
};
