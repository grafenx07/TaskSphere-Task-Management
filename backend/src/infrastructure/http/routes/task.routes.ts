import { Router } from 'express';
import taskController from '@infrastructure/http/controllers/task.controller';
import { authenticate } from '@infrastructure/http/middlewares/auth.middleware';
import {
  validateCreateTask,
  validateUpdateTask,
  validateGetTaskById,
  validateDeleteTask,
  validateToggleTaskStatus,
  validateListTasks,
} from '@infrastructure/validation/task.validation';

const router = Router();

// All task routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/tasks/stats
 * @desc    Get task statistics for authenticated user
 * @access  Private
 */
router.get('/stats', taskController.getStats);

/**
 * @route   POST /api/v1/tasks
 * @desc    Create a new task
 * @access  Private
 */
router.post('/', validateCreateTask, taskController.createTask);

/**
 * @route   GET /api/v1/tasks
 * @desc    Get all tasks for authenticated user with filters
 * @access  Private
 */
router.get('/', validateListTasks, taskController.getTasks);

/**
 * @route   GET /api/v1/tasks/:id
 * @desc    Get a single task by ID
 * @access  Private
 */
router.get('/:id', validateGetTaskById, taskController.getTaskById);

/**
 * @route   PATCH /api/v1/tasks/:id/toggle
 * @desc    Toggle task status (TODO → IN_PROGRESS → COMPLETED → TODO)
 * @access  Private
 */
router.patch('/:id/toggle', validateToggleTaskStatus, taskController.toggleTaskStatus);

/**
 * @route   PATCH /api/v1/tasks/:id
 * @desc    Update a task
 * @access  Private
 */
router.patch('/:id', validateUpdateTask, taskController.updateTask);

/**
 * @route   DELETE /api/v1/tasks/:id
 * @desc    Delete a task
 * @access  Private
 */
router.delete('/:id', validateDeleteTask, taskController.deleteTask);

export default router;
