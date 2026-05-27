import { useRealtime } from '@/realtime/hooks';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ConnectionStatusIndicator() {
  const realtime = useRealtime();
  const connectionStatus = realtime?.getConnectionStatus();

  if (!connectionStatus) return null;

  const getStatusConfig = () => {
    switch (connectionStatus.state) {
      case 'CONNECTED':
        return {
          icon: Wifi,
          color: 'text-success',
          bgColor: 'bg-success/10',
          label: 'Connected',
        };
      case 'CONNECTING':
      case 'RECONNECTING':
        return {
          icon: Loader2,
          color: 'text-warning',
          bgColor: 'bg-warning/10',
          label: connectionStatus.state === 'RECONNECTING' ? 'Reconnecting...' : 'Connecting...',
          animate: true,
        };
      case 'DISCONNECTED':
      case 'OFFLINE':
        return {
          icon: WifiOff,
          color: 'text-danger',
          bgColor: 'bg-danger/10',
          label: 'Offline',
        };
      default:
        return {
          icon: WifiOff,
          color: 'text-muted-foreground',
          bgColor: 'bg-muted',
          label: 'Unknown',
        };
    }
  };

  const config = getStatusConfig();
  const StatusIcon = config.icon;

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-full',
        'bg-glass border border-glass-border',
        config.bgColor,
        config.color
      )}
      title={config.label}
    >
      <StatusIcon className={cn('w-3 h-3', config.animate && 'animate-spin')} />
      <span className="text-xs font-medium">{config.label}</span>
    </div>
  );
}
