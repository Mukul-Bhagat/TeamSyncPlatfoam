import type { MemoryEntity } from '@/features/search/types/search.types';
import { AlertTriangle, Calendar, Repeat } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IncidentMemoryCardProps {
  memory: MemoryEntity;
}

export function IncidentMemoryCard({ memory }: IncidentMemoryCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const metadata = memory.metadata as Record<string, unknown>;
  const occurrenceCount = metadata?.occurrence_count as number || 1;
  const severity = metadata?.severity as string || 'info';

  const severityColor = {
    critical: 'text-red-500',
    high: 'text-orange-500',
    medium: 'text-yellow-500',
    low: 'text-blue-500',
    info: 'text-gray-500',
  }[severity] || 'text-gray-500';

  return (
    <div className="p-3 bg-card border rounded-lg hover:border-red-500/50 transition-colors">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
          <AlertTriangle className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="font-medium text-sm truncate">{memory.title}</div>
            <span className={cn('text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-500')}>
              {severity}
            </span>
          </div>
          <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{memory.content}</div>
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            {memory.memory_type === 'recurring_issue' && (
              <div className="flex items-center gap-1">
                <Repeat className="h-3 w-3 text-yellow-500" />
                <span>{occurrenceCount} occurrences</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(memory.created_at)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
