import type { Prisma } from '@prisma/client';
import { prisma } from '../../../../infrastructure/database/prisma';
import { Event } from '../../domain/entities/event.entity';
import type { IEventRepository } from '../../domain/repositories/event-repository.interface';

export class PrismaEventRepository implements IEventRepository {
  async create(event: Event): Promise<void> {
    await prisma.event.create({
      data: {
        id: event.id,
        method: event.method,
        headers: event.headers,
        body: event.body,
        query: event.query,
        status: event.status,
        remoteIp: event.remoteIp,
        endpointId: event.endpointId,
        createdAt: event.createdAt,
      },
    });
  }

  async update(event: Event): Promise<void> {
    await prisma.event.update({
      where: { id: event.id },
      data: {
        status: event.status,
      },
    });
  }

  async findById(id: string): Promise<Event | null> {
    const data = await prisma.event.findUnique({
      where: { id },
    });

    if (!data) return null;

    return Event.create(
      {
        method: data.method,
        headers: data.headers,
        body: data.body,
        query: data.query,
        status: data.status,
        remoteIp: data.remoteIp,
        endpointId: data.endpointId,
        createdAt: data.createdAt,
      },
      data.id,
    );
  }

  async findMany(filters: {
    endpointId?: string;
    userId?: string;
    method?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Event[]> {
    const where: Prisma.EventWhereInput = {};

    if (filters.endpointId) {
      where.endpointId = filters.endpointId;
    }

    if (filters.userId) {
      where.endpoint = {
        project: {
          userId: filters.userId,
        },
      };
    }

    if (filters.method) {
      where.method = filters.method;
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    const data = await prisma.event.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return data.map((item) =>
      Event.create(
        {
          method: item.method,
          headers: item.headers,
          body: item.body,
          query: item.query,
          status: item.status,
          remoteIp: item.remoteIp,
          endpointId: item.endpointId,
          createdAt: item.createdAt,
        },
        item.id,
      ),
    );
  }

  async findLastByEndpointId(endpointId: string): Promise<Event | null> {
    const data = await prisma.event.findFirst({
      where: { endpointId },
      orderBy: { createdAt: 'desc' },
    });

    if (!data) return null;

    return Event.create(
      {
        method: data.method,
        headers: data.headers,
        body: data.body,
        query: data.query,
        status: data.status,
        remoteIp: data.remoteIp,
        endpointId: data.endpointId,
        createdAt: data.createdAt,
      },
      data.id,
    );
  }
}
