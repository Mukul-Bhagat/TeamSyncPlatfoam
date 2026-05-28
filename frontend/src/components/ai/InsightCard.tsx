import type { AIInsight } from '@/features/ai/types/ai.types';
import { AlertTriangle, Calendar, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InsightCardProps {
  insight: AIInsight;
  className?: string;
}

export function InsightCard({ insight, className }: InsightCardProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'warning':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'info':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getInsightTypeIcon = (type: string) => {
    switch (type) {
      case 'deployment_risk':
      case 'incident_pattern':
        return AlertTriangle;
      case 'activity_spike':
      case 'anomaly_detected':
        return Zap;
      default:
        return AlertTriangle;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const Icon = getInsightTypeIcon(insight.insight_type);

  return (
    <div className={cn('bg-card border rounded-lg p-4 hover:border-primary/50 transition-colors', className)}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">{insight.title}</h3>
        </div>
        <span
          className={cn(
            'text-xs px-2 py-1 rounded-full border capitalize',
            getSeverityColor(insight.severity)
          )}
        >
          {insight.severity}
        </span>
      </div>

      <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{insight.description}</p>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span>{formatDate(insight.created_at)}</span>
        </div>
        {insight.source_event_ids && insight.source_event_ids.length > 0 && (
          <span>{insight.source_event_ids.length} event(s)</span>
        )}
      </div>
    </div>
  );
}
