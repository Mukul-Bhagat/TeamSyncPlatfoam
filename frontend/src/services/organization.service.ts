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
  async createOrganization(input: CreateOrganizationInput) {
    const { data, error } = await supabase
      .from('organizations')
      .insert({
        name: input.name,
        slug: input.slug,
        logo_url: input.logo_url,
        owner_id: (await supabase.auth.getUser()).data.user?.id,
      })
      .select()
      .single();

    if (error) throw error;

    // Add owner as member
    await this.addMember({
      organization_id: data.id,
      user_id: data.owner_id,
      role: 'owner',
    });

    return data as Organization;
  },

  async getOrganization(id: string) {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Organization;
  },

  async getOrganizationBySlug(slug: string) {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) throw error;
    return data as Organization;
  },

  async listUserOrganizations() {
    const { data, error } = await supabase
      .from('organization_members')
      .select(`
        organization_id,
        role,
        organizations (
          id,
          name,
          slug,
          logo_url,
          created_at
        )
      `);

    if (error) throw error;
    return data as OrganizationMemberWithOrg[];
  },

  async updateOrganization(id: string, input: UpdateOrganizationInput) {
    const { data, error } = await supabase
      .from('organizations')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Organization;
  },

  async deleteOrganization(id: string) {
    const { error } = await supabase
      .from('organizations')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async addMember(input: AddMemberInput) {
    const { data, error } = await supabase
      .from('organization_members')
      .insert({
        organization_id: input.organization_id,
        user_id: input.user_id,
        role: input.role,
      })
      .select()
      .single();

    if (error) throw error;
    return data as OrganizationMember;
  },

  async removeMember(organizationId: string, userId: string) {
    const { error } = await supabase
      .from('organization_members')
      .delete()
      .eq('organization_id', organizationId)
      .eq('user_id', userId);

    if (error) throw error;
  },

  async updateMemberRole(organizationId: string, userId: string, input: UpdateMemberRoleInput) {
    const { data, error } = await supabase
      .from('organization_members')
      .update({ role: input.role })
      .eq('organization_id', organizationId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data as OrganizationMember;
  },

  async listOrganizationMembers(organizationId: string) {
    const { data, error } = await supabase
      .from('organization_members')
      .select(`
        id,
        role,
        joined_at,
        user_id,
        profiles (
          id,
          full_name,
          username,
          avatar_url
        )
      `)
      .eq('organization_id', organizationId);

    if (error) throw error;
    return data as OrganizationMemberWithProfile[];
  },
};
