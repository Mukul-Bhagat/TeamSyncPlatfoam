import { api } from '@/lib/api';
import type {
  AISummary,
  AIInsight,
  CreateSummaryRequest,
  GenerateAnalysisRequest,
  AnalysisResult,
} from '../types/ai.types';

export const aiService = {
  /**
   * Generate a summary
   */
  async generateSummary(request: CreateSummaryRequest): Promise<AISummary> {
    return api.post('/ai/summarize', request);
  },

  /**
   * List summaries with filters
   */
  async listSummaries(filters: {
    organization_id: string;
    workspace_id?: string;
    channel_id?: string;
    summary_type?: string;
    limit?: number;
  }): Promise<AISummary[]> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, String(value));
      }
    });
    return api.get(`/ai/summaries?${params.toString()}`);
  },

  /**
   * Get a specific summary
   */
  async getSummary(id: string): Promise<AISummary> {
    return api.get(`/ai/summaries/${id}`);
  },

  /**
   * List insights with filters
   */
  async listInsights(filters: {
    organization_id: string;
    workspace_id?: string;
    insight_type?: string;
    severity?: string;
    limit?: number;
  }): Promise<AIInsight[]> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, String(value));
      }
    });
    return api.get(`/ai/insights?${params.toString()}`);
  },

  /**
   * Generate analysis (manual trigger)
   */
  async generateAnalysis(request: GenerateAnalysisRequest): Promise<AnalysisResult> {
    return api.post('/ai/analyze', request);
  },

  /**
   * Health check for AI module
   */
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return api.get('/ai/health');
  },
};
