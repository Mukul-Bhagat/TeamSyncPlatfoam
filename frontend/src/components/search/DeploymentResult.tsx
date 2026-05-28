import type { SearchResult } from '@/features/search/types/search.types';
import { Rocket, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DeploymentResultProps {
  result: SearchResult;
  onSelect: (result: SearchResult) => void;
}

export function DeploymentResult({ result, onSelect }: DeploymentResultProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const status = result.metadata?.status as string || 'pending';
  const statusConfig = {
    succeeded: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
    failed: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
    pending: { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    running: { icon: Rocket, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  }[status] || { icon: Clock, color: 'text-gray-500', bg: 'bg-gray-500/10' };

  const StatusIcon = statusConfig.icon;

  return (
    <button
      onClick={() => onSelect(result)}
      className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors border border-transparent hover:border-border"
    >
      <div className="flex items-start gap-3">
        <div className={cn('p-2 rounded-lg', statusConfig.bg, statusConfig.color)}>
          <StatusIcon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">{result.title}</div>
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
