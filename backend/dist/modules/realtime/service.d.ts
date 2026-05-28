import type { EcosystemEvent } from '../../types';
import type { FastifyReply } from 'fastify';
export declare class RealtimeService {
    private clients;
    private static instance;
    private constructor();
    static getInstance(): RealtimeService;
    addClient(clientId: string, reply: FastifyReply, organizationId: string): void;
    removeClient(clientId: string): void;
    broadcastToOrg(organizationId: string, event: EcosystemEvent): void;
    broadcastToAll(event: EcosystemEvent): void;
    getConnectedClients(): number;
    getClientsByOrg(organizationId: string): number;
    cleanupStaleClients(maxAgeMs?: number): number;
}
//# sourceMappingURL=service.d.ts.map