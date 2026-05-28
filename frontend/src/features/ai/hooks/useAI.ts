import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aiService } from '../services/ai.service';
import type {
  AISummary,
  AIInsight,
  CreateSummaryRequest,
  GenerateAnalysisRequest,
} from '../types/ai.types';

/**
 * Hook to list AI summaries
 */
export function useAISummaries(filters: {
  organization_id: string;
  workspace_id?: string;
  channel_id?: string;
  summary_type?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['ai-summaries', filters],
    queryFn: () => aiService.listSummaries(filters),
    enabled: !!filters.organization_id,
  });
}

/**
 * Hook to get a specific AI summary
 */
export function useAISummary(id: string) {
  return useQuery({
    queryKey: ['ai-summary', id],
    queryFn: () => aiService.getSummary(id),
    enabled: !!id,
  });
}

/**
 * Hook to generate a summary
 */
export function useGenerateSummary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateSummaryRequest) => aiService.generateSummary(request),
    onSuccess: (_, { organization_id, workspace_id }) => {
      queryClient.invalidateQueries({ queryKey: ['ai-summaries'] });
      if (workspace_id) {
        queryClient.invalidateQueries({ queryKey: ['ai-summaries', { workspace_id }] });
      }
    },
  });
}

/**
 * Hook to list AI insights
 */
export function useAIInsights(filters: {
  organization_id: string;
  workspace_id?: string;
  insight_type?: string;
  severity?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['ai-insights', filters],
    queryFn: () => aiService.listInsights(filters),
    enabled: !!filters.organization_id,
  });
}

/**
 * Hook to generate analysis
 */
export function useGenerateAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: GenerateAnalysisRequest) => aiService.generateAnalysis(request),
    onSuccess: (_, { organization_id, workspace_id }) => {
      queryClient.invalidateQueries({ queryKey: ['ai-summaries'] });
      queryClient.invalidateQueries({ queryKey: ['ai-insights'] });
      if (workspace_id) {
        queryClient.invalidateQueries({ queryKey: ['ai-summaries', { workspace_id }] });
        queryClient.invalidateQueries({ queryKey: ['ai-insights', { workspace_id }] });
      }
    },
  });
}

/**
 * Hook to check AI health
 */
export function useAIHealth() {
  return useQuery({
    queryKey: ['ai-health'],
    queryFn: () => aiService.healthCheck(),
    refetchInterval: 60000, // Check every minute
  });
}
