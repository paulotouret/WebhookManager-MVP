import { AppError } from '../../../../shared/errors/app-error';
import type { User } from '../../domain/entities/user.entity';
import type { IUserRepository } from '../../domain/repositories/user-repository.interface';
export class GetUserProfileUseCase {
  constructor(private userRepository: IUserRepository) {}
  async execute(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }
}
