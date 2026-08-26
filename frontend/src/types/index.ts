export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TaskStatus = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
export type ProjectStatus = 'active' | 'completed' | 'archived' | 'on-hold';
export type ExperienceLevel = 'junior' | 'intermediate' | 'senior' | 'mixed';

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  completed: boolean;
  estimatedHours?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  priority: Priority;
  status: TaskStatus;
  estimatedHours?: number;
  suggestedDeadline?: string;
  actualDeadline?: string;
  category?: string;
  tags: string[];
  dependencies: string[];
  executionOrder?: number;
  position: number;
  createdAt: string;
  updatedAt: string;
  subtasks: Subtask[];
}

export interface Project {
  id: string;
  name: string;
  goal: string;
  summary?: string;
  deadline?: string;
  teamSize: number;
  experienceLevel: string;
  technologyStack: string[];
  estimatedDurationDays?: number;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  tasks: Task[];
  aiExecutions?: AIExecution[];
  _count?: { tasks: number; aiExecutions: number };
}

export interface AIExecution {
  id: string;
  projectId?: string;
  input: string;
  retrievedDocs: string;
  model: string;
  promptVersion: string;
  prompt?: string;
  response?: string;
  parsedJson?: string;
  validationStatus: 'pending' | 'success' | 'failed';
  validationErrors: string;
  retryCount: number;
  executionTimeMs?: number;
  createdAt: string;
}

export interface AIPlan {
  project: {
    name: string;
    summary: string;
    estimatedDurationDays?: number;
  };
  tasks: Array<{
    title: string;
    description?: string;
    priority: Priority;
    status: TaskStatus;
    estimatedHours?: number;
    suggestedDeadline?: string;
    category?: string;
    tags: string[];
    dependencies: string[];
    executionOrder?: number;
    subtasks: Array<{ title: string; estimatedHours?: number }>;
  }>;
}

export interface GeneratePlanResult {
  plan: AIPlan;
  executionId: string;
  retrievedDocs: Array<{ title: string; category: string; score: number }>;
  modelUsed: string;
  executionTimeMs: number;
  retryCount: number;
  repaired: boolean;
}

export interface AIStatus {
  provider: 'ollama' | 'mock';
  model: string;
  llmAvailable: boolean;
  vectorDbAvailable: boolean;
}

export interface RAGSearchResult {
  id: string;
  score: number;
  payload: {
    text: string;
    source: string;
    category: string;
    title: string;
    chunkIndex: number;
  };
}

export interface DashboardStats {
  total: number;
  active: number;
  taskStats: Array<{ status: string; _count: { _all: number } }>;
  overdue: number;
  aiPlans: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}
