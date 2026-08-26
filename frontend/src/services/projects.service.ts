import api from './api';
import { Project, DashboardStats, ApiResponse } from '../types';

export const projectsService = {
  async getAll(): Promise<Project[]> {
    const { data } = await api.get<ApiResponse<Project[]>>('/projects');
    return data.data;
  },

  async getById(id: string): Promise<Project> {
    const { data } = await api.get<ApiResponse<Project>>(`/projects/${id}`);
    return data.data;
  },

  async create(input: {
    name: string;
    goal: string;
    deadline?: string;
    teamSize?: number;
    experienceLevel?: string;
    technologyStack?: string[];
  }): Promise<Project> {
    const { data } = await api.post<ApiResponse<Project>>('/projects', input);
    return data.data;
  },

  async update(id: string, input: Partial<{
    name: string;
    goal: string;
    summary: string;
    deadline: string;
    teamSize: number;
    experienceLevel: string;
    technologyStack: string[];
    status: string;
  }>): Promise<Project> {
    const { data } = await api.put<ApiResponse<Project>>(`/projects/${id}`, input);
    return data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/projects/${id}`);
  },

  async getStats(): Promise<DashboardStats> {
    const { data } = await api.get<ApiResponse<DashboardStats>>('/projects/stats');
    return data.data;
  },
};
