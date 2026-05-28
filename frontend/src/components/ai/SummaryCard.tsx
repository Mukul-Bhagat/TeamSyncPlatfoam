import type { AISummary } from '@/features/ai/types/ai.types';
import { FileText, Calendar, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SummaryCardProps {
  summary: AISummary;
  className?: string;
}

export function SummaryCard({ summary, className }: SummaryCardProps) {
  const getSummaryTypeColor = (type: string) => {
    switch (type) {
      case 'deployment':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'incident':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'workspace_daily':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'activity_digest':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
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

  return (
    <div className={cn('bg-card border rounded-lg p-4 hover:border-primary/50 transition-colors', className)}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">{summary.title}</h3>
        </div>
        <span
          className={cn(
            'text-xs px-2 py-1 rounded-full border',
            getSummaryTypeColor(summary.summary_type)
          )}
        >
          {summary.summary_type.replace('_', ' ')}
        </span>
      </div>

      <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{summary.content}</p>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span>{formatDate(summary.created_at)}</span>
        </div>
        {summary.generated_by && (
          <div className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            <span>AI Generated</span>
          </div>
        )}
      </div>
    </div>
  );
}
