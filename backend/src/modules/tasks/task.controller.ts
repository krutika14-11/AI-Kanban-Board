import { Request, Response } from 'express';
import { taskService } from './task.service';
import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().min(1).max(300),
  description: z.string().max(2000).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  status: z.enum(['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']).optional(),
  estimatedHours: z.number().min(0).max(1000).optional(),
  suggestedDeadline: z.string().datetime().optional(),
  actualDeadline: z.string().datetime().optional(),
  category: z.string().max(100).optional(),
  tags: z.array(z.string()).optional(),
  dependencies: z.array(z.string()).optional(),
  executionOrder: z.number().int().min(0).optional(),
  position: z.number().int().min(0).optional(),
  subtasks: z.array(z.object({
    title: z.string().min(1).max(300),
    estimatedHours: z.number().min(0).optional(),
  })).optional(),
});

const updateTaskSchema = createTaskSchema.partial();

const updateStatusSchema = z.object({
  status: z.enum(['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']),
});

const updateSubtaskSchema = z.object({
  title: z.string().trim().min(1).max(300).optional(),
  completed: z.boolean().optional(),
}).refine(input => input.title !== undefined || input.completed !== undefined, {
  message: 'Provide a title or completed value',
});

export const taskController = {
  async getByProject(req: Request, res: Response) {
    const tasks = await taskService.getByProject(req.params.projectId);
    res.json({ success: true, data: tasks });
  },

  async getById(req: Request, res: Response) {
    const task = await taskService.getById(req.params.id);
    res.json({ success: true, data: task });
  },

  async create(req: Request, res: Response) {
    const input = createTaskSchema.parse(req.body);
    const task = await taskService.create({
      projectId: req.params.projectId,
      ...input,
      suggestedDeadline: input.suggestedDeadline ? new Date(input.suggestedDeadline) : undefined,
      actualDeadline: input.actualDeadline ? new Date(input.actualDeadline) : undefined,
    });
    res.status(201).json({ success: true, data: task });
  },

  async update(req: Request, res: Response) {
    const input = updateTaskSchema.parse(req.body);
    const task = await taskService.update(req.params.id, {
      ...input,
      suggestedDeadline: input.suggestedDeadline ? new Date(input.suggestedDeadline) : undefined,
      actualDeadline: input.actualDeadline ? new Date(input.actualDeadline) : undefined,
    });
    res.json({ success: true, data: task });
  },

  async updateStatus(req: Request, res: Response) {
    const { status } = updateStatusSchema.parse(req.body);
    const task = await taskService.updateStatus(req.params.id, status);
    res.json({ success: true, data: task });
  },

  async delete(req: Request, res: Response) {
    await taskService.delete(req.params.id);
    res.json({ success: true, message: 'Task deleted' });
  },

  async updateSubtask(req: Request, res: Response) {
    const input = updateSubtaskSchema.parse(req.body);
    const subtask = await taskService.updateSubtask(req.params.id, input);
    res.json({ success: true, data: subtask });
  },

  async addSubtask(req: Request, res: Response) {
    const { title, estimatedHours } = z.object({
      title: z.string().min(1).max(300),
      estimatedHours: z.number().min(0).optional(),
    }).parse(req.body);
    const subtask = await taskService.addSubtask(req.params.taskId, title, estimatedHours);
    res.status(201).json({ success: true, data: subtask });
  },

  async deleteSubtask(req: Request, res: Response) {
    await taskService.deleteSubtask(req.params.id);
    res.json({ success: true, message: 'Subtask deleted' });
  },
};
