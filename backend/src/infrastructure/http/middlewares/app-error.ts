import { StatusCodes } from 'http-status-codes';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errors?: any;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR, errors?: any) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

  // Static factory methods for common errors
  static badRequest(message: string = 'Bad Request', errors?: any): AppError {
    return new AppError(message, StatusCodes.BAD_REQUEST, errors);
  }

  static unauthorized(message: string = 'Unauthorized'): AppError {
    return new AppError(message, StatusCodes.UNAUTHORIZED);
  }

  static forbidden(message: string = 'Forbidden'): AppError {
    return new AppError(message, StatusCodes.FORBIDDEN);
  }

  static notFound(message: string = 'Resource not found'): AppError {
    return new AppError(message, StatusCodes.NOT_FOUND);
  }

  static conflict(message: string = 'Conflict'): AppError {
    return new AppError(message, StatusCodes.CONFLICT);
  }

  static internal(message: string = 'Internal Server Error'): AppError {
    return new AppError(message, StatusCodes.INTERNAL_SERVER_ERROR);
  }

  static validationError(message: string = 'Validation Error', errors?: any): AppError {
    return new AppError(message, StatusCodes.UNPROCESSABLE_ENTITY, errors);
  }
}
