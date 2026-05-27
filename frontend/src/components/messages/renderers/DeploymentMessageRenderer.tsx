import type { Message } from '@/features/messages/types/message.types';
import { Rocket, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DeploymentMessageRendererProps {
  message: Message;
}

export function DeploymentMessageRenderer({ message }: DeploymentMessageRendererProps) {
  const metadata = message.metadata as any;
  const status = metadata?.status || 'pending';

  const statusConfig = {
    pending: { icon: Clock, color: 'text-warning', bg: 'bg-warning/10' },
    running: { icon: Rocket, color: 'text-primary', bg: 'bg-primary/10' },
    success: { icon: CheckCircle, color: 'text-success', bg: 'bg-success/10' },
    failed: { icon: XCircle, color: 'text-danger', bg: 'bg-danger/10' },
    cancelled: { icon: AlertCircle, color: 'text-muted-foreground', bg: 'bg-muted' },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  const StatusIcon = config.icon;

  return (
    <div className="p-4 bg-glass/50 border border-glass-border rounded-lg">
      <div className="flex items-start gap-3">
        <div className={cn('p-2 rounded-lg', config.bg)}>
          <StatusIcon className={cn('w-5 h-5', config.color)} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-foreground">Deployment</span>
            <span className={cn('text-xs px-2 py-0.5 rounded-full', config.bg, config.color)}>
              {status}
            </span>
          </div>
          {message.content && (
            <p className="text-sm text-foreground mb-2">{message.content}</p>
          )}
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            {metadata?.environment && (
              <span>Environment: {metadata.environment}</span>
            )}
            {metadata?.version && (
              <span>Version: {metadata.version}</span>
            )}
            {metadata?.service && (
              <span>Service: {metadata.service}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
