import api from './api';
import { Task, TaskStatus, ApiResponse } from '../types';

export const tasksService = {
  async getByProject(projectId: string): Promise<Task[]> {
    const { data } = await api.get<ApiResponse<Task[]>>(`/projects/${projectId}/tasks`);
    return data.data;
  },

  async create(projectId: string, input: Partial<Task> & { title: string }): Promise<Task> {
    const { data } = await api.post<ApiResponse<Task>>(`/projects/${projectId}/tasks`, input);
    return data.data;
  },

  async update(id: string, input: Partial<Task>): Promise<Task> {
    const { data } = await api.put<ApiResponse<Task>>(`/tasks/${id}`, input);
    return data.data;
  },

  async updateStatus(id: string, status: TaskStatus): Promise<Task> {
    const { data } = await api.patch<ApiResponse<Task>>(`/tasks/${id}/status`, { status });
    return data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`);
  },

  async updateSubtask(id: string, completed: boolean): Promise<void> {
    await api.patch(`/tasks/subtasks/${id}`, { completed });
  },

  async addSubtask(taskId: string, title: string, estimatedHours?: number): Promise<void> {
    await api.post(`/tasks/${taskId}/subtasks`, { title, estimatedHours });
  },

  async deleteSubtask(id: string): Promise<void> {
    await api.delete(`/tasks/subtasks/${id}`);
  },
};
