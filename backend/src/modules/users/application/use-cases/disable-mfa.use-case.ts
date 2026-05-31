import bcrypt from 'bcryptjs';
import { AppError } from '../../../../shared/errors/app-error';
import type { IUserRepository } from '../../domain/repositories/user-repository.interface';

export class DisableMFAUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string, password: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (!user.mfaEnabled) {
      throw new AppError('MFA is not enabled', 400);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Incorrect password', 400);
    }

    user.disableMFA();
    await this.userRepository.update(user);
  }
}
