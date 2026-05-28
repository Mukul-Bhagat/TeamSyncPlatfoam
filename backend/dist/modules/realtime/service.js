"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealtimeService = void 0;
class RealtimeService {
    clients = new Map();
    static instance;
    constructor() { }
    static getInstance() {
        if (!RealtimeService.instance) {
            RealtimeService.instance = new RealtimeService();
        }
        return RealtimeService.instance;
    }
    addClient(clientId, reply, organizationId) {
        this.clients.set(clientId, { reply, organizationId, connectedAt: Date.now() });
    }
    removeClient(clientId) {
        this.clients.delete(clientId);
    }
    broadcastToOrg(organizationId, event) {
        const data = JSON.stringify(event);
        for (const [clientId, client] of this.clients) {
            if (client.organizationId === organizationId) {
                try {
                    client.reply.raw.write(`data: ${data}\n\n`);
                }
                catch {
                    this.removeClient(clientId);
                }
            }
        }
    }
    broadcastToAll(event) {
        const data = JSON.stringify(event);
        for (const [clientId, client] of this.clients) {
            try {
                client.reply.raw.write(`data: ${data}\n\n`);
            }
            catch {
                this.removeClient(clientId);
            }
        }
    }
    getConnectedClients() {
        return this.clients.size;
    }
    getClientsByOrg(organizationId) {
        let count = 0;
        for (const client of this.clients.values()) {
            if (client.organizationId === organizationId)
                count++;
        }
        return count;
    }
    cleanupStaleClients(maxAgeMs = 3600000) {
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
exports.RealtimeService = RealtimeService;
//# sourceMappingURL=service.js.map