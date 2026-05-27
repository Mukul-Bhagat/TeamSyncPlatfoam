import { useEffect, useRef, useState, useCallback } from 'react';
import { PresenceManager } from '../presence';
import type { PresenceState, UserPresence } from '../presence';

let globalPresenceManager: PresenceManager | null = null;

export function usePresence() {
  const presenceManagerRef = useRef<PresenceManager>();
  const [presenceState, setPresenceState] = useState<PresenceState>({});

  if (!globalPresenceManager) {
    globalPresenceManager = new PresenceManager(30000);
  }

  presenceManagerRef.current = globalPresenceManager;

  useEffect(() => {
    const manager = presenceManagerRef.current;
    if (!manager) return;

    const unsubscribe = manager.onPresenceChange(setPresenceState);

    return () => {
      unsubscribe();
    };
  }, []);

  const setOnline = useCallback((userId: string, activeWorkspaceId?: string, activeChannelId?: string) => {
    presenceManagerRef.current?.setOnline(userId, activeWorkspaceId, activeChannelId);
  }, []);

  const setOffline = useCallback((userId: string) => {
    presenceManagerRef.current?.setOffline(userId);
  }, []);

  const setAway = useCallback((userId: string) => {
    presenceManagerRef.current?.setAway(userId);
  }, []);

  const setBusy = useCallback((userId: string) => {
    presenceManagerRef.current?.setBusy(userId);
  }, []);

  const getPresence = useCallback((userId: string) => {
    return presenceManagerRef.current?.getPresence(userId);
  }, []);

  const getChannelPresence = useCallback((channelId: string) => {
    return presenceManagerRef.current?.getChannelPresence(channelId) || [];
  }, []);

  const getWorkspacePresence = useCallback((workspaceId: string) => {
    return presenceManagerRef.current?.getWorkspacePresence(workspaceId) || [];
  }, []);

  const isUserOnline = useCallback((userId: string) => {
    return presenceManagerRef.current?.isUserOnline(userId) || false;
  }, []);

  return {
    presenceState,
    setOnline,
    setOffline,
    setAway,
    setBusy,
    getPresence,
    getChannelPresence,
    getWorkspacePresence,
    isUserOnline,
  };
}

export function getPresenceManager(): PresenceManager {
  if (!globalPresenceManager) {
    globalPresenceManager = new PresenceManager(30000);
  }
  return globalPresenceManager;
}
