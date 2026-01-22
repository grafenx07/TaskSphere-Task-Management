import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import taskService from '@infrastructure/task/task.service';
import { CreateTaskDTO, UpdateTaskDTO, TaskFilters } from '@application/interfaces/task.interface';

class TaskController {
  /**
   * Create a new task
   * POST /api/v1/tasks
   */
  async createTask(req: Request, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const taskData: CreateTaskDTO = req.body;

    const task = await taskService.createTask(userId, taskData);

    res.status(StatusCodes.CREATED).json({
      status: 'success',
      data: { task },
    });
  }

  /**
   * Get all tasks for authenticated user
   * GET /api/v1/tasks
   */
  async getTasks(req: Request, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const filters: TaskFilters = req.query;

    const result = await taskService.getUserTasks(userId, filters);

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: {
        tasks: result.tasks,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: Math.ceil(result.total / result.limit),
        },
      },
    });
  }

  /**
   * Get a single task by ID
   * GET /api/v1/tasks/:id
   */
  async getTaskById(req: Request, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const { id } = req.params;

    const task = await taskService.getTaskById(id, userId);

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: { task },
    });
  }

  /**
   * Update a task
   * PATCH /api/v1/tasks/:id
   */
  async updateTask(req: Request, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const { id } = req.params;
    const updateData: UpdateTaskDTO = req.body;

    const task = await taskService.updateTask(id, userId, updateData);

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: { task },
    });
  }

  /**
   * Delete a task
   * DELETE /api/v1/tasks/:id
   */
  async deleteTask(req: Request, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const { id } = req.params;

    await taskService.deleteTask(id, userId);

    res.status(StatusCodes.NO_CONTENT).send();
  }

  /**
   * Toggle task status
   * PATCH /api/v1/tasks/:id/toggle
   */
  async toggleTaskStatus(req: Request, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const { id } = req.params;

    const task = await taskService.toggleTaskStatus(id, userId);

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: { task },
    });
  }

  /**
   * Get task statistics
   * GET /api/v1/tasks/stats
   */
  async getStats(req: Request, res: Response): Promise<void> {
    const userId = req.user!.userId;

    const stats = await taskService.getTaskStats(userId);

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: { stats },
    });
  }
}

export default new TaskController();
