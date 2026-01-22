import { z } from 'zod';

/**
 * Task status enum for validation
 */
export const TaskStatusEnum = z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED']);

/**
 * Create task schema validation
 */
export const createTaskSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(1, 'Title is required')
      .max(255, 'Title must be less than 255 characters')
      .trim(),
    description: z
      .string()
      .max(5000, 'Description must be less than 5000 characters')
      .optional(),
    priority: z
      .number()
      .int('Priority must be an integer')
      .min(0, 'Priority must be at least 0')
      .max(10, 'Priority must be at most 10')
      .default(0)
      .optional(),
    dueDate: z
      .string()
      .refine((val) => {
        // Accept empty string as optional
        if (val === '') return true;
        // Try to parse the date - accepts both ISO8601 and datetime-local formats
        const date = new Date(val);
        return !isNaN(date.getTime());
      }, 'Invalid date format')
      .transform((str) => (str === '' ? undefined : new Date(str)))
      .optional(),
  }),
});

/**
 * Update task schema validation
 */
export const updateTaskSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid task ID format'),
  }),
  body: z.object({
    title: z
      .string()
      .min(1, 'Title cannot be empty')
      .max(255, 'Title must be less than 255 characters')
      .trim()
      .optional(),
    description: z
      .string()
      .max(5000, 'Description must be less than 5000 characters')
      .nullable()
      .optional(),
    status: TaskStatusEnum.optional(),
    priority: z
      .number()
      .int('Priority must be an integer')
      .min(0, 'Priority must be at least 0')
      .max(10, 'Priority must be at most 10')
      .optional(),
    dueDate: z
      .string()
      .refine((val) => {
        // Accept empty string or null as optional
        if (val === '' || val === null) return true;
        // Try to parse the date - accepts both ISO8601 and datetime-local formats
        const date = new Date(val);
        return !isNaN(date.getTime());
      }, 'Invalid date format')
      .transform((str) => (str === '' || str === null ? null : new Date(str)))
      .nullable()
      .optional(),
  }),
});

/**
 * Get task by ID schema validation
 */
export const getTaskByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid task ID format'),
  }),
});

/**
 * Delete task schema validation
 */
export const deleteTaskSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid task ID format'),
  }),
});

/**
 * Toggle task status schema validation
 */
export const toggleTaskStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid task ID format'),
  }),
});

/**
 * List tasks query schema validation
 */
export const listTasksSchema = z.object({
  query: z.object({
    status: TaskStatusEnum.optional(),
    priority: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : undefined))
      .pipe(z.number().int().min(0).max(10).optional()),
    search: z.string().max(255).optional(),
    sortBy: z.enum(['createdAt', 'dueDate', 'priority', 'title']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
    page: z
      .string()
      .optional()
      .default('1')
      .transform((val) => parseInt(val, 10))
      .pipe(z.number().int().min(1)),
    limit: z
      .string()
      .optional()
      .default('10')
      .transform((val) => parseInt(val, 10))
      .pipe(z.number().int().min(1).max(100)),
  }),
});

// Export types
export type CreateTaskInput = z.infer<typeof createTaskSchema>['body'];
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>['body'];
export type UpdateTaskParams = z.infer<typeof updateTaskSchema>['params'];
export type GetTaskByIdParams = z.infer<typeof getTaskByIdSchema>['params'];
export type DeleteTaskParams = z.infer<typeof deleteTaskSchema>['params'];
export type ToggleTaskStatusParams = z.infer<typeof toggleTaskStatusSchema>['params'];
export type ListTasksQuery = z.infer<typeof listTasksSchema>['query'];
