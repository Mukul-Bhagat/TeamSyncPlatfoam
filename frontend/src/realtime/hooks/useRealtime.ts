import { useEffect, useRef } from 'react';
import { RealtimeEngine } from '../engine';
import type { RealtimeEngineConfig } from '../engine';

let globalEngine: RealtimeEngine | null = null;

export function useRealtime(config?: RealtimeEngineConfig) {
  const engineRef = useRef<RealtimeEngine>();

  if (!globalEngine) {
    globalEngine = new RealtimeEngine(config);
  }

  engineRef.current = globalEngine;

  useEffect(() => {
    engineRef.current?.connect();

    return () => {
      // Don't disconnect on unmount - keep global engine alive
      // Components only manage their own subscriptions
    };
  }, []);

  return engineRef.current;
}

export function getRealtimeEngine(): RealtimeEngine {
  if (!globalEngine) {
    globalEngine = new RealtimeEngine({});
  }
  return globalEngine;
}
