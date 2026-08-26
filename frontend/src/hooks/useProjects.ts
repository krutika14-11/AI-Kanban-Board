import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsService } from '../services/projects.service';
import toast from 'react-hot-toast';

export const PROJECTS_KEY = ['projects'];

export function useProjects() {
  return useQuery({
    queryKey: PROJECTS_KEY,
    queryFn: projectsService.getAll,
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: () => projectsService.getById(id),
    enabled: !!id,
  });
}

export function useProjectStats() {
  return useQuery({
    queryKey: ['projects', 'stats'],
    queryFn: projectsService.getStats,
    staleTime: 60 * 1000,
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: projectsService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PROJECTS_KEY });
      toast.success('Project created successfully!');
    },
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...rest }: { id: string } & Parameters<typeof projectsService.update>[1]) =>
      projectsService.update(id, rest),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['projects', id] });
      qc.invalidateQueries({ queryKey: PROJECTS_KEY });
    },
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: projectsService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PROJECTS_KEY });
      toast.success('Project deleted');
    },
  });
}
