import type { UserPresence, PresenceState } from './types';

export class PresenceManager {
  private presenceState: PresenceState = {};
  private listeners: Set<(state: PresenceState) => void> = new Set();
  private cleanupTimers: Map<string, number> = new Map();
  private timeoutMs = 30000; // 30 seconds

  constructor(timeoutMs = 30000) {
    this.timeoutMs = timeoutMs;
  }

  updatePresence(presence: UserPresence): void {
    this.presenceState[presence.userId] = presence;
    this.scheduleCleanup(presence.userId);
    this.notifyListeners();
  }

  setOnline(userId: string, activeWorkspaceId?: string, activeChannelId?: string): void {
    this.updatePresence({
      userId,
      status: 'online',
      lastSeen: Date.now(),
      activeWorkspaceId,
      activeChannelId,
    });
  }

  setOffline(userId: string): void {
    this.updatePresence({
      userId,
      status: 'offline',
      lastSeen: Date.now(),
    });
  }

  setAway(userId: string): void {
    const existing = this.presenceState[userId];
    this.updatePresence({
      userId,
      status: 'away',
      lastSeen: Date.now(),
      activeWorkspaceId: existing?.activeWorkspaceId,
      activeChannelId: existing?.activeChannelId,
    });
  }

  setBusy(userId: string): void {
    const existing = this.presenceState[userId];
    this.updatePresence({
      userId,
      status: 'busy',
      lastSeen: Date.now(),
      activeWorkspaceId: existing?.activeWorkspaceId,
      activeChannelId: existing?.activeChannelId,
    });
  }

  getPresence(userId: string): UserPresence | undefined {
    return this.presenceState[userId];
  }

  getChannelPresence(channelId: string): UserPresence[] {
    const users: UserPresence[] = [];

    for (const presence of Object.values(this.presenceState)) {
      if (presence.activeChannelId === channelId && presence.status !== 'offline') {
        users.push(presence);
      }
    }

    return users;
  }

  getWorkspacePresence(workspaceId: string): UserPresence[] {
    const users: UserPresence[] = [];

    for (const presence of Object.values(this.presenceState)) {
      if (presence.activeWorkspaceId === workspaceId && presence.status !== 'offline') {
        users.push(presence);
      }
    }

    return users;
  }

  isUserOnline(userId: string): boolean {
    const presence = this.presenceState[userId];
    if (!presence) return false;

    return presence.status === 'online' || presence.status === 'busy';
  }

  onPresenceChange(callback: (state: PresenceState) => void): () => void {
    this.listeners.add(callback);

    return () => {
      this.listeners.delete(callback);
    };
  }

  private scheduleCleanup(userId: string): void {
    const existingTimer = this.cleanupTimers.get(userId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const timer = setTimeout(() => {
      this.setOffline(userId);
      this.cleanupTimers.delete(userId);
    }, this.timeoutMs);

    this.cleanupTimers.set(userId, timer);
  }

  private notifyListeners(): void {
    this.listeners.forEach((callback) => {
      try {
        callback({ ...this.presenceState });
      } catch (error) {
        console.error('Error in presence listener:', error);
      }
    });
  }

  cleanup(): void {
    for (const timer of this.cleanupTimers.values()) {
      clearTimeout(timer);
    }

    this.cleanupTimers.clear();
    this.presenceState = {};
    this.listeners.clear();
  }
}
