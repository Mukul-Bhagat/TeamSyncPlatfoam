import type { MemoryEntity } from '@/features/search/types/search.types';
import { Rocket, AlertTriangle, Calendar } from 'lucide-react';

interface DeploymentPatternCardProps {
  memory: MemoryEntity;
}

export function DeploymentPatternCard({ memory }: DeploymentPatternCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const metadata = memory.metadata as Record<string, unknown>;
  const failureCount = metadata?.failure_count as number || 0;
  const service = metadata?.service as string || 'Unknown';

  return (
    <div className="p-3 bg-card border rounded-lg hover:border-orange-500/50 transition-colors">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
          <Rocket className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm">{memory.title}</div>
          <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{memory.content}</div>
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 text-orange-500" />
              <span>{failureCount} failures</span>
            </div>
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
