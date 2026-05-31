import bcrypt from 'bcryptjs';
import { AppError } from '../../../../shared/errors/app-error';
import type { User } from '../../domain/entities/user.entity';
import type { IUserRepository } from '../../domain/repositories/user-repository.interface';

interface ChangeUserPasswordDto {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

export class ChangeUserPasswordUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute({ userId, currentPassword, newPassword }: ChangeUserPasswordDto): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new AppError('Current password is incorrect', 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.updatePassword(hashedPassword);
    user.incrementTokenVersion();
    await this.userRepository.update(user);

    return user;
  }
}
