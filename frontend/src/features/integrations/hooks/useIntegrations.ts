import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { integrationService } from '@/features/integrations/services/integration.service';
import type { IntegrationConfig } from '@/features/integrations/types/integration.types';

export function useIntegrations(organizationId: string) {
  return useQuery({
    queryKey: ['integrations', organizationId],
    queryFn: () => integrationService.listIntegrations(organizationId),
    enabled: !!organizationId,
  });
}

export function useIntegration(organizationId: string, name: string) {
  return useQuery({
    queryKey: ['integration', organizationId, name],
    queryFn: () => integrationService.getIntegration(organizationId, name),
    enabled: !!organizationId && !!name,
  });
}

export function useCreateIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      organization_id: string;
      integration_name: string;
      enabled?: boolean;
      config?: Record<string, unknown>;
      webhook_url?: string;
      webhook_secret?: string;
      api_key?: string;
    }) => integrationService.createIntegration(input),
    onSuccess: (_, { organization_id }) => {
      queryClient.invalidateQueries({ queryKey: ['integrations', organization_id] });
    },
  });
}

export function useUpdateIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<IntegrationConfig> }) =>
      integrationService.updateIntegration(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
  });
}

export function useDeleteIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string; organizationId: string }) =>
      integrationService.deleteIntegration(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['integrations', variables.organizationId] });
    },
  });
}

export function useIntegrationHealth(organizationId: string, name: string) {
  return useQuery({
    queryKey: ['integration-health', organizationId, name],
    queryFn: () => integrationService.heartbeat(name, organizationId),
    enabled: false,
  });
}

export function useWebhookConfig(organizationId: string, name: string) {
  return useQuery({
    queryKey: ['webhook-config', organizationId, name],
    queryFn: () => integrationService.getWebhookConfig(organizationId, name),
    enabled: !!organizationId && !!name,
  });
}

export function useEventLogs(organizationId: string, filters?: {
  source_app?: string;
  event_type?: string;
  severity?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['event-logs', organizationId, filters],
    queryFn: () => integrationService.getEventLogs(organizationId, {
      limit: filters?.limit?.toString(),
      source_app: filters?.source_app,
      event_type: filters?.event_type,
      severity: filters?.severity,
    }),
    enabled: !!organizationId,
  });
}

export function useEventStats(organizationId: string) {
  return useQuery({
    queryKey: ['event-stats', organizationId],
    queryFn: () => integrationService.getEventStats(organizationId),
    enabled: !!organizationId,
  });
}
