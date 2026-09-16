import prisma from '../../database/client';
import { Prisma } from '@prisma/client';

export interface CreateTaskInput {
  projectId: string;
  title: string;
  description?: string;
  priority?: string;
  status?: string;
  estimatedHours?: number;
  suggestedDeadline?: Date;
  actualDeadline?: Date;
  category?: string;
  tags?: string[];
  dependencies?: string[];
  executionOrder?: number;
  position?: number;
  subtasks?: Array<{ title: string; estimatedHours?: number }>;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  priority?: string;
  status?: string;
  estimatedHours?: number;
  suggestedDeadline?: Date;
  actualDeadline?: Date;
  category?: string;
  tags?: string[];
  dependencies?: string[];
  executionOrder?: number;
  position?: number;
}

export const taskRepository = {
  async findByProject(projectId: string) {
    return prisma.task.findMany({
      where: { projectId },
      include: { subtasks: true },
      orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
    });
  },

  async findById(id: string) {
    return prisma.task.findUnique({
      where: { id },
      include: { subtasks: true },
    });
  },

  async create(input: CreateTaskInput) {
    const { subtasks, ...rest } = input;
    return prisma.task.create({
      data: {
        ...rest,
        priority: rest.priority ?? 'MEDIUM',
        status: rest.status ?? 'TODO',
        tags: JSON.stringify(rest.tags ?? []),
        dependencies: JSON.stringify(rest.dependencies ?? []),
        position: rest.position ?? 0,
        subtasks: subtasks
          ? {
              create: subtasks.map(s => ({
                title: s.title,
                estimatedHours: s.estimatedHours,
              })),
            }
          : undefined,
      },
      include: { subtasks: true },
    });
  },

  async update(id: string, input: UpdateTaskInput) {
    const data: Prisma.TaskUpdateInput = {};
    if (input.title !== undefined) data.title = input.title;
    if (input.description !== undefined) data.description = input.description;
    if (input.priority !== undefined) data.priority = input.priority;
    if (input.status !== undefined) data.status = input.status;
    if (input.estimatedHours !== undefined) data.estimatedHours = input.estimatedHours;
    if (input.suggestedDeadline !== undefined) data.suggestedDeadline = input.suggestedDeadline;
    if (input.actualDeadline !== undefined) data.actualDeadline = input.actualDeadline;
    if (input.category !== undefined) data.category = input.category;
    if (input.tags !== undefined) data.tags = JSON.stringify(input.tags);
    if (input.dependencies !== undefined) data.dependencies = JSON.stringify(input.dependencies);
    if (input.executionOrder !== undefined) data.executionOrder = input.executionOrder;
    if (input.position !== undefined) data.position = input.position;

    return prisma.task.update({
      where: { id },
      data,
      include: { subtasks: true },
    });
  },

  async updateStatus(id: string, status: string) {
    return prisma.task.update({
      where: { id },
      data: { status },
      include: { subtasks: true },
    });
  },

  async delete(id: string) {
    return prisma.task.delete({ where: { id } });
  },

  async bulkCreate(tasks: CreateTaskInput[]) {
    return prisma.$transaction(
      tasks.map((t, i) => {
        const { subtasks, ...rest } = t;
        return prisma.task.create({
          data: {
            ...rest,
            priority: rest.priority ?? 'MEDIUM',
            status: rest.status ?? 'TODO',
            tags: JSON.stringify(rest.tags ?? []),
            dependencies: JSON.stringify(rest.dependencies ?? []),
            position: rest.position ?? i,
            subtasks: subtasks ? { create: subtasks.map(s => ({ title: s.title, estimatedHours: s.estimatedHours })) } : undefined,
          },
          include: { subtasks: true },
        });
      })
    );
  },

  async updateSubtask(id: string, input: { title?: string; completed?: boolean }) {
    return prisma.subtask.update({ where: { id }, data: input });
  },

  async addSubtask(taskId: string, title: string, estimatedHours?: number) {
    return prisma.subtask.create({ data: { taskId, title, estimatedHours } });
  },

  async deleteSubtask(id: string) {
    return prisma.subtask.delete({ where: { id } });
  },
};
