import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { AppError } from '@infrastructure/http/middlewares/app-error';
import {
  createTaskSchema,
  updateTaskSchema,
  getTaskByIdSchema,
  deleteTaskSchema,
  toggleTaskStatusSchema,
  listTasksSchema,
} from './schemas/task.schema';

/**
 * Generic validation middleware
 */
const validate = (schema: AnyZodObject) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Apply transformed values back to request
      if (validated.body) req.body = validated.body;
      if (validated.query) req.query = validated.query;
      if (validated.params) req.params = validated.params;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        next(AppError.badRequest('Validation failed', formattedErrors));
      } else {
        next(error);
      }
    }
  };
};

/**
 * Validate create task request
 */
export const validateCreateTask = validate(createTaskSchema);

/**
 * Validate update task request
 */
export const validateUpdateTask = validate(updateTaskSchema);

/**
 * Validate get task by ID request
 */
export const validateGetTaskById = validate(getTaskByIdSchema);

/**
 * Validate delete task request
 */
export const validateDeleteTask = validate(deleteTaskSchema);

/**
 * Validate toggle task status request
 */
export const validateToggleTaskStatus = validate(toggleTaskStatusSchema);

/**
 * Validate list tasks request
 */
export const validateListTasks = validate(listTasksSchema);
