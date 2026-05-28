import type { EcosystemEvent } from '../../types';
import type { FastifyReply } from 'fastify';

interface SSEClient {
  reply: FastifyReply;
  organizationId: string;
  connectedAt: number;
}

export class RealtimeService {
  private clients: Map<string, SSEClient> = new Map();
  private static instance: RealtimeService;

  private constructor() {}

  static getInstance(): RealtimeService {
    if (!RealtimeService.instance) {
      RealtimeService.instance = new RealtimeService();
    }
    return RealtimeService.instance;
  }

  addClient(clientId: string, reply: FastifyReply, organizationId: string): void {
    this.clients.set(clientId, { reply, organizationId, connectedAt: Date.now() });
  }

  removeClient(clientId: string): void {
    this.clients.delete(clientId);
  }

  broadcastToOrg(organizationId: string, event: EcosystemEvent): void {
    const data = JSON.stringify(event);
    for (const [clientId, client] of this.clients) {
      if (client.organizationId === organizationId) {
        try {
          client.reply.raw.write(`data: ${data}\n\n`);
        } catch {
          this.removeClient(clientId);
        }
      }
    }
  }

  broadcastToAll(event: EcosystemEvent): void {
    const data = JSON.stringify(event);
    for (const [clientId, client] of this.clients) {
      try {
        client.reply.raw.write(`data: ${data}\n\n`);
      } catch {
        this.removeClient(clientId);
      }
    }
  }

  getConnectedClients(): number {
    return this.clients.size;
  }

  getClientsByOrg(organizationId: string): number {
    let count = 0;
    for (const client of this.clients.values()) {
      if (client.organizationId === organizationId) count++;
    }
    return count;
  }

  cleanupStaleClients(maxAgeMs: number = 3600000): number {
    const now = Date.now();
    let removed = 0;
    for (const [clientId, client] of this.clients) {
      if (now - client.connectedAt > maxAgeMs) {
        this.removeClient(clientId);
        removed++;
      }
    }
    return removed;
  }
}
