import bcrypt from 'bcryptjs';
import { AppError } from '../../../../shared/errors/app-error';
import type { User } from '../../../users/domain/entities/user.entity';
import type { IUserRepository } from '../../../users/domain/repositories/user-repository.interface';
import type { AuthenticateUserDto } from '../dtos/authenticate-user.dto';

export class AuthenticateUserUseCase {
  constructor(private userRepository: IUserRepository) {}
  async execute({ email, password }: AuthenticateUserDto): Promise<User> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }
    user.incrementTokenVersion();
    await this.userRepository.update(user);
    return user;
  }
}
