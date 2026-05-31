import type { Endpoint } from '../entities/endpoint.entity';

export interface IEndpointRepository {
  create(endpoint: Endpoint): Promise<void>;
  update(endpoint: Endpoint): Promise<void>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Endpoint | null>;
  findByProjectId(projectId: string): Promise<Endpoint[]>;
  findByUserId(userId: string): Promise<Endpoint[]>;
  findByUrlPath(urlPath: string): Promise<Endpoint | null>;
  findByNameAndProjectId(name: string, projectId: string): Promise<Endpoint | null>;
}
