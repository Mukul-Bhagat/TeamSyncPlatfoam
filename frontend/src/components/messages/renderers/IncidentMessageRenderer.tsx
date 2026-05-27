import type { Message } from '@/features/messages/types/message.types';
import { AlertTriangle, Shield, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IncidentMessageRendererProps {
  message: Message;
}

export function IncidentMessageRenderer({ message }: IncidentMessageRendererProps) {
  const metadata = message.metadata as any;
  const severity = metadata?.severity || 'medium';
  const status = metadata?.status || 'open';

  const severityConfig = {
    low: { color: 'text-success', bg: 'bg-success/10', border: 'border-success/20' },
    medium: { color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/20' },
    high: { color: 'text-danger', bg: 'bg-danger/10', border: 'border-danger/20' },
    critical: { color: 'text-danger', bg: 'bg-danger/20', border: 'border-danger/40' },
  };

  const statusIcon = {
    open: Clock,
    investigating: Shield,
    resolved: CheckCircle2,
    closed: CheckCircle2,
  };

  const config = severityConfig[severity as keyof typeof severityConfig] || severityConfig.medium;
  const StatusIcon = statusIcon[status as keyof typeof statusIcon] || Clock;

  return (
    <div className={cn('p-4 border rounded-lg', config.bg, config.border)}>
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-white/10">
          <AlertTriangle className={cn('w-5 h-5', config.color)} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-foreground">Incident</span>
            <span className={cn('text-xs px-2 py-0.5 rounded-full uppercase', config.bg, config.color)}>
              {severity}
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <StatusIcon className="w-3 h-3" />
              {status}
            </span>
          </div>
          {message.content && (
            <p className="text-sm text-foreground mb-2">{message.content}</p>
          )}
          {metadata?.incidentId && (
            <div className="text-xs text-muted-foreground">
              ID: {metadata.incidentId}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
