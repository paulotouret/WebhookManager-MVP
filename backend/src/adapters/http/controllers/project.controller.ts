import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import type { CreateProjectUseCase } from '../../../modules/projects/application/use-cases/create-project.use-case';
import type { IProjectRepository } from '../../../modules/projects/domain/repositories/project-repository.interface';
import { prisma } from '../../../infrastructure/database/prisma';

const createProjectSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});
export class ProjectController {
  constructor(
    private createProjectUseCase: CreateProjectUseCase,
    private projectRepository: IProjectRepository,
  ) {}

  private formatProject(project: any) {
    return {
      ...project,
      isActive: project.active,
      endpointCount: project._count?.endpoints ?? 0,
    };
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any)?.sub;
    const { name, description, isActive } = createProjectSchema.parse(request.body);
    const project = await this.createProjectUseCase.execute({
      name,
      description,
      userId,
      active: isActive,
    });
    return reply.status(201).send(this.formatProject(project));
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any)?.sub;
    const projects = await prisma.project.findMany({
      where: { userId },
      include: { _count: { select: { endpoints: true } } },
    });
    return reply.send(projects.map((p) => this.formatProject(p)));
  }

  async get(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any)?.sub;
    const { id } = request.params as { id: string };
    const project = await prisma.project.findUnique({
      where: { id },
      include: { _count: { select: { endpoints: true } } },
    });
    if (!project || project.userId !== userId) {
      return reply.status(404).send({ message: 'Project not found' });
    }
    return reply.send(this.formatProject(project));
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any)?.sub;
    const { id } = request.params as { id: string };
    const data = createProjectSchema.partial().parse(request.body);
    const project = await prisma.project.findUnique({
      where: { id },
    });
    if (!project || project.userId !== userId) {
      return reply.status(404).send({ message: 'Project not found' });
    }
    const updated = await prisma.project.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        active: data.isActive !== undefined ? data.isActive : project.active,
      },
      include: { _count: { select: { endpoints: true } } },
    });
    return reply.send(this.formatProject(updated));
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any)?.sub;
    const { id } = request.params as { id: string };
    const project = await prisma.project.findUnique({
      where: { id },
    });
    if (!project || project.userId !== userId) {
      return reply.status(404).send({ message: 'Project not found' });
    }
    await this.projectRepository.delete(id);
    return reply.status(204).send();
  }
}
