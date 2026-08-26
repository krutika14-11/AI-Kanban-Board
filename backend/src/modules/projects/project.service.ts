import { projectRepository, CreateProjectInput, UpdateProjectInput } from './project.repository';
import { AppError } from '../../middleware/errorHandler';

export const projectService = {
  async getAll() {
    const projects = await projectRepository.findAll();
    return projects.map(p => ({
      ...p,
      technologyStack: safeParseJson(p.technologyStack, []),
    }));
  },

  async getById(id: string) {
    const project = await projectRepository.findById(id);
    if (!project) throw new AppError(404, `Project ${id} not found`);
    return {
      ...project,
      technologyStack: safeParseJson(project.technologyStack, []),
      tasks: project.tasks.map(t => ({
        ...t,
        tags: safeParseJson(t.tags, []),
        dependencies: safeParseJson(t.dependencies, []),
      })),
    };
  },

  async create(input: CreateProjectInput) {
    return projectRepository.create(input);
  },

  async update(id: string, input: UpdateProjectInput) {
    const existing = await projectRepository.findById(id);
    if (!existing) throw new AppError(404, `Project ${id} not found`);
    const updated = await projectRepository.update(id, input);
    return {
      ...updated,
      technologyStack: safeParseJson(updated.technologyStack, []),
    };
  },

  async delete(id: string) {
    const existing = await projectRepository.findById(id);
    if (!existing) throw new AppError(404, `Project ${id} not found`);
    return projectRepository.delete(id);
  },

  async getStats() {
    return projectRepository.getStats();
  },
};

function safeParseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
