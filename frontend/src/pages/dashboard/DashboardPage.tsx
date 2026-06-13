import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { useProjects } from '@/hooks/useProjects';
import { useTeams } from '@/hooks/useTeams';
import { LoadingCard, LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { organizationService } from '@/services/organization.service';
import { workspaceService } from '@/services/workspace.service';
import { useWorkspaceContextStore } from '@/store/workspace-context.store';
import { FolderKanban, Users, Zap, Layers, Sparkles } from 'lucide-react';

export function DashboardPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { setOrganizationId, setWorkspaceId } = useWorkspaceContextStore();

  const [isOnboarding, setIsOnboarding] = useState(true);
  const [onboardingStep, setOnboardingStep] = useState('Initializing...');

  const { data: projectsData, isLoading: projectsLoading, refetch: refetchProjects } = useProjects({ page: 1, limit: 10 });
  const { data: teamsData, isLoading: teamsDataLoading, refetch: refetchTeams } = useTeams({ page: 1, limit: 10 });

  const projects = projectsData?.data || [];
  const totalProjects = projectsData?.total || 0;
  const totalTeams = teamsData?.total || 0;

  const isLoading = projectsLoading || teamsDataLoading;

  useEffect(() => {
    async function runOnboarding() {
      try {
        setOnboardingStep('Verifying your workspace access...');
        const orgs = await organizationService.listUserOrganizations();
        
        if (orgs.length === 0) {
          setOnboardingStep('Creating "My Workspace" organization...');
          const newOrg = await organizationService.createOrganization({
            name: 'My Workspace',
            slug: 'my-workspace',
          });

          setOnboardingStep('Setting up "Personal Projects" workspace...');
          const workspaces = await workspaceService.listOrganizationWorkspaces(newOrg.id);
          const defaultWs = workspaces.find((w) => w.name === 'Default Workspace' || w.slug === 'default');
          
          if (defaultWs) {
            await workspaceService.updateWorkspace(defaultWs.id, {
              name: 'Personal Projects',
            });
            setWorkspaceId(defaultWs.id);
          }

          setOrganizationId(newOrg.id);
          
          setOnboardingStep('Preparing your dashboard...');
          await queryClient.invalidateQueries({ queryKey: ['organizations'] });
          await queryClient.invalidateQueries({ queryKey: ['workspaces', newOrg.id] });
          await refetchProjects();
          await refetchTeams();
        } else {
          // If organizations exist, set the first one as active context
          const activeOrgId = orgs[0].organization_id;
          setOrganizationId(activeOrgId);
          const workspaces = await workspaceService.listOrganizationWorkspaces(activeOrgId);
          if (workspaces.length > 0) {
            setWorkspaceId(workspaces[0].id);
          }
        }
      } catch (error) {
        console.error('Auto onboarding failed:', error);
      } finally {
        setIsOnboarding(false);
      }
    }

    if (user) {
      void runOnboarding();
    }
  }, [user, queryClient, setOrganizationId, setWorkspaceId, refetchProjects, refetchTeams]);

  if (isOnboarding) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6 animate-pulse">
          <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
            <Layers className="h-8 w-8 text-primary" />
          </div>
          <h2 className="font-heading font-bold text-2xl text-foreground">
            Setting up TeamSync
          </h2>
          <p className="text-body-md text-muted-foreground">
            {onboardingStep}
          </p>
          <div className="flex justify-center mt-2">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-heading font-bold text-heading-xl text-foreground mb-2 flex items-center gap-2">
              Dashboard <Sparkles className="h-6 w-6 text-primary animate-pulse" />
            </h1>
            <p className="text-body-md text-muted-foreground">
              Welcome back, {user?.email?.split('@')[0] || 'User'}! Here's what's happening with your workspace.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {isLoading ? (
            <>
              <LoadingCard />
              <LoadingCard />
              <LoadingCard />
            </>
          ) : (
            <>
              <div className="bg-card border border-glass-border rounded-xl p-6 shadow-soft-md hover:shadow-soft-lg transition-all duration-fast">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-heading font-semibold text-heading-md text-foreground">
                    Total Projects
                  </h3>
                  <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <FolderKanban className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <p className="font-heading font-bold text-3xl text-foreground">{totalProjects}</p>
                <p className="text-sm text-muted-foreground mt-1">Active projects</p>
              </div>
              
              <div className="bg-card border border-glass-border rounded-xl p-6 shadow-soft-md hover:shadow-soft-lg transition-all duration-fast">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-heading font-semibold text-heading-md text-foreground">
                    Active Members
                  </h3>
                  <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <p className="font-heading font-bold text-3xl text-foreground">{totalTeams}</p>
                <p className="text-sm text-muted-foreground mt-1">Team members</p>
              </div>

              <div className="bg-card border border-glass-border rounded-xl p-6 shadow-soft-md hover:shadow-soft-lg transition-all duration-fast">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-heading font-semibold text-heading-md text-foreground">
                    Activity
                  </h3>
                  <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <p className="font-heading font-bold text-3xl text-foreground">{projects.length}</p>
                <p className="text-sm text-muted-foreground mt-1">Updated recently</p>
              </div>
            </>
          )}
        </div>

        {/* Recent Projects Section */}
        <div className="bg-card border border-glass-border rounded-xl p-6 shadow-soft-md">
          <h2 className="font-heading font-semibold text-heading-lg text-foreground mb-4">
            Recent Projects
          </h2>
          {isLoading ? (
            <LoadingCard />
          ) : projects.length === 0 ? (
            <div className="text-center py-12">
              <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <FolderKanban className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-body-md text-muted-foreground">No projects yet</p>
              <p className="text-sm text-muted-foreground mt-1">Create your first project to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.slice(0, 5).map((project: any) => (
                <div key={project.id} className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/30 transition-colors duration-fast border border-transparent hover:border-glass-border cursor-pointer">
                  <div>
                    <h3 className="font-medium text-foreground">{project.name}</h3>
                    <p className="text-sm text-muted-foreground">{project.description || 'No description'}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    project.status === 'active' ? 'bg-success/10 text-success' :
                    project.status === 'completed' ? 'bg-primary/10 text-primary' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {project.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
