import prisma from '../../database/client';
import { Prisma } from '@prisma/client';

export interface CreateProjectInput {
  name: string;
  goal: string;
  deadline?: Date;
  teamSize?: number;
  experienceLevel?: string;
  technologyStack?: string[];
}

export interface UpdateProjectInput {
  name?: string;
  goal?: string;
  summary?: string;
  deadline?: Date;
  teamSize?: number;
  experienceLevel?: string;
  technologyStack?: string[];
  estimatedDurationDays?: number;
  status?: string;
}

export const projectRepository = {
  async findAll() {
    return prisma.project.findMany({
      include: {
        tasks: { include: { subtasks: true } },
        _count: { select: { tasks: true, aiExecutions: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async findById(id: string) {
    return prisma.project.findUnique({
      where: { id },
      include: {
        tasks: {
          include: { subtasks: true },
          orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
        },
        aiExecutions: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        _count: { select: { tasks: true, aiExecutions: true } },
      },
    });
  },

  async create(input: CreateProjectInput) {
    return prisma.project.create({
      data: {
        name: input.name,
        goal: input.goal,
        deadline: input.deadline,
        teamSize: input.teamSize ?? 1,
        experienceLevel: input.experienceLevel ?? 'intermediate',
        technologyStack: JSON.stringify(input.technologyStack ?? []),
      },
    });
  },

  async update(id: string, input: UpdateProjectInput) {
    const data: Prisma.ProjectUpdateInput = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.goal !== undefined) data.goal = input.goal;
    if (input.summary !== undefined) data.summary = input.summary;
    if (input.deadline !== undefined) data.deadline = input.deadline;
    if (input.teamSize !== undefined) data.teamSize = input.teamSize;
    if (input.experienceLevel !== undefined) data.experienceLevel = input.experienceLevel;
    if (input.technologyStack !== undefined) data.technologyStack = JSON.stringify(input.technologyStack);
    if (input.estimatedDurationDays !== undefined) data.estimatedDurationDays = input.estimatedDurationDays;
    if (input.status !== undefined) data.status = input.status;

    return prisma.project.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.project.delete({ where: { id } });
  },

  async getStats() {
    const [total, active, taskStats] = await Promise.all([
      prisma.project.count(),
      prisma.project.count({ where: { status: 'active' } }),
      prisma.task.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
    ]);

    const overdue = await prisma.task.count({
      where: {
        suggestedDeadline: { lt: new Date() },
        status: { not: 'DONE' },
      },
    });

    const aiPlans = await prisma.aIExecution.count({
      where: { validationStatus: 'success' },
    });

    return { total, active, taskStats, overdue, aiPlans };
  },
};
