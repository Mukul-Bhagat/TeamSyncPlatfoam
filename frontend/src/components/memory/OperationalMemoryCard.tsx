import type { MemoryEntity } from '@/features/search/types/search.types';
import { Brain, Calendar, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OperationalMemoryCardProps {
  memory: MemoryEntity;
}

export function OperationalMemoryCard({ memory }: OperationalMemoryCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const isAI = memory.memory_type === 'ai_generated_memory';

  return (
    <div className="p-3 bg-card border rounded-lg hover:border-blue-500/50 transition-colors">
      <div className="flex items-start gap-3">
        <div className={cn(
          'p-2 rounded-lg',
          isAI ? 'bg-purple-500/10 text-purple-500' : 'bg-blue-500/10 text-blue-500'
        )}>
          {isAI ? <Sparkles className="h-4 w-4" /> : <Brain className="h-4 w-4" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm">{memory.title}</div>
          <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{memory.content}</div>
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            {isAI && (
              <div className="flex items-center gap-1 text-purple-500">
                <Sparkles className="h-3 w-3" />
                <span>AI Generated</span>
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
