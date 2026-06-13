import { api } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import type {
  Organization,
  OrganizationMember,
  OrganizationMemberWithOrg,
  OrganizationMemberWithProfile,
  CreateOrganizationInput,
  UpdateOrganizationInput,
  AddMemberInput,
  UpdateMemberRoleInput,
} from '@/features/organization/types/organization.types';

export const organizationService = {
  async createOrganization(input: CreateOrganizationInput): Promise<Organization> {
    return api.post<Organization>('/organizations', input);
  },

  async getOrganization(id: string): Promise<Organization> {
    return api.get<Organization>(`/organizations/${id}`);
  },

  async getOrganizationBySlug(slug: string): Promise<Organization> {
    const orgs = await this.listUserOrganizations();
    const found = orgs.find((o) => o.organizations.slug === slug);
    if (!found) throw new Error('Organization not found');
    return found.organizations;
  },

  async listUserOrganizations(): Promise<OrganizationMemberWithOrg[]> {
    return api.get<OrganizationMemberWithOrg[]>('/organizations');
  },

  async updateOrganization(id: string, input: UpdateOrganizationInput): Promise<Organization> {
    return api.put<Organization>(`/organizations/${id}`, input);
  },

  async deleteOrganization(id: string): Promise<void> {
    return api.del<void>(`/organizations/${id}`);
  },

  async addMember(input: AddMemberInput): Promise<OrganizationMember> {
    // Look up user email to support invite flow
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', input.user_id)
      .single();

    if (!profile?.email) {
      throw new Error('User profile or email not found');
    }

    return api.post<OrganizationMember>(`/organizations/${input.organization_id}/members`, {
      email: profile.email,
      role: input.role,
    });
  },

  async removeMember(organizationId: string, userId: string): Promise<void> {
    return api.del<void>(`/organizations/${organizationId}/members/${userId}`);
  },

  async updateMemberRole(
    organizationId: string,
    userId: string,
    input: UpdateMemberRoleInput
  ): Promise<OrganizationMember> {
    return api.put<OrganizationMember>(`/organizations/${organizationId}/members/${userId}/role`, {
      role: input.role,
    });
  },

  async listOrganizationMembers(organizationId: string): Promise<OrganizationMemberWithProfile[]> {
    const members = await api.get<any[]>(`/organizations/${organizationId}/members`);
    // Map backend keys to frontend keys if profile exists
    return members.map((m) => ({
      id: m.id,
      organization_id: m.organization_id,
      user_id: m.user_id,
      role: m.role,
      status: m.status,
      joined_at: m.joined_at,
      profiles: m.profile ? {
        id: m.user_id,
        full_name: m.profile.full_name,
        username: m.profile.username || m.profile.email.split('@')[0],
        avatar_url: m.profile.avatar_url,
      } : undefined,
    })) as OrganizationMemberWithProfile[];
  },
};
