import type { User } from '../entities/user.entity';

export interface IUserRepository {
  create(user: User): Promise<void>;
  update(user: User): Promise<void>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
}
