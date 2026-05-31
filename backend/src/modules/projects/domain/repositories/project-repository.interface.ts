import type { Project } from '../entities/project.entity';
export interface IProjectRepository {
  create(project: Project): Promise<void>;
  update(project: Project): Promise<void>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Project | null>;
  findByUserId(userId: string): Promise<Project[]>;
  findByNameAndUserId(name: string, userId: string): Promise<Project | null>;
}
