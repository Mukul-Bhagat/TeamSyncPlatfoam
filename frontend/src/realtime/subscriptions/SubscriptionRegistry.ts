import type { ISubscription } from '../transport';

export interface SubscriptionEntry {
  subscription: ISubscription;
  owner: string; // Component or context identifier
  createdAt: number;
}

export class SubscriptionRegistry {
  private subscriptions: Map<string, SubscriptionEntry> = new Map();
  private channelSubscriptions: Map<string, Set<string>> = new Map();
  private subscriptionIdCounter = 0;

  register(subscription: ISubscription, owner: string): string {
    const entryId = `entry_${this.subscriptionIdCounter++}`;
    
    const entry: SubscriptionEntry = {
      subscription,
      owner,
      createdAt: Date.now(),
    };

    this.subscriptions.set(entryId, entry);

    // Track channel subscriptions
    if (!this.channelSubscriptions.has(subscription.channel)) {
      this.channelSubscriptions.set(subscription.channel, new Set());
    }
    this.channelSubscriptions.get(subscription.channel)!.add(entryId);

    return entryId;
  }

  unregister(entryId: string): void {
    const entry = this.subscriptions.get(entryId);
    if (!entry) return;

    // Unsubscribe from transport
    entry.subscription.unsubscribe();

    // Remove from channel tracking
    const channelSet = this.channelSubscriptions.get(entry.subscription.channel);
    if (channelSet) {
      channelSet.delete(entryId);
      if (channelSet.size === 0) {
        this.channelSubscriptions.delete(entry.subscription.channel);
      }
    }

    // Remove entry
    this.subscriptions.delete(entryId);
  }

  unregisterByOwner(owner: string): void {
    const entriesToRemove: string[] = [];

    for (const [entryId, entry] of this.subscriptions) {
      if (entry.owner === owner) {
        entriesToRemove.push(entryId);
      }
    }

    entriesToRemove.forEach((entryId) => this.unregister(entryId));
  }

  getSubscription(entryId: string): ISubscription | undefined {
    return this.subscriptions.get(entryId)?.subscription;
  }

  getChannelSubscriptions(channel: string): ISubscription[] {
    const entryIds = this.channelSubscriptions.get(channel);
    if (!entryIds) return [];

    return Array.from(entryIds)
      .map((id) => this.subscriptions.get(id)?.subscription)
      .filter((sub): sub is ISubscription => sub !== undefined);
  }

  hasActiveSubscription(channel: string): boolean {
    const entryIds = this.channelSubscriptions.get(channel);
    return entryIds ? entryIds.size > 0 : false;
  }

  getOwnerSubscriptions(owner: string): ISubscription[] {
    const entries: ISubscription[] = [];

    for (const entry of this.subscriptions.values()) {
      if (entry.owner === owner) {
        entries.push(entry.subscription);
      }
    }

    return entries;
  }

  cleanup(): void {
    // Unsubscribe all subscriptions
    for (const entry of this.subscriptions.values()) {
      entry.subscription.unsubscribe();
    }

    // Clear all maps
    this.subscriptions.clear();
    this.channelSubscriptions.clear();
  }

  getStats(): {
    totalSubscriptions: number;
    totalChannels: number;
    subscriptionsByOwner: Record<string, number>;
  } {
    const subscriptionsByOwner: Record<string, number> = {};

    for (const entry of this.subscriptions.values()) {
      subscriptionsByOwner[entry.owner] = (subscriptionsByOwner[entry.owner] || 0) + 1;
    }

    return {
      totalSubscriptions: this.subscriptions.size,
      totalChannels: this.channelSubscriptions.size,
      subscriptionsByOwner,
    };
  }
}
