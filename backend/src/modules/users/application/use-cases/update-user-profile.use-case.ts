import { AppError } from '../../../../shared/errors/app-error';
import type { User } from '../../domain/entities/user.entity';
import type { IUserRepository } from '../../domain/repositories/user-repository.interface';

interface UpdateUserProfileDto {
  userId: string;
  name?: string;
  email?: string;
}

export class UpdateUserProfileUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute({ userId, name, email }: UpdateUserProfileDto): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (email && email !== user.email) {
      const emailAlreadyInUse = await this.userRepository.findByEmail(email);
      if (emailAlreadyInUse && emailAlreadyInUse.id !== userId) {
        throw new AppError('Email already in use', 409);
      }
      user.updateEmail(email);
    }

    if (name !== undefined && name !== user.name) {
      user.updateName(name);
    }

    await this.userRepository.update(user);
    return user;
  }
}
