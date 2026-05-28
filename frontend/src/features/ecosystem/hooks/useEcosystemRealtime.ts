import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { EcosystemEventItem } from '@/features/integrations/types/integration.types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export function useEcosystemRealtime(organizationId: string) {
  const queryClient = useQueryClient();
  const eventSourceRef = useRef<EventSource | null>(null);

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data) as EcosystemEventItem;

        // Prepend new event to event logs cache
        queryClient.setQueryData<EcosystemEventItem[]>(
          ['event-logs', organizationId],
          (old) => {
            if (!old) return [data];
            return [data, ...old].slice(0, 100);
          }
        );

        // Invalidate activity feed so it refetches or update cache
        queryClient.setQueryData(
          ['activities'],
          (old: unknown) => {
            // Activities cache will refetch on next access
            return old;
          }
        );
        queryClient.invalidateQueries({ queryKey: ['activities'] });
      } catch {
        // Ignore malformed SSE messages
      }
    },
    [queryClient, organizationId]
  );

  useEffect(() => {
    if (!organizationId) return;

    const url = `${API_BASE}/realtime/events`;
    const es = new EventSource(url, {
      headers: { 'x-organization-id': organizationId } as Record<string, string>,
    });

    eventSourceRef.current = es;

    es.addEventListener('open', () => {
      console.log('[EcosystemRealtime] SSE connected');
    });

    es.addEventListener('message', handleMessage);

    es.addEventListener('error', () => {
      console.error('[EcosystemRealtime] SSE error');
      es.close();
    });

    return () => {
      es.removeEventListener('message', handleMessage);
      es.close();
      eventSourceRef.current = null;
    };
  }, [organizationId, handleMessage]);

  return { connected: !!eventSourceRef.current };
}
