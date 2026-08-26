import { z } from 'zod';

export const SubtaskSchema = z.object({
  title: z.string().min(1).max(300),
  estimatedHours: z.number().min(0).max(200).optional(),
});

export const TaskSchema = z.object({
  title: z.string().min(1).max(300),
  description: z.string().max(2000).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  status: z.enum(['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']).default('TODO'),
  estimatedHours: z.number().min(0).max(1000).optional(),
  suggestedDeadline: z.string().optional(),
  category: z.string().max(100).optional(),
  tags: z.array(z.string().max(50)).default([]),
  dependencies: z.array(z.string().max(300)).default([]),
  executionOrder: z.number().int().min(0).optional(),
  subtasks: z.array(SubtaskSchema).default([]),
});

export const AIPlanSchema = z.object({
  project: z.object({
    name: z.string().min(1).max(200),
    summary: z.string().max(2000),
    estimatedDurationDays: z.number().int().min(1).max(3650).optional(),
  }),
  tasks: z.array(TaskSchema).min(1).max(50),
});

export type AITask = z.infer<typeof TaskSchema>;
export type AIPlan = z.infer<typeof AIPlanSchema>;
