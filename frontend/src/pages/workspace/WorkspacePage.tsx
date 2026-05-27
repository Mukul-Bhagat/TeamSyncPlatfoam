import { WorkspaceLayout } from '@/components/layouts/WorkspaceLayout';
import { Topbar } from '@/components/navigation/Topbar';
import { ContextCard } from '@/components/panels/ContextCard';
import { ActivityCard } from '@/components/panels/ActivityCard';
import { EmptyState } from '@/components/common/EmptyState';
import { Bot, Users, Zap, Layers } from 'lucide-react';

export function WorkspacePage() {
  const rightPanelContent = (
    <div className="space-y-4">
      {/* AI Assistant Card */}
      <ContextCard title="AI Assistant" variant="ai" icon={<Bot />}>
        <div className="text-sm text-muted-foreground">
          <p className="mb-2">Ask me anything about your workspace.</p>
          <div className="p-3 bg-background/50 rounded-lg border">
            <p className="text-xs text-muted-foreground italic">
              "Show me recent activity"
            </p>
          </div>
        </div>
      </ContextCard>

      {/* Active Users Card */}
      <ContextCard title="Active Users" icon={<Users />}>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-gradient-subtle flex items-center justify-center">
              <span className="text-xs font-medium text-primary">A</span>
            </div>
            <span className="text-sm text-foreground">Alice</span>
            <span className="w-2 h-2 rounded-full bg-green-500 ml-auto" />
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-gradient-subtle flex items-center justify-center">
              <span className="text-xs font-medium text-primary">B</span>
            </div>
            <span className="text-sm text-foreground">Bob</span>
            <span className="w-2 h-2 rounded-full bg-green-500 ml-auto" />
          </div>
        </div>
      </ContextCard>

      {/* Recent Activity Card */}
      <ContextCard title="Recent Activity" icon={<Zap />}>
        <div className="space-y-2">
          <ActivityCard
            user="Alice"
            action="created a new project"
            timestamp="2 min ago"
          />
          <ActivityCard
            user="Bob"
            action="commented on task"
            timestamp="15 min ago"
          />
          <ActivityCard
            user="You"
            action="updated workspace settings"
            timestamp="1 hour ago"
          />
        </div>
      </ContextCard>
    </div>
  );

  return (
    <WorkspaceLayout
      rightPanelContent={rightPanelContent}
      rightPanelTitle="Context"
    >
      <Topbar
        title="Workspace"
        breadcrumbs={[
          { label: 'Workspace', href: '/workspace' },
          { label: 'Overview' },
        ]}
      />

      <div className="p-6">
        <div className="mb-8">
          <h1 className="font-heading font-bold text-3xl text-foreground mb-2">
            Welcome to TeamSync
          </h1>
          <p className="text-muted-foreground">
            Your premium workspace for collaboration and productivity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <div className="text-2xl font-bold text-foreground">3</div>
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
            <div className="text-2xl font-bold text-foreground">12</div>
          </div>

          <div className="p-6 rounded-lg border bg-card/50 backdrop-blur-sm hover:shadow-elevation-md transition-all duration-fast">
            <div className="w-12 h-12 rounded-lg bg-gradient-subtle flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
              Activity
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Stay updated with recent activities.
            </p>
            <div className="text-2xl font-bold text-foreground">24</div>
          </div>
        </div>

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
