import { ProjectController } from '../../adapters/http/controllers/project.controller';
import { CreateProjectUseCase } from '../../modules/projects/application/use-cases/create-project.use-case';
import { PrismaProjectRepository } from '../../modules/projects/infrastructure/database/prisma-project.repository';
export function makeProjectController() {
  const repository = new PrismaProjectRepository();
  const createUseCase = new CreateProjectUseCase(repository);
  return new ProjectController(createUseCase, repository);
}
