import type { ActivityFeedEvent } from '@/features/activity/types/activity.types';
import { Rocket, CheckCircle, XCircle, Clock } from 'lucide-react';

interface DeploymentActivityRendererProps {
  activity: ActivityFeedEvent;
}

export function DeploymentActivityRenderer({ activity }: DeploymentActivityRendererProps) {
  const metadata = activity.metadata as any;
  
  const getStatusIcon = () => {
    switch (activity.event_type) {
      case 'deployment_succeeded':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'deployment_failed':
        return <XCircle className="w-4 h-4 text-danger" />;
      case 'deployment_started':
        return <Clock className="w-4 h-4 text-warning" />;
      default:
        return <Rocket className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-glass border border-glass-border hover:border-primary/30 transition-colors">
      <div className="w-8 h-8 rounded-lg bg-gradient-subtle flex items-center justify-center">
        {getStatusIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{activity.title}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {metadata.service} • {metadata.environment} • {metadata.version}
        </p>
        {activity.description && (
          <p className="text-xs text-muted-foreground mt-1">{activity.description}</p>
        )}
      </div>
      <div className="text-xs text-muted-foreground">
        {new Date(activity.created_at).toLocaleTimeString()}
      </div>
    </div>
  );
}
