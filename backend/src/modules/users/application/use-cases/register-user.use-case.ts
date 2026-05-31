import bcrypt from 'bcryptjs';
import { AppError } from '../../../../shared/errors/app-error';
import { User } from '../../domain/entities/user.entity';
import type { IUserRepository } from '../../domain/repositories/user-repository.interface';
import type { RegisterUserDto } from '../dtos/register-user.dto';
export class RegisterUserUseCase {
  constructor(private userRepository: IUserRepository) {}
  async execute({ email, name, password }: RegisterUserDto): Promise<User> {
    const userAlreadyExists = await this.userRepository.findByEmail(email);
    if (userAlreadyExists) {
      throw new AppError('User already exists');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = User.create({
      email,
      name,
      password: hashedPassword,
    });
    await this.userRepository.create(user);
    return user;
  }
}
