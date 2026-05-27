import { supabase } from '@/lib/supabase';
import type { Project, ApiResponse, PaginationParams, PaginatedResponse } from '@/types';

export interface CreateProjectData {
  name: string;
  description?: string;
  team_id?: string;
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  status?: 'active' | 'archived' | 'completed';
}

export const projectService = {
  async getProjects(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Project>>> {
    try {
      let query = supabase
        .from('projects')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (params?.page && params?.limit) {
        const from = (params.page - 1) * params.limit;
        const to = from + params.limit - 1;
        query = query.range(from, to);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data: {
          data: data || [],
          total: count || 0,
          page: params?.page || 1,
          limit: params?.limit || 10,
          totalPages: Math.ceil((count || 0) / (params?.limit || 10)),
        },
        error: null,
      };
    } catch (error: any) {
      return {
        data: null,
        error: error.message || 'Failed to fetch projects',
      };
    }
  },

  async getProject(id: string): Promise<ApiResponse<Project>> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
      };
    } catch (error: any) {
      return {
        data: null,
        error: error.message || 'Failed to fetch project',
      };
    }
  },

  async createProject(data: CreateProjectData): Promise<ApiResponse<Project>> {
    try {
      const { data: project, error } = await supabase
        .from('projects')
        .insert({
          name: data.name,
          description: data.description,
          team_id: data.team_id,
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;

      return {
        data: project,
        error: null,
        message: 'Project created successfully',
      };
    } catch (error: any) {
      return {
        data: null,
        error: error.message || 'Failed to create project',
      };
    }
  },

  async updateProject(id: string, data: UpdateProjectData): Promise<ApiResponse<Project>> {
    try {
      const { data: project, error } = await supabase
        .from('projects')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        data: project,
        error: null,
        message: 'Project updated successfully',
      };
    } catch (error: any) {
      return {
        data: null,
        error: error.message || 'Failed to update project',
      };
    }
  },

  async deleteProject(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return {
        data: null,
        error: null,
        message: 'Project deleted successfully',
      };
    } catch (error: any) {
      return {
        data: null,
        error: error.message || 'Failed to delete project',
      };
    }
  },
};
