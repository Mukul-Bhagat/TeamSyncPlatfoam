import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { useProjects } from '@/hooks/useProjects';
import { useTeams } from '@/hooks/useTeams';
import { LoadingCard } from '@/components/common/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';

export function DashboardPage() {
  const { user } = useAuth();
  const { data: projectsData, isLoading: projectsLoading } = useProjects({ page: 1, limit: 10 });
  const { data: teamsData, isLoading: teamsDataLoading } = useTeams({ page: 1, limit: 10 });

  const projects = projectsData?.data || [];
  const totalProjects = projectsData?.total || 0;
  const totalTeams = teamsData?.total || 0;

  const isLoading = projectsLoading || teamsDataLoading;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-heading font-bold text-heading-xl text-foreground mb-2">
            Dashboard
          </h1>
          <p className="text-body-md text-muted-foreground">
            Welcome back, {user?.email?.split('@')[0] || 'User'}! Here's what's happening with your projects.
          </p>
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
              <div className="bg-card border rounded-xl p-6 shadow-soft-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-heading font-semibold text-heading-md text-foreground">
                    Total Projects
                  </h3>
                  <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
                <p className="font-heading font-bold text-3xl text-foreground">{totalProjects}</p>
                <p className="text-sm text-muted-foreground mt-1">Active projects</p>
              </div>
              <div className="bg-card border rounded-xl p-6 shadow-soft-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-heading font-semibold text-heading-md text-foreground">
                    Active Teams
                  </h3>
                  <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <p className="font-heading font-bold text-3xl text-foreground">{totalTeams}</p>
                <p className="text-sm text-muted-foreground mt-1">Team members</p>
              </div>
              <div className="bg-card border rounded-xl p-6 shadow-soft-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-heading font-semibold text-heading-md text-foreground">
                    Recent Activity
                  </h3>
                  <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <p className="font-heading font-bold text-3xl text-foreground">{projects.length}</p>
                <p className="text-sm text-muted-foreground mt-1">This week</p>
              </div>
            </>
          )}
        </div>

        {/* Recent Projects Section */}
        <div className="bg-card border rounded-xl p-6 shadow-soft-md">
          <h2 className="font-heading font-semibold text-heading-lg text-foreground mb-4">
            Recent Projects
          </h2>
          {isLoading ? (
            <LoadingCard />
          ) : projects.length === 0 ? (
            <div className="text-center py-12">
              <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-6 w-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-body-md text-muted-foreground">No projects yet</p>
              <p className="text-sm text-muted-foreground mt-1">Create your first project to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.slice(0, 5).map((project: any) => (
                <div key={project.id} className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/30 transition-colors duration-fast">
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
