export type RealtimeEventType =
  | 'MESSAGE_CREATED'
  | 'MESSAGE_UPDATED'
  | 'MESSAGE_DELETED'
  | 'USER_TYPING'
  | 'USER_ONLINE'
  | 'USER_OFFLINE'
  | 'CHANNEL_UPDATED'
  | 'WORKSPACE_UPDATED'
  | 'REACTION_ADDED'
  | 'REACTION_REMOVED';

export interface RealtimeEvent<TPayload = unknown> {
  type: RealtimeEventType;
  payload: TPayload;
  timestamp: number;
  source: string;
}

export type EventListener<TPayload = unknown> = (event: RealtimeEvent<TPayload>) => void;

export interface EventSubscription {
  id: string;
  eventType: RealtimeEventType;
  listener: EventListener;
  unsubscribe: () => void;
}
