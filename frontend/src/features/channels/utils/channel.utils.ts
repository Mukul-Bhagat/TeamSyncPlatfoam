import { MessageSquare, Mic, Megaphone, AlertTriangle, Rocket, Brain, Activity } from 'lucide-react';
import { ChannelType } from '../types/channel.types';

export const CHANNEL_TYPE_ICONS: Record<ChannelType, any> = {
  [ChannelType.TEXT]: MessageSquare,
  [ChannelType.VOICE]: Mic,
  [ChannelType.ANNOUNCEMENT]: Megaphone,
  [ChannelType.INCIDENT]: AlertTriangle,
  [ChannelType.DEPLOYMENT]: Rocket,
  [ChannelType.AI]: Brain,
  [ChannelType.ACTIVITY_FEED]: Activity,
};

export const CHANNEL_TYPE_LABELS: Record<ChannelType, string> = {
  [ChannelType.TEXT]: 'Text Channels',
  [ChannelType.VOICE]: 'Voice Channels',
  [ChannelType.ANNOUNCEMENT]: 'Announcements',
  [ChannelType.INCIDENT]: 'Incident Rooms',
  [ChannelType.DEPLOYMENT]: 'Deployment Feeds',
  [ChannelType.AI]: 'AI Rooms',
  [ChannelType.ACTIVITY_FEED]: 'Activity Feeds',
};

export const CHANNEL_CATEGORIES = [
  ChannelType.TEXT,
  ChannelType.VOICE,
  ChannelType.AI,
  ChannelType.DEPLOYMENT,
  ChannelType.INCIDENT,
  ChannelType.ANNOUNCEMENT,
  ChannelType.ACTIVITY_FEED,
];
