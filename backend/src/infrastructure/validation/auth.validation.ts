import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { AppError } from '@infrastructure/http/middlewares/app-error';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} from './schemas/auth.schema';

/**
 * Generic Zod validation middleware factory
 */
const validateSchema = (schema: AnyZodObject) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.slice(1).join('.'), // Remove 'body', 'query', or 'params' prefix
          message: err.message,
        }));

        throw AppError.validationError('Validation failed', errors);
      }
      next(error);
    }
  };
};

/**
 * Validate registration input using Zod
 */
export const validateRegister = validateSchema(registerSchema);

/**
 * Validate login input using Zod
 * Ensures email and password are provided and meet format requirements
 */
export const validateLogin = validateSchema(loginSchema);

/**
 * Validate refresh token input using Zod
 * Checks for refresh token in both cookie and request body
 */
export const validateRefreshToken = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    // Check for refresh token in cookie first
    const cookieToken = req.cookies?.refreshToken;
    const bodyToken = req.body?.refreshToken;

    // Use cookie token if available, otherwise fall back to body
    if (cookieToken) {
      req.body.refreshToken = cookieToken;
    } else if (!bodyToken) {
      throw AppError.badRequest('Refresh token is required');
    }

    await refreshTokenSchema.parseAsync({
      body: req.body,
    });

    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = error.errors.map((err) => ({
        field: err.path.slice(1).join('.'),
        message: err.message,
      }));

      throw AppError.validationError('Validation failed', errors);
    }
    next(error);
  }
};
