import { Request, Response } from 'express';
import { projectService } from './project.service';
import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(1).max(200),
  goal: z.string().min(10).max(2000),
  deadline: z.string().datetime().optional(),
  teamSize: z.number().int().min(1).max(100).optional(),
  experienceLevel: z.enum(['junior', 'intermediate', 'senior', 'mixed']).optional(),
  technologyStack: z.array(z.string()).optional(),
});

export const updateProjectSchema = createProjectSchema.partial().extend({
  summary: z.string().max(2000).optional(),
  status: z.enum(['active', 'completed', 'archived', 'on-hold']).optional(),
  estimatedDurationDays: z.number().int().min(1).optional(),
});

export const projectController = {
  async getAll(req: Request, res: Response) {
    const projects = await projectService.getAll();
    res.json({ success: true, data: projects });
  },

  async getById(req: Request, res: Response) {
    const project = await projectService.getById(req.params.id);
    res.json({ success: true, data: project });
  },

  async create(req: Request, res: Response) {
    const input = createProjectSchema.parse(req.body);
    const project = await projectService.create({
      ...input,
      deadline: input.deadline ? new Date(input.deadline) : undefined,
    });
    res.status(201).json({ success: true, data: project });
  },

  async update(req: Request, res: Response) {
    const input = updateProjectSchema.parse(req.body);
    const project = await projectService.update(req.params.id, {
      ...input,
      deadline: input.deadline ? new Date(input.deadline) : undefined,
    });
    res.json({ success: true, data: project });
  },

  async delete(req: Request, res: Response) {
    await projectService.delete(req.params.id);
    res.json({ success: true, message: 'Project deleted' });
  },

  async getStats(req: Request, res: Response) {
    const stats = await projectService.getStats();
    res.json({ success: true, data: stats });
  },
};
