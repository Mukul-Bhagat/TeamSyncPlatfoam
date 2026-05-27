import { DashboardLayout } from '@/components/layouts/DashboardLayout';

export function ProjectsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading font-bold text-heading-xl text-foreground mb-2">
              Projects
            </h1>
            <p className="text-body-md text-muted-foreground">
              Manage and track all your projects
            </p>
          </div>
          <button className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity duration-fast">
            New Project
          </button>
        </div>

        {/* Projects List */}
        <div className="bg-card border rounded-xl p-6 shadow-soft-md">
          <div className="text-center py-12">
            <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-6 w-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-body-md text-muted-foreground">No projects yet</p>
            <p className="text-sm text-muted-foreground mt-1">Create your first project to get started</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
