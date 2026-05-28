import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { RealtimeService } from './service';

export async function realtimeRoutes(fastify: FastifyInstance) {
  const realtimeService = RealtimeService.getInstance();

  // GET /realtime/events - SSE stream for ecosystem events
  fastify.get('/realtime/events', async (request: FastifyRequest<{ Headers: { 'x-organization-id': string } }>, reply: FastifyReply) => {
    const organizationId = request.headers['x-organization-id'];

    if (!organizationId) {
      return reply.status(400).send({ error: 'Missing x-organization-id header' });
    }

    const clientId = `sse_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    realtimeService.addClient(clientId, reply, organizationId);

    // Send initial connected event
    reply.raw.write(`data: ${JSON.stringify({ type: 'connected', client_id: clientId, timestamp: new Date().toISOString() })}\n\n`);

    // Keep connection alive with periodic pings
    const pingInterval = setInterval(() => {
      try {
        reply.raw.write(`:ping\n\n`);
      } catch {
        clearInterval(pingInterval);
        realtimeService.removeClient(clientId);
      }
    }, 30000);

    request.raw.on('close', () => {
      clearInterval(pingInterval);
      realtimeService.removeClient(clientId);
    });

    request.raw.on('error', () => {
      clearInterval(pingInterval);
      realtimeService.removeClient(clientId);
    });
  });

  // GET /realtime/status - Get realtime connection stats
  fastify.get('/realtime/status', async (_request: FastifyRequest, reply: FastifyReply) => {
    return reply.send({
      connected_clients: realtimeService.getConnectedClients(),
    });
  });
}
