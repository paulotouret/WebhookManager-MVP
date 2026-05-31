import bcrypt from 'bcryptjs';
import { AppError } from '../../../../shared/errors/app-error';
import type { User } from '../../domain/entities/user.entity';
import type { IUserRepository } from '../../domain/repositories/user-repository.interface';
export interface UpdateUserDto {
  userId: string;
  name?: string;
  password?: string;
}
export class UpdateUserUseCase {
  constructor(private userRepository: IUserRepository) {}
  async execute({ userId, name, password }: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    if (name) {
      user.updateName(name);
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.updatePassword(hashedPassword);
    }
    await this.userRepository.update(user);
    return user;
  }
}
