import api from './api';
import { GeneratePlanResult, AIStatus, RAGSearchResult, AIExecution, ApiResponse } from '../types';

export const aiService = {
  async generatePlan(input: {
    projectId: string;
    goal: string;
    deadline?: string;
    teamSize?: number;
    experienceLevel?: string;
    technologyStack?: string[];
  }): Promise<GeneratePlanResult> {
    const { data } = await api.post<ApiResponse<GeneratePlanResult>>('/ai/generate-plan', input);
    return data.data;
  },

  async getStatus(): Promise<AIStatus> {
    const { data } = await api.get<ApiResponse<AIStatus>>('/ai/status');
    return data.data;
  },

  async getExecutionHistory(projectId: string): Promise<AIExecution[]> {
    const { data } = await api.get<ApiResponse<AIExecution[]>>(`/ai/executions/${projectId}`);
    return data.data;
  },

  async getExecution(id: string): Promise<AIExecution> {
    const { data } = await api.get<ApiResponse<AIExecution>>(`/ai/execution/${id}`);
    return data.data;
  },

  async ragSearch(query: string, topK?: number): Promise<RAGSearchResult[]> {
    const { data } = await api.post<ApiResponse<RAGSearchResult[]>>('/ai/rag/search', { query, topK });
    return data.data;
  },

  async chat(message: string, projectId?: string, context?: string): Promise<{ response: string; retrievedDocs: Array<{ title: string; category: string; score: number }> }> {
    const { data } = await api.post<ApiResponse<{ response: string; retrievedDocs: Array<{ title: string; category: string; score: number }> }>>('/ai/chat', { message, projectId, context });
    return data.data;
  },
};
