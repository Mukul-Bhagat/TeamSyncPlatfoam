import type { IRealtimeTransport, ISubscription, IRealtimeEvent } from '../transport';
import { SupabaseRealtimeTransport } from '../transport';
import { SubscriptionRegistry } from '../subscriptions';
import { EventBus } from '../events';
import type { RealtimeEngineConfig, ConnectionStatus } from './types';
import type { ConnectionState } from '../transport';

export class RealtimeEngine {
  private transport: IRealtimeTransport;
  private subscriptionRegistry: SubscriptionRegistry;
  private eventBus: EventBus;
  private config: RealtimeEngineConfig;
  private connectionStatus: ConnectionStatus;
  private reconnectTimer: number | null = null;
  private reconnectAttempts = 0;

  constructor(config: RealtimeEngineConfig = {}) {
    this.config = {
      autoReconnect: true,
      reconnectInterval: 3000,
      maxReconnectAttempts: 10,
      ...config,
    };

    this.transport = new SupabaseRealtimeTransport();
    this.subscriptionRegistry = new SubscriptionRegistry();
    this.eventBus = new EventBus();
    this.connectionStatus = {
      state: 'DISCONNECTED',
    };

    this.setupTransportListeners();
  }

  async connect(): Promise<void> {
    try {
      await this.transport.connect();
      this.reconnectAttempts = 0;
    } catch (error) {
      console.error('Failed to connect to realtime:', error);
      if (this.config.autoReconnect) {
        this.scheduleReconnect();
      }
    }
  }

  async disconnect(): Promise<void> {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    await this.transport.disconnect();
    this.subscriptionRegistry.cleanup();
  }

  subscribe(channel: string, callback: (event: IRealtimeEvent) => void, owner: string): ISubscription {
    const subscription = this.transport.subscribe(channel, callback);
    this.subscriptionRegistry.register(subscription, owner);
    return subscription;
  }

  unsubscribe(subscription: ISubscription): void {
    this.subscriptionRegistry.unregisterByOwner(subscription.id);
  }

  unsubscribeByOwner(owner: string): void {
    this.subscriptionRegistry.unregisterByOwner(owner);
  }

  broadcast(channel: string, payload: unknown): void {
    this.transport.broadcast(channel, payload);
  }

  getConnectionStatus(): ConnectionStatus {
    return {
      ...this.connectionStatus,
      state: this.transport.getConnectionState(),
    };
  }

  getEventBus(): EventBus {
    return this.eventBus;
  }

  getSubscriptionRegistry(): SubscriptionRegistry {
    return this.subscriptionRegistry;
  }

  private setupTransportListeners(): void {
    this.transport.onConnectionChange((state: ConnectionState) => {
      this.connectionStatus.state = state;
      
      if (state === 'CONNECTED') {
        this.connectionStatus.lastConnected = Date.now();
        this.reconnectAttempts = 0;
      } else if (state === 'RECONNECTING' && this.config.autoReconnect) {
        this.scheduleReconnect();
      }
    });
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts!) {
      console.error('Max reconnection attempts reached');
      return;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectAttempts++;
    this.connectionStatus.reconnectAttempts = this.reconnectAttempts;

    this.reconnectTimer = setTimeout(async () => {
      try {
        await this.connect();
      } catch (error) {
        console.error('Reconnection failed:', error);
        this.scheduleReconnect();
      }
    }, this.config.reconnectInterval!);
  }
}
