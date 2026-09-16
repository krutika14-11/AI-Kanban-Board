import { taskRepository, CreateTaskInput, UpdateTaskInput } from './task.repository';
import { projectRepository } from '../projects/project.repository';
import { AppError } from '../../middleware/errorHandler';

const VALID_STATUSES = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];
const VALID_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

function parseTask(task: {
  tags: string;
  dependencies: string;
  subtasks?: unknown[];
  [key: string]: unknown;
}) {
  return {
    ...task,
    tags: safeParseJson(task.tags, []),
    dependencies: safeParseJson(task.dependencies, []),
  };
}

export const taskService = {
  async getByProject(projectId: string) {
    const project = await projectRepository.findById(projectId);
    if (!project) throw new AppError(404, `Project ${projectId} not found`);
    const tasks = await taskRepository.findByProject(projectId);
    return tasks.map(parseTask);
  },

  async getById(id: string) {
    const task = await taskRepository.findById(id);
    if (!task) throw new AppError(404, `Task ${id} not found`);
    return parseTask(task);
  },

  async create(input: CreateTaskInput) {
    const project = await projectRepository.findById(input.projectId);
    if (!project) throw new AppError(404, `Project ${input.projectId} not found`);
    const task = await taskRepository.create(input);
    return parseTask(task);
  },

  async update(id: string, input: UpdateTaskInput) {
    const existing = await taskRepository.findById(id);
    if (!existing) throw new AppError(404, `Task ${id} not found`);

    if (input.priority && !VALID_PRIORITIES.includes(input.priority)) {
      throw new AppError(400, `Invalid priority: ${input.priority}`);
    }
    if (input.status && !VALID_STATUSES.includes(input.status)) {
      throw new AppError(400, `Invalid status: ${input.status}`);
    }

    const task = await taskRepository.update(id, input);
    return parseTask(task);
  },

  async updateStatus(id: string, status: string) {
    if (!VALID_STATUSES.includes(status)) {
      throw new AppError(400, `Invalid status: ${status}. Must be one of: ${VALID_STATUSES.join(', ')}`);
    }
    const existing = await taskRepository.findById(id);
    if (!existing) throw new AppError(404, `Task ${id} not found`);
    const task = await taskRepository.updateStatus(id, status);
    return parseTask(task);
  },

  async delete(id: string) {
    const existing = await taskRepository.findById(id);
    if (!existing) throw new AppError(404, `Task ${id} not found`);
    return taskRepository.delete(id);
  },

  async updateSubtask(id: string, input: { title?: string; completed?: boolean }) {
    return taskRepository.updateSubtask(id, input);
  },

  async addSubtask(taskId: string, title: string, estimatedHours?: number) {
    const task = await taskRepository.findById(taskId);
    if (!task) throw new AppError(404, `Task ${taskId} not found`);
    return taskRepository.addSubtask(taskId, title, estimatedHours);
  },

  async deleteSubtask(id: string) {
    return taskRepository.deleteSubtask(id);
  },
};

function safeParseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
