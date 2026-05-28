"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventRoutes = eventRoutes;
const service_1 = require("./service");
const errors_1 = require("../../shared/errors");
async function eventRoutes(fastify) {
    const eventService = new service_1.EventService();
    // POST /events - Create a new event
    fastify.post('/events', async (request, reply) => {
        try {
            const event = await eventService.createEvent(request.body);
            return reply.status(201).send(event);
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                return reply.status(error.statusCode).send({ error: error.message, code: error.code });
            }
            return reply.status(500).send({ error: error instanceof Error ? error.message : 'Failed to create event' });
        }
    });
    // GET /events - Query events
    fastify.get('/events', async (request, reply) => {
        try {
            const events = await eventService.queryEvents(request.query);
            return reply.send(events);
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                return reply.status(error.statusCode).send({ error: error.message, code: error.code });
            }
            return reply.status(500).send({ error: error instanceof Error ? error.message : 'Failed to query events' });
        }
    });
    // GET /events/:id - Get single event
    fastify.get('/events/:id', async (request, reply) => {
        try {
            const event = await eventService.getEventById(request.params.id);
            if (!event) {
                return reply.status(404).send({ error: 'Event not found' });
            }
            return reply.send(event);
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                return reply.status(error.statusCode).send({ error: error.message, code: error.code });
            }
            return reply.status(500).send({ error: error instanceof Error ? error.message : 'Failed to get event' });
        }
    });
    // GET /events/stats - Get event stats for organization
    fastify.get('/events/stats', async (request, reply) => {
        try {
            if (!request.query.organization_id) {
                return reply.status(400).send({ error: 'organization_id is required' });
            }
            const stats = await eventService.getEventStats(request.query.organization_id);
            return reply.send(stats);
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                return reply.status(error.statusCode).send({ error: error.message, code: error.code });
            }
            return reply.status(500).send({ error: error instanceof Error ? error.message : 'Failed to get event stats' });
        }
    });
}
//# sourceMappingURL=routes.js.map