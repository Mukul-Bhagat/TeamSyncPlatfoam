import type { SearchResult } from '@/features/search/types/search.types';
import { FileText, Calendar, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SummaryResultProps {
  result: SearchResult;
  onSelect: (result: SearchResult) => void;
}

export function SummaryResult({ result, onSelect }: SummaryResultProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const summaryType = result.metadata?.summary_type as string || 'general';
  const typeColor = {
    deployment: 'bg-blue-500/10 text-blue-500',
    incident: 'bg-orange-500/10 text-orange-500',
    workspace_daily: 'bg-purple-500/10 text-purple-500',
    activity_digest: 'bg-green-500/10 text-green-500',
  }[summaryType] || 'bg-gray-500/10 text-gray-500';

  return (
    <button
      onClick={() => onSelect(result)}
      className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors border border-transparent hover:border-border"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
          <FileText className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="font-medium text-sm truncate">{result.title}</div>
            <span className={cn('text-xs px-2 py-0.5 rounded-full', typeColor)}>
              {summaryType.replace('_', ' ')}
            </span>
          </div>
          <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{result.content}</div>
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <Bot className="h-3 w-3" />
            <span>AI Generated</span>
            <Calendar className="h-3 w-3 ml-2" />
            <span>{formatDate(result.created_at)}</span>
          </div>
        </div>
      </div>
    </button>
  );
}
