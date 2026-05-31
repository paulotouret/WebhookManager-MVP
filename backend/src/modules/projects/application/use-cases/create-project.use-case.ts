import { AppError } from '../../../../shared/errors/app-error';
import { Project } from '../../domain/entities/project.entity';
import type { IProjectRepository } from '../../domain/repositories/project-repository.interface';

interface CreateProjectDto {
  name: string;
  description?: string;
  userId: string;
  active?: boolean;
}

export class CreateProjectUseCase {
  constructor(private projectRepository: IProjectRepository) {}
  async execute({ name, description, userId, active }: CreateProjectDto): Promise<Project> {
    const projectAlreadyExists = await this.projectRepository.findByNameAndUserId(name, userId);
    if (projectAlreadyExists) {
      throw new AppError('Project with this name already exists for this user');
    }
    const project = Project.create({
      name,
      description,
      userId,
      active,
    });
    await this.projectRepository.create(project);
    return project;
  }
}
