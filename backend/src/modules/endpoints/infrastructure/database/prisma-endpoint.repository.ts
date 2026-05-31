import { prisma } from '../../../../infrastructure/database/prisma';
import { Endpoint } from '../../domain/entities/endpoint.entity';
import type { IEndpointRepository } from '../../domain/repositories/endpoint-repository.interface';

export class PrismaEndpointRepository implements IEndpointRepository {
  async create(endpoint: Endpoint): Promise<void> {
    await prisma.endpoint.create({
      data: {
        id: endpoint.id,
        name: endpoint.name,
        description: endpoint.description,
        projectId: endpoint.projectId,
        urlPath: endpoint.urlPath,
        secret: endpoint.secret,
        targetUrl: endpoint.targetUrl,
        active: endpoint.active,
        createdAt: endpoint.createdAt,
        updatedAt: endpoint.updatedAt || new Date(),
      },
    });
  }
  async update(endpoint: Endpoint): Promise<void> {
    await prisma.endpoint.update({
      where: { id: endpoint.id },
      data: {
        name: endpoint.name,
        description: endpoint.description,
        targetUrl: endpoint.targetUrl,
        active: endpoint.active,
        updatedAt: endpoint.updatedAt || new Date(),
      },
    });
  }
  async delete(id: string): Promise<void> {
    await prisma.endpoint.delete({
      where: { id },
    });
  }
  async findById(id: string): Promise<Endpoint | null> {
    const data = await prisma.endpoint.findUnique({
      where: { id },
    });
    if (!data) return null;
    return Endpoint.create(
      {
        name: data.name,
        description: data.description,
        projectId: data.projectId,
        urlPath: data.urlPath,
        secret: data.secret,
        targetUrl: data.targetUrl,
        active: data.active,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      },
      data.id,
    );
  }
  async findByProjectId(projectId: string): Promise<Endpoint[]> {
    const data = await prisma.endpoint.findMany({
      where: { projectId },
    });
    return data.map((item) =>
      Endpoint.create(
        {
          name: item.name,
          description: item.description,
          projectId: item.projectId,
          urlPath: item.urlPath,
          secret: item.secret,
          targetUrl: item.targetUrl,
          active: item.active,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        },
        item.id,
      ),
    );
  }
  async findByUserId(userId: string): Promise<Endpoint[]> {
    console.log('[PrismaEndpointRepository.findByUserId] Searching for endpoints with userId:', userId);
    const data = await prisma.endpoint.findMany({
      where: { project: { userId } },
      include: { project: true },
    });
    console.log('[PrismaEndpointRepository.findByUserId] Found:', data.length, 'endpoints');
    return data.map((item) =>
      Endpoint.create(
        {
          name: item.name,
          description: item.description,
          projectId: item.projectId,
          urlPath: item.urlPath,
          secret: item.secret,
          targetUrl: item.targetUrl,
          active: item.active,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        },
        item.id,
      ),
    );
  }
  async findByUrlPath(urlPath: string): Promise<Endpoint | null> {
    const data = await prisma.endpoint.findUnique({
      where: { urlPath },
    });
    if (!data) return null;
    return Endpoint.create(
      {
        name: data.name,
        description: data.description,
        projectId: data.projectId,
        urlPath: data.urlPath,
        secret: data.secret,
        targetUrl: data.targetUrl,
        active: data.active,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      },
      data.id,
    );
  }
  async findByNameAndProjectId(name: string, projectId: string): Promise<Endpoint | null> {
    const data = await prisma.endpoint.findFirst({
      where: { name, projectId },
    });
    if (!data) return null;
    return Endpoint.create(
      {
        name: data.name,
        description: data.description,
        projectId: data.projectId,
        urlPath: data.urlPath,
        secret: data.secret,
        targetUrl: data.targetUrl,
        active: data.active,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      },
      data.id,
    );
  }
}
