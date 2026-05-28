import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { EventService } from './service';
import { AppError } from '../../shared/errors';
import type { CreateEventRequest, QueryEventsRequest } from './types';

export async function eventRoutes(fastify: FastifyInstance) {
  const eventService = new EventService();

  // POST /events - Create a new event
  fastify.post('/events', async (request: FastifyRequest<{ Body: CreateEventRequest }>, reply: FastifyReply) => {
    try {
      const event = await eventService.createEvent(request.body);
      return reply.status(201).send(event);
    } catch (error) {
      if (error instanceof AppError) {
        return reply.status(error.statusCode).send({ error: error.message, code: error.code });
      }
      return reply.status(500).send({ error: error instanceof Error ? error.message : 'Failed to create event' });
    }
  });

  // GET /events - Query events
  fastify.get('/events', async (request: FastifyRequest<{ Querystring: QueryEventsRequest }>, reply: FastifyReply) => {
    try {
      const events = await eventService.queryEvents(request.query);
      return reply.send(events);
    } catch (error) {
      if (error instanceof AppError) {
        return reply.status(error.statusCode).send({ error: error.message, code: error.code });
      }
      return reply.status(500).send({ error: error instanceof Error ? error.message : 'Failed to query events' });
    }
  });

  // GET /events/:id - Get single event
  fastify.get('/events/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const event = await eventService.getEventById(request.params.id);
      if (!event) {
        return reply.status(404).send({ error: 'Event not found' });
      }
      return reply.send(event);
    } catch (error) {
      if (error instanceof AppError) {
        return reply.status(error.statusCode).send({ error: error.message, code: error.code });
      }
      return reply.status(500).send({ error: error instanceof Error ? error.message : 'Failed to get event' });
    }
  });

  // GET /events/stats - Get event stats for organization
  fastify.get('/events/stats', async (request: FastifyRequest<{ Querystring: { organization_id: string } }>, reply: FastifyReply) => {
    try {
      if (!request.query.organization_id) {
        return reply.status(400).send({ error: 'organization_id is required' });
      }
      const stats = await eventService.getEventStats(request.query.organization_id);
      return reply.send(stats);
    } catch (error) {
      if (error instanceof AppError) {
        return reply.status(error.statusCode).send({ error: error.message, code: error.code });
      }
      return reply.status(500).send({ error: error instanceof Error ? error.message : 'Failed to get event stats' });
    }
  });
}
