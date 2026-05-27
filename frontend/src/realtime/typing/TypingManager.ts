import type { TypingState } from './types';

export class TypingManager {
  private typingState: TypingState = {};
  private debounceTimers: Map<string, number> = new Map();
  private cleanupTimers: Map<string, number> = new Map();
  private listeners: Set<(state: TypingState) => void> = new Set();
  private debounceMs = 300;
  private timeoutMs = 3000;

  constructor(debounceMs = 300, timeoutMs = 3000) {
    this.debounceMs = debounceMs;
    this.timeoutMs = timeoutMs;
  }

  startTyping(userId: string, channelId: string): void {
    const key = `${userId}:${channelId}`;

    // Clear existing debounce timer
    const existingDebounce = this.debounceTimers.get(key);
    if (existingDebounce) {
      clearTimeout(existingDebounce);
    }

    // Debounce the typing event
    const debounceTimer = setTimeout(() => {
      this.updateTypingState(userId, channelId, Date.now());
      this.scheduleCleanup(userId, channelId);
    }, this.debounceMs);

    this.debounceTimers.set(key, debounceTimer);
  }

  stopTyping(userId: string, channelId: string): void {
    const key = `${userId}:${channelId}`;

    // Clear debounce timer
    const debounceTimer = this.debounceTimers.get(key);
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      this.debounceTimers.delete(key);
    }

    // Clear cleanup timer
    const cleanupTimer = this.cleanupTimers.get(key);
    if (cleanupTimer) {
      clearTimeout(cleanupTimer);
      this.cleanupTimers.delete(key);
    }

    // Remove from typing state
    this.removeTypingState(userId, channelId);
  }

  getTypingUsers(channelId: string): string[] {
    const channelState = this.typingState[channelId];
    if (!channelState) return [];

    const now = Date.now();
    const activeUsers: string[] = [];

    for (const [userId, timestamp] of Object.entries(channelState)) {
      if (now - timestamp < this.timeoutMs) {
        activeUsers.push(userId);
      }
    }

    return activeUsers;
  }

  isUserTyping(userId: string, channelId: string): boolean {
    const channelState = this.typingState[channelId];
    if (!channelState) return false;

    const timestamp = channelState[userId];
    if (!timestamp) return false;

    return Date.now() - timestamp < this.timeoutMs;
  }

  onTypingStateChange(callback: (state: TypingState) => void): () => void {
    this.listeners.add(callback);

    return () => {
      this.listeners.delete(callback);
    };
  }

  private updateTypingState(userId: string, channelId: string, timestamp: number): void {
    if (!this.typingState[channelId]) {
      this.typingState[channelId] = {};
    }

    this.typingState[channelId][userId] = timestamp;
    this.notifyListeners();
  }

  private removeTypingState(userId: string, channelId: string): void {
    const channelState = this.typingState[channelId];
    if (channelState) {
      delete channelState[userId];

      if (Object.keys(channelState).length === 0) {
        delete this.typingState[channelId];
      }

      this.notifyListeners();
    }
  }

  private scheduleCleanup(userId: string, channelId: string): void {
    const key = `${userId}:${channelId}`;

    // Clear existing cleanup timer
    const existingCleanup = this.cleanupTimers.get(key);
    if (existingCleanup) {
      clearTimeout(existingCleanup);
    }

    // Schedule cleanup
    const cleanupTimer = setTimeout(() => {
      this.removeTypingState(userId, channelId);
      this.cleanupTimers.delete(key);
    }, this.timeoutMs);

    this.cleanupTimers.set(key, cleanupTimer);
  }

  private notifyListeners(): void {
    this.listeners.forEach((callback) => {
      try {
        callback({ ...this.typingState });
      } catch (error) {
        console.error('Error in typing state listener:', error);
      }
    });
  }

  cleanup(): void {
    // Clear all timers
    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer);
    }
    for (const timer of this.cleanupTimers.values()) {
      clearTimeout(timer);
    }

    this.debounceTimers.clear();
    this.cleanupTimers.clear();
    this.typingState = {};
    this.listeners.clear();
  }
}
