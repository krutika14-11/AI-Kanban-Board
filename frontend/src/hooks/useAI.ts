import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { aiService } from '../services/ai.service';
import toast from 'react-hot-toast';

export function useAIStatus() {
  return useQuery({
    queryKey: ['ai', 'status'],
    queryFn: aiService.getStatus,
    staleTime: 30 * 1000,
    retry: false,
  });
}

export function useGeneratePlan(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: aiService.generatePlan,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks', projectId] });
      qc.invalidateQueries({ queryKey: ['projects', projectId] });
      qc.invalidateQueries({ queryKey: ['ai', 'executions', projectId] });
      toast.success('AI plan generated successfully!');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to generate AI plan');
    },
  });
}

export function useAIExecutionHistory(projectId: string) {
  return useQuery({
    queryKey: ['ai', 'executions', projectId],
    queryFn: () => aiService.getExecutionHistory(projectId),
    enabled: !!projectId,
  });
}

export function useRAGSearch() {
  return useMutation({
    mutationFn: ({ query, topK }: { query: string; topK?: number }) =>
      aiService.ragSearch(query, topK),
  });
}

export function useAIChat() {
  return useMutation({
    mutationFn: ({ message, projectId, context }: { message: string; projectId?: string; context?: string }) =>
      aiService.chat(message, projectId, context),
  });
}
