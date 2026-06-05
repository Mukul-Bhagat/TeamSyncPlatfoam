import { supabase } from '@/lib/supabase';
import { activityService } from './activity.service';
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

const recordActivity = (
  payload: Parameters<typeof activityService.createActivity>[0]
) => {
  void activityService.createActivity(payload).catch(() => undefined);
};

export const organizationService = {
  async createOrganization(input: CreateOrganizationInput) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('organizations')
      .insert({
        name: input.name,
        slug: input.slug,
        logo_url: input.logo_url,
        owner_id: user.id,
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

    recordActivity({
      organization_id: data.id,
      actor_id: user.id,
      entity_type: 'organization',
      entity_id: data.id,
      event_type: 'organization_created',
      title: `Organization created: ${data.name}`,
      description: `Created organization ${data.name}`,
      metadata: {
        user_id: user.id,
        user_name: user.email || 'Unknown user',
        action: 'created organization',
      },
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
        status,
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
        status: 'active',
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

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      recordActivity({
        organization_id: organizationId,
        actor_id: user.id,
        entity_type: 'organization',
        entity_id: organizationId,
        event_type: 'member_role_updated' as any,
        title: 'Organization member role updated',
        description: `Updated member role in organization`,
        metadata: {
          user_id: userId,
          user_name: user.email || 'Unknown user',
          action: 'updated member role',
          role: input.role,
        },
      });
    }

    return data as OrganizationMember;
  },

  async listOrganizationMembers(organizationId: string) {
    const { data, error } = await supabase
      .from('organization_members')
      .select(`
        id,
        role,
        status,
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
