import type { ConnectionState } from '../transport';

export interface RealtimeEngineConfig {
  autoReconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export interface ConnectionStatus {
  state: ConnectionState;
  lastConnected?: number;
  reconnectAttempts?: number;
}
