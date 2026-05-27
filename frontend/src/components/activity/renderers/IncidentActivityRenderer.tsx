import type { ActivityFeedEvent } from '@/features/activity/types/activity.types';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface IncidentActivityRendererProps {
  activity: ActivityFeedEvent;
}

export function IncidentActivityRenderer({ activity }: IncidentActivityRendererProps) {
  const metadata = activity.metadata as any;
  
  const getStatusIcon = () => {
    switch (activity.event_type) {
      case 'incident_resolved':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'incident_opened':
        return <AlertTriangle className="w-4 h-4 text-danger" />;
      case 'incident_updated':
        return <Clock className="w-4 h-4 text-warning" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-primary" />;
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
          {metadata.incident_title} • {metadata.severity}
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
