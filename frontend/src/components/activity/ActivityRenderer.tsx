import type { ActivityFeedEvent } from '@/features/activity/types/activity.types';
import { ActivityEventType } from '@/features/activity/types/activity.types';
import {
  DeploymentActivityRenderer,
  IncidentActivityRenderer,
  AIActivityRenderer,
  MessageActivityRenderer,
  WorkspaceActivityRenderer,
  ChannelActivityRenderer,
  UserActivityRenderer,
} from './renderers';

interface ActivityRendererProps {
  activity: ActivityFeedEvent;
}

export function ActivityRenderer({ activity }: ActivityRendererProps) {
  switch (activity.event_type) {
    case ActivityEventType.DEPLOYMENT_STARTED:
    case ActivityEventType.DEPLOYMENT_SUCCEEDED:
    case ActivityEventType.DEPLOYMENT_FAILED:
      return <DeploymentActivityRenderer activity={activity} />;
    
    case ActivityEventType.INCIDENT_OPENED:
    case ActivityEventType.INCIDENT_UPDATED:
    case ActivityEventType.INCIDENT_RESOLVED:
      return <IncidentActivityRenderer activity={activity} />;
    
    case ActivityEventType.AI_SUMMARY_GENERATED:
      return <AIActivityRenderer activity={activity} />;
    
    case ActivityEventType.MESSAGE_CREATED:
    case ActivityEventType.MESSAGE_UPDATED:
    case ActivityEventType.MESSAGE_DELETED:
      return <MessageActivityRenderer activity={activity} />;
    
    case ActivityEventType.WORKSPACE_CREATED:
    case ActivityEventType.WORKSPACE_UPDATED:
      return <WorkspaceActivityRenderer activity={activity} />;
    
    case ActivityEventType.CHANNEL_CREATED:
    case ActivityEventType.CHANNEL_UPDATED:
      return <ChannelActivityRenderer activity={activity} />;
    
    case ActivityEventType.USER_JOINED_WORKSPACE:
    case ActivityEventType.USER_LEFT_WORKSPACE:
      return <UserActivityRenderer activity={activity} />;
    
    default:
      return <MessageActivityRenderer activity={activity} />;
  }
}
