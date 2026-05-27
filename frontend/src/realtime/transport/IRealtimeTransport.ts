export type ConnectionState = 'CONNECTED' | 'CONNECTING' | 'RECONNECTING' | 'DISCONNECTED' | 'OFFLINE';

export interface IRealtimeEvent {
  type: string;
  payload: unknown;
  timestamp: number;
  source: string;
}

export interface ISubscription {
  id: string;
  channel: string;
  callback: (event: IRealtimeEvent) => void;
  isActive: boolean;
  unsubscribe: () => void;
}

export interface IRealtimeTransport {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  subscribe(channel: string, callback: (event: IRealtimeEvent) => void): ISubscription;
  unsubscribe(subscription: ISubscription): void;
  broadcast(channel: string, payload: unknown): void;
  getConnectionState(): ConnectionState;
  onConnectionChange(callback: (state: ConnectionState) => void): () => void;
}
