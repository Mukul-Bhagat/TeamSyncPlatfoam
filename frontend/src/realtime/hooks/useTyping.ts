import { useEffect, useRef, useState, useCallback } from 'react';
import { TypingManager } from '../typing';
import type { TypingState } from '../typing';

let globalTypingManager: TypingManager | null = null;

export function useTyping() {
  const typingManagerRef = useRef<TypingManager>();
  const [typingState, setTypingState] = useState<TypingState>({});

  if (!globalTypingManager) {
    globalTypingManager = new TypingManager();
  }

  typingManagerRef.current = globalTypingManager;

  useEffect(() => {
    const manager = typingManagerRef.current;
    if (!manager) return;

    const unsubscribe = manager.onTypingStateChange(setTypingState);

    return () => {
      unsubscribe();
    };
  }, []);

  const startTyping = useCallback((userId: string, channelId: string) => {
    typingManagerRef.current?.startTyping(userId, channelId);
  }, []);

  const stopTyping = useCallback((userId: string, channelId: string) => {
    typingManagerRef.current?.stopTyping(userId, channelId);
  }, []);

  const getTypingUsers = useCallback((channelId: string) => {
    return typingManagerRef.current?.getTypingUsers(channelId) || [];
  }, []);

  const isUserTyping = useCallback((userId: string, channelId: string) => {
    return typingManagerRef.current?.isUserTyping(userId, channelId) || false;
  }, []);

  return {
    typingState,
    startTyping,
    stopTyping,
    getTypingUsers,
    isUserTyping,
  };
}

export function getTypingManager(): TypingManager {
  if (!globalTypingManager) {
    globalTypingManager = new TypingManager();
  }
  return globalTypingManager;
}
