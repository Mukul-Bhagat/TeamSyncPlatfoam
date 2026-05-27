import { RealtimeChannel, RealtimeClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { IRealtimeTransport, ISubscription, IRealtimeEvent, ConnectionState } from './IRealtimeTransport';

export class SupabaseRealtimeTransport implements IRealtimeTransport {
  private client: RealtimeClient;
  private channels: Map<string, RealtimeChannel> = new Map();
  private subscriptions: Map<string, ISubscription> = new Map();
  private connectionState: ConnectionState = 'DISCONNECTED';
  private connectionCallbacks: Set<(state: ConnectionState) => void> = new Set();
  private subscriptionIdCounter = 0;

  constructor() {
    this.client = supabase.realtime;
  }

  async connect(): Promise<void> {
    this.setConnectionState('CONNECTING');
    
    try {
      // Supabase realtime connects automatically when channels are subscribed
      // We'll set state to CONNECTED when first subscription succeeds
      this.setConnectionState('CONNECTED');
    } catch (error) {
      this.setConnectionState('OFFLINE');
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    // Unsubscribe all channels
    for (const [_id, subscription] of this.subscriptions) {
      this.unsubscribe(subscription);
    }
    
    this.setConnectionState('DISCONNECTED');
  }

  subscribe(channel: string, callback: (event: IRealtimeEvent) => void): ISubscription {
    const _subscriptionId = `sub_${this.subscriptionIdCounter++}`;
    
    // Get or create Supabase channel
    let supabaseChannel = this.channels.get(channel);
    if (!supabaseChannel) {
      supabaseChannel = this.client.channel(channel);
      this.channels.set(channel, supabaseChannel);
    }

    // Create subscription object
    const subscription: ISubscription = {
      id: _subscriptionId,
      channel,
      callback,
      isActive: true,
      unsubscribe: () => {
        this.unsubscribe(subscription);
      },
    };

    this.subscriptions.set(_subscriptionId, subscription);

    // Subscribe to Supabase channel
    supabaseChannel
      .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
        const realtimeEvent: IRealtimeEvent = {
          type: payload.eventType,
          payload,
          timestamp: Date.now(),
          source: 'supabase',
        };
        callback(realtimeEvent);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          this.setConnectionState('CONNECTED');
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          this.setConnectionState('RECONNECTING');
        }
      });

    return subscription;
  }

  unsubscribe(subscription: ISubscription): void {
    subscription.isActive = false;
    this.subscriptions.delete(subscription.id);

    // Check if any other subscriptions exist for this channel
    const hasOtherSubscriptions = Array.from(this.subscriptions.values()).some(
      (sub) => sub.channel === subscription.channel && sub.isActive
    );

    if (!hasOtherSubscriptions) {
      const supabaseChannel = this.channels.get(subscription.channel);
      if (supabaseChannel) {
        supabaseChannel.unsubscribe();
        this.channels.delete(subscription.channel);
      }
    }
  }

  broadcast(channel: string, payload: unknown): void {
    const supabaseChannel = this.channels.get(channel);
    if (supabaseChannel) {
      supabaseChannel.send({
        type: 'broadcast',
        event: 'message',
        payload,
      });
    }
  }

  getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  onConnectionChange(callback: (state: ConnectionState) => void): () => void {
    this.connectionCallbacks.add(callback);
    
    // Return cleanup function
    return () => {
      this.connectionCallbacks.delete(callback);
    };
  }

  private setConnectionState(state: ConnectionState): void {
    if (this.connectionState !== state) {
      this.connectionState = state;
      this.connectionCallbacks.forEach((callback) => callback(state));
    }
  }
}
