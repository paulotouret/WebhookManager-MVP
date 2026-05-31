import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import type { CreateEndpointUseCase } from '../../../modules/endpoints/application/use-cases/create-endpoint.use-case';
import type { IEndpointRepository } from '../../../modules/endpoints/domain/repositories/endpoint-repository.interface';
import { prisma } from '../../../infrastructure/database/prisma';

const createEndpointSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  projectId: z.string().uuid(),
  targetUrl: z.string().url().optional().or(z.literal('')),
  isActive: z.boolean().optional(),
});
export class EndpointController {
  constructor(
    private createEndpointUseCase: CreateEndpointUseCase,
    private endpointRepository: IEndpointRepository,
  ) {}

  private formatEndpoint(endpoint: any) {
    const webhookUrl = `/wh/${endpoint.urlPath}`;
    return {
      ...endpoint,
      webhookUrl,
      isActive: endpoint.active,
      eventCount: endpoint._count?.events ?? 0,
    };
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const data = createEndpointSchema.parse(request.body);
    const endpoint = await this.createEndpointUseCase.execute({
      name: data.name,
      description: data.description,
      projectId: data.projectId,
      targetUrl: data.targetUrl || undefined,
      active: data.isActive,
    });
    const formatted = await prisma.endpoint.findUnique({
      where: { id: endpoint.id },
      include: { _count: { select: { events: true } } },
    });
    return reply.status(201).send(formatted ? this.formatEndpoint(formatted) : endpoint);
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    const querySchema = z.object({
      projectId: z.string().uuid().optional(),
    }).catchall(z.any()).optional();
    const query = querySchema.parse(request.query || {});
    const { projectId } = query || {};
    const userId = (request.user as any)?.sub;

    console.log('[EndpointController.list] userId:', userId, 'projectId:', projectId);

    if (projectId) {
      const endpoints = await prisma.endpoint.findMany({
        where: { projectId },
        include: { _count: { select: { events: true } } },
      });
      console.log('[EndpointController.list] Found endpoints by projectId:', endpoints.length);
      return reply.send(endpoints.map((e) => this.formatEndpoint(e)));
    }
    const endpoints = await prisma.endpoint.findMany({
      where: { project: { userId } },
      include: { _count: { select: { events: true } }, project: true },
    });
    console.log('[EndpointController.list] Found endpoints by userId:', endpoints.length);
    return reply.send(endpoints.map((e) => this.formatEndpoint(e)));
  }

  async get(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const endpoint = await prisma.endpoint.findUnique({
      where: { id },
      include: { _count: { select: { events: true } } },
    });
    if (!endpoint) {
      return reply.status(404).send({ message: 'Endpoint not found' });
    }
    return reply.send(this.formatEndpoint(endpoint));
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const data = createEndpointSchema.partial().parse(request.body);
    const endpoint = await prisma.endpoint.findUnique({
      where: { id },
    });
    if (!endpoint) {
      return reply.status(404).send({ message: 'Endpoint not found' });
    }
    const updated = await prisma.endpoint.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        targetUrl: data.targetUrl || null,
        active: data.isActive !== undefined ? data.isActive : endpoint.active,
      },
      include: { _count: { select: { events: true } } },
    });
    return reply.send(this.formatEndpoint(updated));
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const userId = (request.user as any)?.sub;
    
    try {
      const endpoint = await prisma.endpoint.findUnique({
        where: { id },
        include: { project: true },
      });
      
      if (!endpoint) {
        return reply.status(404).send({ message: 'Endpoint not found' });
      }
      
      if (endpoint.project.userId !== userId) {
        return reply.status(403).send({ message: 'Not authorized to delete this endpoint' });
      }
      
      await this.endpointRepository.delete(id);
      return reply.status(204).send();
    } catch (error: any) {
      request.log.error({ error: error.message }, 'Error deleting endpoint');
      return reply.status(400).send({ message: 'Invalid endpoint ID', error: error.message });
    }
  }
}
