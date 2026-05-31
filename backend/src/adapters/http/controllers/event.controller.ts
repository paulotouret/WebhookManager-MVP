import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import type { IEventRepository } from '../../../modules/events/domain/repositories/event-repository.interface';
import { prisma } from '../../../infrastructure/database/prisma';

const listEventsSchema = z.object({
  endpointId: z.string().uuid().optional(),
  method: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
}).catchall(z.any()).optional();

export class EventController {
  constructor(private eventRepository: IEventRepository) {}

  private formatEvent(event: any) {
    return {
      id: event.id,
      endpointId: event.endpointId,
      method: event.method,
      headers: event.headers,
      body: event.body,
      query: event.query,
      status: event.status,
      remoteIp: event.remoteIp,
      receivedAt: event.createdAt,
      deliveryStatus: event.status ? (event.status >= 200 && event.status < 300 ? 'delivered' : 'failed') : 'pending' as const,
      statusCode: event.status,
    };
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    const query = listEventsSchema.parse(request.query || {});
    const userId = (request.user as any)?.sub;
    const { endpointId, method, startDate, endDate, page = 1, limit = 20 } = query || {};

    const skip = (page - 1) * limit;

    const where: any = {
      endpoint: {
        project: {
          userId,
        },
      },
    };

    if (endpointId) {
      where.endpointId = endpointId;
    }

    if (method) {
      where.method = method;
    }

    if (startDate) {
      where.createdAt = { ...where.createdAt, gte: new Date(startDate) };
    }

    if (endDate) {
      where.createdAt = { ...where.createdAt, lte: new Date(endDate) };
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.event.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return reply.send({
      events: events.map((e: any) => this.formatEvent(e)),
      total,
      page,
      totalPages,
    });
  }

  async get(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const event = await prisma.event.findUnique({
      where: { id },
    });
    if (!event) {
      return reply.status(404).send({ message: 'Event not found' });
    }
    return reply.send(this.formatEvent(event));
  }
}
