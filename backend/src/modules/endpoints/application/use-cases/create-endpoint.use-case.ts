import { AppError } from '../../../../shared/errors/app-error';
import { Endpoint } from '../../domain/entities/endpoint.entity';
import type { IEndpointRepository } from '../../domain/repositories/endpoint-repository.interface';

interface CreateEndpointDto {
  name: string;
  description?: string;
  projectId: string;
  targetUrl?: string;
  active?: boolean;
}
export class CreateEndpointUseCase {
  constructor(private endpointRepository: IEndpointRepository) {}
  async execute({ name, description, projectId, targetUrl, active }: CreateEndpointDto): Promise<Endpoint> {
    const endpointAlreadyExists = await this.endpointRepository.findByNameAndProjectId(
      name,
      projectId,
    );
    if (endpointAlreadyExists) {
      throw new AppError('Endpoint with this name already exists in this project');
    }
    const endpoint = Endpoint.create({
      name,
      description,
      projectId,
      targetUrl,
      active,
    });
    await this.endpointRepository.create(endpoint);
    return endpoint;
  }
}
