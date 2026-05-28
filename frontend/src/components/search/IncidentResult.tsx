import type { SearchResult } from '@/features/search/types/search.types';
import { AlertTriangle, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IncidentResultProps {
  result: SearchResult;
  onSelect: (result: SearchResult) => void;
}

export function IncidentResult({ result, onSelect }: IncidentResultProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const severity = result.metadata?.severity as string || 'info';
  const severityColor = {
    critical: 'bg-red-500/10 text-red-500 border-red-500/20',
    high: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    low: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    info: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  }[severity] || 'bg-gray-500/10 text-gray-500 border-gray-500/20';

  return (
    <button
      onClick={() => onSelect(result)}
      className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors border border-transparent hover:border-border"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
          <AlertTriangle className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="font-medium text-sm truncate">{result.title}</div>
            <span className={cn('text-xs px-2 py-0.5 rounded-full border', severityColor)}>
              {severity}
            </span>
          </div>
          <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{result.content}</div>
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(result.created_at)}</span>
          </div>
        </div>
      </div>
    </button>
  );
}
