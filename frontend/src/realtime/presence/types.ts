export type PresenceStatus = 'online' | 'offline' | 'away' | 'busy';

export interface UserPresence {
  userId: string;
  status: PresenceStatus;
  lastSeen: number;
  activeWorkspaceId?: string;
  activeChannelId?: string;
}

export interface PresenceState {
  [userId: string]: UserPresence;
}
