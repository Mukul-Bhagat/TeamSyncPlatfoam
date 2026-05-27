import { supabase } from '@/lib/supabase';
import type { Team, TeamMember, ApiResponse, PaginationParams, PaginatedResponse } from '@/types';

export interface CreateTeamData {
  name: string;
  description?: string;
}

export interface UpdateTeamData {
  name?: string;
  description?: string;
}

export interface InviteMemberData {
  email: string;
  role: 'admin' | 'member' | 'viewer';
}

export const teamService = {
  async getTeams(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Team>>> {
    try {
      let query = supabase
        .from('teams')
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
        error: error.message || 'Failed to fetch teams',
      };
    }
  },

  async getTeam(id: string): Promise<ApiResponse<Team>> {
    try {
      const { data, error } = await supabase
        .from('teams')
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
        error: error.message || 'Failed to fetch team',
      };
    }
  },

  async createTeam(data: CreateTeamData): Promise<ApiResponse<Team>> {
    try {
      const { data: team, error } = await supabase
        .from('teams')
        .insert({
          name: data.name,
          description: data.description,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        data: team,
        error: null,
        message: 'Team created successfully',
      };
    } catch (error: any) {
      return {
        data: null,
        error: error.message || 'Failed to create team',
      };
    }
  },

  async updateTeam(id: string, data: UpdateTeamData): Promise<ApiResponse<Team>> {
    try {
      const { data: team, error } = await supabase
        .from('teams')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        data: team,
        error: null,
        message: 'Team updated successfully',
      };
    } catch (error: any) {
      return {
        data: null,
        error: error.message || 'Failed to update team',
      };
    }
  },

  async deleteTeam(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return {
        data: null,
        error: null,
        message: 'Team deleted successfully',
      };
    } catch (error: any) {
      return {
        data: null,
        error: error.message || 'Failed to delete team',
      };
    }
  },

  async getTeamMembers(teamId: string): Promise<ApiResponse<TeamMember[]>> {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', teamId);

      if (error) throw error;

      return {
        data: data || [],
        error: null,
      };
    } catch (error: any) {
      return {
        data: null,
        error: error.message || 'Failed to fetch team members',
      };
    }
  },

  async inviteMember(teamId: string, data: InviteMemberData): Promise<ApiResponse<TeamMember>> {
    try {
      const { data: member, error } = await supabase
        .from('team_members')
        .insert({
          team_id: teamId,
          user_id: data.email, // This would need to be resolved to actual user_id
          role: data.role,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        data: member,
        error: null,
        message: 'Member invited successfully',
      };
    } catch (error: any) {
      return {
        data: null,
        error: error.message || 'Failed to invite member',
      };
    }
  },
};
