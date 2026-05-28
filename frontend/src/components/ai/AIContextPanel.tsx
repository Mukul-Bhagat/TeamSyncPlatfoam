import { useState } from 'react';
import { useAISummaries, useAIInsights } from '@/features/ai/hooks/useAI';
import { SummaryCard } from './SummaryCard';
import { InsightCard } from './InsightCard';
import { Bot, Lightbulb, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface AIContextPanelProps {
  organizationId: string;
  workspaceId?: string;
  channelId?: string;
}

export function AIContextPanel({ organizationId, workspaceId, channelId }: AIContextPanelProps) {
  const [summariesExpanded, setSummariesExpanded] = useState(true);
  const [insightsExpanded, setInsightsExpanded] = useState(true);

  const { data: summaries, isLoading: summariesLoading } = useAISummaries({
    organization_id: organizationId,
    workspace_id: workspaceId,
    channel_id: channelId,
    limit: 5,
  });

  const { data: insights, isLoading: insightsLoading } = useAIInsights({
    organization_id: organizationId,
    workspace_id: workspaceId,
    limit: 5,
  });

  return (
    <div className="space-y-4">
      {/* AI Summaries Section */}
      <div className="border rounded-lg overflow-hidden">
        <button
          onClick={() => setSummariesExpanded(!summariesExpanded)}
          className="w-full flex items-center justify-between p-3 bg-muted/50 hover:bg-muted transition-colors"
        >
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm">AI Summaries</span>
            {summaries && summaries.length > 0 && (
              <span className="text-xs text-muted-foreground">({summaries.length})</span>
            )}
          </div>
          {summariesExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>

        {summariesExpanded && (
          <div className="p-3 space-y-3 max-h-96 overflow-y-auto">
            {summariesLoading ? (
              <div className="flex justify-center py-4">
                <LoadingSpinner size="sm" />
              </div>
            ) : summaries && summaries.length > 0 ? (
              summaries.map((summary) => (
                <SummaryCard key={summary.id} summary={summary} />
              ))
            ) : (
              <div className="text-center py-4 text-sm text-muted-foreground">
                No AI summaries available
              </div>
            )}
          </div>
        )}
      </div>

      {/* Operational Insights Section */}
      <div className="border rounded-lg overflow-hidden">
        <button
          onClick={() => setInsightsExpanded(!insightsExpanded)}
          className="w-full flex items-center justify-between p-3 bg-muted/50 hover:bg-muted transition-colors"
        >
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm">Operational Insights</span>
            {insights && insights.length > 0 && (
              <span className="text-xs text-muted-foreground">({insights.length})</span>
            )}
          </div>
          {insightsExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>

        {insightsExpanded && (
          <div className="p-3 space-y-3 max-h-96 overflow-y-auto">
            {insightsLoading ? (
              <div className="flex justify-center py-4">
                <LoadingSpinner size="sm" />
              </div>
            ) : insights && insights.length > 0 ? (
              insights.map((insight) => (
                <InsightCard key={insight.id} insight={insight} />
              ))
            ) : (
              <div className="text-center py-4 text-sm text-muted-foreground">
                No operational insights available
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recommendations Section (placeholder for future) */}
      <div className="border rounded-lg p-3 bg-muted/30">
        <div className="flex items-center gap-2 mb-2">
          <RefreshCw className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm">Recommendations</span>
        </div>
        <p className="text-xs text-muted-foreground">
          AI-powered recommendations will appear here based on your team's activity and patterns.
        </p>
      </div>
    </div>
  );
}
