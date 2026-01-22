import prisma from '@infrastructure/database/prisma/prisma.client';
import { AppError } from '@infrastructure/http/middlewares/app-error';
import {
  CreateTaskDTO,
  UpdateTaskDTO,
  TaskResponse,
  TaskFilters,
  TaskStatus,
} from '@application/interfaces/task.interface';
import { Prisma } from '@prisma/client';

class TaskService {
  /**
   * Create a new task for a user
   */
  async createTask(userId: string, data: CreateTaskDTO): Promise<TaskResponse> {
    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority ?? 0,
        dueDate: data.dueDate,
        userId,
      },
    });

    return task as unknown as TaskResponse;
  }

  /**
   * Get all tasks for a user with filters
   */
  async getUserTasks(
    userId: string,
    filters: TaskFilters
  ): Promise<{ tasks: TaskResponse[]; total: number; page: number; limit: number }> {
    const {
      status,
      priority,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = filters;

    // Build where clause
    const where: Prisma.TaskWhereInput = {
      userId,
      ...(status && { status }),
      ...(priority !== undefined && { priority }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    // Execute queries in parallel
    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.task.count({ where }),
    ]);

    return {
      tasks: tasks as unknown as TaskResponse[],
      total,
      page,
      limit,
    };
  }

  /**
   * Get a single task by ID
   * Ensures the task belongs to the requesting user
   */
  async getTaskById(taskId: string, userId: string): Promise<TaskResponse> {
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        userId,
      },
    });

    if (!task) {
      throw AppError.notFound('Task not found');
    }

    return task as unknown as TaskResponse;
  }

  /**
   * Update a task
   * Ensures the task belongs to the requesting user
   */
  async updateTask(taskId: string, userId: string, data: UpdateTaskDTO): Promise<TaskResponse> {
    // Verify task exists and belongs to user
    await this.getTaskById(taskId, userId);

    // Auto-set completedAt when status changes to COMPLETED
    const updateData: Prisma.TaskUpdateInput = {
      ...data,
    };

    if (data.status === (TaskStatus.COMPLETED as any)) {
      updateData.completedAt = new Date();
    } else if (data.status && data.status !== (TaskStatus.COMPLETED as any)) {
      updateData.completedAt = null;
    }

    const task = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
    });

    return task as unknown as TaskResponse;
  }

  /**
   * Delete a task
   * Ensures the task belongs to the requesting user
   */
  async deleteTask(taskId: string, userId: string): Promise<void> {
    // Verify task exists and belongs to user
    await this.getTaskById(taskId, userId);

    await prisma.task.delete({
      where: { id: taskId },
    });
  }

  /**
   * Toggle task status (TODO → IN_PROGRESS → COMPLETED → TODO)
   * Ensures the task belongs to the requesting user
   */
  async toggleTaskStatus(taskId: string, userId: string): Promise<TaskResponse> {
    // Verify task exists and belongs to user
    const task = await this.getTaskById(taskId, userId);

    // Determine next status
    let newStatus: TaskStatus;
    switch (task.status) {
      case 'TODO':
        newStatus = TaskStatus.IN_PROGRESS;
        break;
      case 'IN_PROGRESS':
        newStatus = TaskStatus.COMPLETED;
        break;
      case 'COMPLETED':
      case 'ARCHIVED':
        newStatus = TaskStatus.TODO;
        break;
      default:
        newStatus = TaskStatus.TODO;
    }

    // Update task with new status
    return this.updateTask(taskId, userId, { status: newStatus });
  }

  /**
   * Get task statistics for a user
   */
  async getTaskStats(userId: string): Promise<{
    total: number;
    todo: number;
    inProgress: number;
    completed: number;
    archived: number;
    overdue: number;
  }> {
    const now = new Date();

    const [total, todo, inProgress, completed, archived, overdue] = await Promise.all([
      prisma.task.count({ where: { userId } }),
      prisma.task.count({ where: { userId, status: 'TODO' } }),
      prisma.task.count({ where: { userId, status: 'IN_PROGRESS' } }),
      prisma.task.count({ where: { userId, status: 'COMPLETED' } }),
      prisma.task.count({ where: { userId, status: 'ARCHIVED' } }),
      prisma.task.count({
        where: {
          userId,
          status: { notIn: ['COMPLETED', 'ARCHIVED'] },
          dueDate: { lt: now },
        },
      }),
    ]);

    return {
      total,
      todo,
      inProgress,
      completed,
      archived,
      overdue,
    };
  }
}

export default new TaskService();
