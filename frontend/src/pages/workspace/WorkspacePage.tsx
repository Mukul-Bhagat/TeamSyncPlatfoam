import { WorkspaceLayout } from '@/components/layouts/WorkspaceLayout';
import { Topbar } from '@/components/navigation/Topbar';
import { ContextCard } from '@/components/panels/ContextCard';
import { EmptyState } from '@/components/common/EmptyState';
import { ActivityFeed } from '@/components/activity/ActivityFeed';
import { AIContextPanel } from '@/components/ai/AIContextPanel';
import { Users, Zap, Layers, Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useOrganizations } from '@/features/organization/hooks/useOrganizations';
import { useWorkspaces } from '@/features/workspace/hooks/useWorkspaces';
import { useWorkspaceMembers } from '@/features/workspace/hooks/useWorkspaces';
import { useProjects } from '@/hooks/useProjects';
import { useWorkspaceContextStore } from '@/store/workspace-context.store';

export function WorkspacePage() {
  const {
    organizationId: selectedOrganizationId,
    workspaceId: selectedWorkspaceId,
    setOrganizationId,
    setWorkspaceId,
  } = useWorkspaceContextStore();

  // Fetch organizations to get the current organization
  const { data: organizations, isLoading: orgsLoading } = useOrganizations();

  const organizationId =
    selectedOrganizationId || organizations?.[0]?.organization_id || '';

  // Fetch workspaces for the organization
  const { data: workspaces, isLoading: workspacesLoading } = useWorkspaces(organizationId);

  const workspaceId = selectedWorkspaceId || workspaces?.[0]?.id || '';

  // Fetch workspace members
  const { data: members, isLoading: membersLoading } = useWorkspaceMembers(workspaceId);
  
  // Fetch projects
  const { data: projects, isLoading: projectsLoading } = useProjects();

  useEffect(() => {
    if (!selectedOrganizationId && organizations?.[0]?.organization_id) {
      setOrganizationId(organizations[0].organization_id);
    }
  }, [organizations, selectedOrganizationId, setOrganizationId]);

  useEffect(() => {
    if (!selectedWorkspaceId && workspaces?.[0]?.id) {
      setWorkspaceId(workspaces[0].id);
    }
  }, [selectedWorkspaceId, setWorkspaceId, workspaces]);
  
  const isLoading = orgsLoading || workspacesLoading || membersLoading || projectsLoading;
  
  const rightPanelContent = (
    <div className="space-y-4">
      {/* AI Context Panel */}
      <AIContextPanel
        organizationId={organizationId}
        workspaceId={workspaceId}
      />

      {/* Active Users Card */}
      <ContextCard title="Active Users" icon={<Users />}>
        {membersLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : members && members.length > 0 ? (
          <div className="space-y-2">
            {members.slice(0, 5).map((member) => (
              <div key={member.id} className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-gradient-subtle flex items-center justify-center">
                  <span className="text-xs font-medium text-primary">
                    {member.profiles?.full_name?.charAt(0) || '?'}
                  </span>
                </div>
                <span className="text-sm text-foreground">
                  {member.profiles?.full_name || 'Unknown User'}
                </span>
                <span className="w-2 h-2 rounded-full bg-green-500 ml-auto" />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground text-center py-4">
            No members yet
          </div>
        )}
      </ContextCard>

      {/* Recent Activity Card */}
      <ContextCard title="Recent Activity" icon={<Zap />}>
        <ActivityFeed workspaceId={workspaceId} organizationId={organizationId} limit={5} />
      </ContextCard>
    </div>
  );

  return (
    <WorkspaceLayout
      currentOrganizationId={organizationId || undefined}
      currentWorkspaceId={workspaceId || undefined}
      rightPanelContent={rightPanelContent}
      rightPanelTitle="Context"
    >
      <Topbar
        title={workspaces?.find((workspace) => workspace.id === workspaceId)?.name || workspaces?.[0]?.name || 'Workspace'}
        breadcrumbs={[
          { label: organizations?.find((org) => org.organization_id === organizationId)?.organizations?.name || organizations?.[0]?.organizations?.name || 'Organization' },
          { label: workspaces?.find((workspace) => workspace.id === workspaceId)?.name || workspaces?.[0]?.name || 'Workspace' },
          { label: 'Overview' },
        ]}
      />

      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="mb-8">
                <h1 className="font-heading font-bold text-3xl text-foreground mb-2">
                Welcome to {workspaces?.find((workspace) => workspace.id === workspaceId)?.name || workspaces?.[0]?.name || 'TeamSync'}
              </h1>
              <p className="text-muted-foreground">
                {workspaces?.find((workspace) => workspace.id === workspaceId)?.description || workspaces?.[0]?.description || 'Your premium workspace for collaboration and productivity.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-lg border bg-card/50 backdrop-blur-sm hover:shadow-elevation-md transition-all duration-fast">
                <div className="w-12 h-12 rounded-lg bg-gradient-subtle flex items-center justify-center mb-4">
                  <Layers className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
                  Projects
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Manage your projects and track progress.
                </p>
                <div className="text-2xl font-bold text-foreground">
                  {projectsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : projects?.data?.length || 0}
                </div>
              </div>

              <div className="p-6 rounded-lg border bg-card/50 backdrop-blur-sm hover:shadow-elevation-md transition-all duration-fast">
                <div className="w-12 h-12 rounded-lg bg-gradient-subtle flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
                  Team Members
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Collaborate with your team in real-time.
                </p>
                <div className="text-2xl font-bold text-foreground">
                  {membersLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : members?.length || 0}
                </div>
              </div>
            </div>
          </>
        )}

        <div className="mt-8">
          <EmptyState
            title="No active tasks"
            description="Create your first task to get started with your workspace."
          />
        </div>
      </div>
    </WorkspaceLayout>
  );
}
