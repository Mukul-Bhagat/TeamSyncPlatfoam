export interface RealtimeLogEntry {
  timestamp: number;
  type: 'connection' | 'subscription' | 'event' | 'error';
  message: string;
  data?: unknown;
}

export class RealtimeLogger {
  private logs: RealtimeLogEntry[] = [];
  private maxLogs = 100;
  private listeners: Set<(logs: RealtimeLogEntry[]) => void> = new Set();

  log(type: RealtimeLogEntry['type'], message: string, data?: unknown): void {
    const entry: RealtimeLogEntry = {
      timestamp: Date.now(),
      type,
      message,
      data,
    };

    this.logs.push(entry);

    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    this.notifyListeners();
  }

  connection(message: string, data?: unknown): void {
    this.log('connection', message, data);
  }

  subscription(message: string, data?: unknown): void {
    this.log('subscription', message, data);
  }

  event(message: string, data?: unknown): void {
    this.log('event', message, data);
  }

  error(message: string, data?: unknown): void {
    this.log('error', message, data);
  }

  getLogs(): RealtimeLogEntry[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
    this.notifyListeners();
  }

  onLogsChange(callback: (logs: RealtimeLogEntry[]) => void): () => void {
    this.listeners.add(callback);

    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((callback) => {
      try {
        callback([...this.logs]);
      } catch (error) {
        console.error('Error in realtime log listener:', error);
      }
    });
  }
}

let globalLogger: RealtimeLogger | null = null;

export function getRealtimeLogger(): RealtimeLogger {
  if (!globalLogger) {
    globalLogger = new RealtimeLogger();
  }
  return globalLogger;
}
