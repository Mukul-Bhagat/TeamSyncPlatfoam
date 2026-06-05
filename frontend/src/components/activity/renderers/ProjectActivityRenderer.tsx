import type { ActivityFeedEvent } from '@/features/activity/types/activity.types';
import { FolderKanban } from 'lucide-react';

interface ProjectActivityRendererProps {
  activity: ActivityFeedEvent;
}

export function ProjectActivityRenderer({ activity }: ProjectActivityRendererProps) {
  const metadata = activity.metadata as unknown as Record<string, unknown>;
  const projectLabel =
    typeof metadata.project_name === 'string'
      ? metadata.project_name
      : typeof metadata.project_id === 'string'
        ? metadata.project_id
        : 'Project';
  const actionLabel = typeof metadata.action === 'string' ? metadata.action : '';

  return (
    <div className="flex items-start gap-3 rounded-lg border border-glass-border bg-glass p-3 transition-colors hover:border-primary/30">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-subtle">
        <FolderKanban className="h-4 w-4 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{activity.title}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {projectLabel}
          {actionLabel ? ` • ${actionLabel}` : ''}
        </p>
        {activity.description && (
          <p className="mt-1 text-xs text-muted-foreground">{activity.description}</p>
        )}
      </div>
      <div className="text-xs text-muted-foreground">
        {new Date(activity.created_at).toLocaleTimeString()}
      </div>
    </div>
  );
}
