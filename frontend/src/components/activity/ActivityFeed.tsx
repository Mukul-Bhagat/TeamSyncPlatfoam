import { useState } from 'react';
import { useActivities } from '@/features/activity/hooks/useActivities';
import { ActivityEventType } from '@/features/activity/types/activity.types';
import { ActivityRenderer } from './ActivityRenderer';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityFeedProps {
  workspaceId?: string;
  organizationId?: string;
  limit?: number;
}

export function ActivityFeed({ workspaceId, organizationId, limit = 50 }: ActivityFeedProps) {
  const [eventFilter, setEventFilter] = useState<ActivityEventType | 'all'>('all');
  
  const { data: activities, isLoading } = useActivities({
    workspace_id: workspaceId,
    organization_id: organizationId,
    event_type: eventFilter === 'all' ? undefined : eventFilter,
    limit,
  });

  const groupedActivities = activities ? groupByDate(activities) : [];

  function groupByDate(activitiesList: typeof activities) {
    const groups: Record<string, typeof activitiesList> = {};
    
    (activitiesList || []).forEach((activity) => {
      const date = new Date(activity.created_at).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(activity);
    });
    
    return Object.entries(groups).map(([date, acts]) => ({
      date,
      activities: acts,
    }));
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-glass-border">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Activity Feed</h2>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 p-4 border-b border-glass-border overflow-x-auto">
        <button
          onClick={() => setEventFilter('all')}
          className={cn(
            'px-3 py-1.5 text-xs rounded-lg transition-colors whitespace-nowrap',
            eventFilter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-glass text-muted-foreground hover:text-foreground'
          )}
        >
          All Activity
        </button>
        <button
          onClick={() => setEventFilter(ActivityEventType.MESSAGE_CREATED)}
          className={cn(
            'px-3 py-1.5 text-xs rounded-lg transition-colors whitespace-nowrap',
            eventFilter === ActivityEventType.MESSAGE_CREATED ? 'bg-primary text-primary-foreground' : 'bg-glass text-muted-foreground hover:text-foreground'
          )}
        >
          Messages
        </button>
        <button
          onClick={() => setEventFilter(ActivityEventType.DEPLOYMENT_FAILED)}
          className={cn(
            'px-3 py-1.5 text-xs rounded-lg transition-colors whitespace-nowrap',
            eventFilter === ActivityEventType.DEPLOYMENT_FAILED ? 'bg-primary text-primary-foreground' : 'bg-glass text-muted-foreground hover:text-foreground'
          )}
        >
          Deployments
        </button>
        <button
          onClick={() => setEventFilter(ActivityEventType.INCIDENT_OPENED)}
          className={cn(
            'px-3 py-1.5 text-xs rounded-lg transition-colors whitespace-nowrap',
            eventFilter === ActivityEventType.INCIDENT_OPENED ? 'bg-primary text-primary-foreground' : 'bg-glass text-muted-foreground hover:text-foreground'
          )}
        >
          Incidents
        </button>
        <button
          onClick={() => setEventFilter(ActivityEventType.AI_SUMMARY_GENERATED)}
          className={cn(
            'px-3 py-1.5 text-xs rounded-lg transition-colors whitespace-nowrap',
            eventFilter === ActivityEventType.AI_SUMMARY_GENERATED ? 'bg-primary text-primary-foreground' : 'bg-glass text-muted-foreground hover:text-foreground'
          )}
        >
          AI Events
        </button>
      </div>

      {/* Activity List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">Loading activity...</div>
          </div>
        ) : groupedActivities.length > 0 ? (
          <div className="space-y-6 p-4">
            {groupedActivities.map((group) => (
              <div key={group.date}>
                {/* Date Separator */}
                <div className="sticky top-0 z-10 py-2 mb-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {new Date(group.date).toLocaleDateString(undefined, {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                {/* Activities */}
                <div className="space-y-2">
                  {(group.activities || []).map((activity) => (
                    <ActivityRenderer key={activity.id} activity={activity} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No activity yet</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
