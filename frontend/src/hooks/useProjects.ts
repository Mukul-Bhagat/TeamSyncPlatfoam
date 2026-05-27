import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService } from '@/services/project.service';
import { useToast } from '@/components/common/Toast';
import type { PaginationParams } from '@/types';

export function useProjects(params?: Partial<PaginationParams>) {
  return useQuery({
    queryKey: ['projects', params],
    queryFn: () => {
      const paginationParams: PaginationParams = {
        page: params?.page || 1,
        limit: params?.limit || 10,
      };
      return projectService.getProjects(paginationParams);
    },
    select: (data) => data.data,
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => projectService.getProject(id),
    select: (data) => data.data,
    enabled: !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: projectService.createProject,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success(data.message || 'Project created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create project');
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      projectService.updateProject(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', data.data?.id] });
      toast.success(data.message || 'Project updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update project');
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: projectService.deleteProject,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success(data.message || 'Project deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete project');
    },
  });
}
