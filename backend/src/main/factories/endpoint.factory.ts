import { EndpointController } from '../../adapters/http/controllers/endpoint.controller';
import { CreateEndpointUseCase } from '../../modules/endpoints/application/use-cases/create-endpoint.use-case';
import { PrismaEndpointRepository } from '../../modules/endpoints/infrastructure/database/prisma-endpoint.repository';
export function makeEndpointController() {
  const repository = new PrismaEndpointRepository();
  const createUseCase = new CreateEndpointUseCase(repository);
  return new EndpointController(createUseCase, repository);
}
