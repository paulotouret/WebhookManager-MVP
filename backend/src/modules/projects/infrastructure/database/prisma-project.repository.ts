import { prisma } from '../../../../infrastructure/database/prisma';
import { Project } from '../../domain/entities/project.entity';
import type { IProjectRepository } from '../../domain/repositories/project-repository.interface';

export class PrismaProjectRepository implements IProjectRepository {
  async create(project: Project): Promise<void> {
    await prisma.project.create({
      data: {
        id: project.id,
        name: project.name,
        description: project.description,
        userId: project.userId,
        active: project.active,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt || new Date(),
      },
    });
  }

  async update(project: Project): Promise<void> {
    await prisma.project.update({
      where: { id: project.id },
      data: {
        name: project.name,
        description: project.description,
        active: project.active,
        updatedAt: project.updatedAt || new Date(),
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.project.delete({
      where: { id },
    });
  }

  async findById(id: string): Promise<Project | null> {
    const data = await prisma.project.findUnique({
      where: { id },
    });
    if (!data) return null;
    return Project.create(
      {
        name: data.name,
        description: data.description,
        userId: data.userId,
        active: data.active,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      },
      data.id,
    );
  }

  async findByUserId(userId: string): Promise<Project[]> {
    const data = await prisma.project.findMany({
      where: { userId },
    });
    return data.map((item) =>
      Project.create(
        {
          name: item.name,
          description: item.description,
          userId: item.userId,
          active: item.active,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        },
        item.id,
      ),
    );
  }

  async findByNameAndUserId(name: string, userId: string): Promise<Project | null> {
    const data = await prisma.project.findFirst({
      where: { name, userId },
    });
    if (!data) return null;
    return Project.create(
      {
        name: data.name,
        description: data.description,
        userId: data.userId,
        active: data.active,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      },
      data.id,
    );
  }
}
