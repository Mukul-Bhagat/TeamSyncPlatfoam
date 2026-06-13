import { createClient, SupabaseClient } from '@supabase/supabase-js'

export class WorkspaceService {
  private supabase: SupabaseClient

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }

  async getWorkspaces(orgId: string | null, userId: string): Promise<any[]> {
    let query = this.supabase
      .from('workspace_members')
      .select('*, workspace:workspaces(*)')
      .eq('user_id', userId)

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to fetch user workspaces: ${error.message}`)
    }

    const workspaces = (data || []).map((m: any) => ({
      workspace_id: m.workspace_id,
      role: m.role,
      joined_at: m.joined_at,
      workspace: m.workspace
    })).filter((w: any) => w.workspace !== null)

    // If orgId is provided, filter by it
    if (orgId) {
      return workspaces.filter((w: any) => w.workspace.organization_id === orgId)
    } else {
      // If orgId is null/empty, filter by personal workspaces (orgId = null)
      return workspaces.filter((w: any) => w.workspace.organization_id === null)
    }
  }

  async getWorkspaceById(workspaceId: string, userId: string): Promise<any> {
    const member = await this.getMember(userId, workspaceId)
    if (!member) {
      throw new Error('Access denied')
    }

    const { data, error } = await this.supabase
      .from('workspaces')
      .select('*')
      .eq('id', workspaceId)
      .single()

    if (error) {
      throw new Error(`Failed to fetch workspace: ${error.message}`)
    }

    return data
  }

  async createWorkspace(
    userId: string,
    orgId: string | null,
    name: string,
    slug: string,
    description?: string,
    icon?: string
  ): Promise<any> {
    const { data, error } = await this.supabase.rpc('create_workspace_flow', {
      p_organization_id: orgId || null,
      p_name: name,
      p_slug: slug,
      p_description: description || null,
      p_icon: icon || null
    })

    if (error) {
      throw new Error(`Failed to create workspace: ${error.message}`)
    }

    const workspace = await this.getWorkspaceById(data.workspace_id, userId)
    return workspace
  }

  async updateWorkspace(workspaceId: string, userId: string, updateData: any): Promise<any> {
    const member = await this.getMember(userId, workspaceId)
    if (!member || member.role !== 'admin') {
      throw new Error('Access denied: Admin role required')
    }

    const { data, error } = await this.supabase
      .from('workspaces')
      .update(updateData)
      .eq('id', workspaceId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update workspace: ${error.message}`)
    }

    return data
  }

  async deleteWorkspace(workspaceId: string, userId: string): Promise<void> {
    const member = await this.getMember(userId, workspaceId)
    if (!member || member.role !== 'admin') {
      throw new Error('Access denied: Admin role required')
    }

    const { error } = await this.supabase
      .from('workspaces')
      .delete()
      .eq('id', workspaceId)

    if (error) {
      throw new Error(`Failed to delete workspace: ${error.message}`)
    }
  }

  async getWorkspaceMembers(workspaceId: string, userId: string): Promise<any[]> {
    const member = await this.getMember(userId, workspaceId)
    if (!member) {
      throw new Error('Access denied')
    }

    const { data, error } = await this.supabase
      .from('workspace_members')
      .select('*, profile:profiles(full_name, email, avatar_url)')
      .eq('workspace_id', workspaceId)

    if (error) {
      throw new Error(`Failed to fetch workspace members: ${error.message}`)
    }

    return data || []
  }

  async addWorkspaceMember(
    workspaceId: string,
    userId: string,
    targetEmail: string,
    role: string = 'member'
  ): Promise<any> {
    const member = await this.getMember(userId, workspaceId)
    if (!member || member.role !== 'admin') {
      throw new Error('Access denied: Admin role required')
    }

    const { data: profile } = await this.supabase
      .from('profiles')
      .select('id')
      .eq('email', targetEmail)
      .maybeSingle()

    if (profile) {
      const { data, error } = await this.supabase
        .from('workspace_members')
        .insert({
          workspace_id: workspaceId,
          user_id: profile.id,
          role,
          joined_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to add workspace member: ${error.message}`)
      }

      return data
    } else {
      throw new Error(`User with email ${targetEmail} does not exist in TeamSync. Please have them register first.`)
    }
  }

  async removeWorkspaceMember(workspaceId: string, userId: string, targetUserId: string): Promise<void> {
    const member = await this.getMember(userId, workspaceId)
    if (!member || member.role !== 'admin') {
      throw new Error('Access denied: Admin role required')
    }

    const { error } = await this.supabase
      .from('workspace_members')
      .delete()
      .eq('workspace_id', workspaceId)
      .eq('user_id', targetUserId)

    if (error) {
      throw new Error(`Failed to remove workspace member: ${error.message}`)
    }
  }

  private async getMember(userId: string, workspaceId: string): Promise<any | null> {
    const { data } = await this.supabase
      .from('workspace_members')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId)
      .maybeSingle()

    return data
  }
}
