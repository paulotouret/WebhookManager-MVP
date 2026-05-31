import { AuthController } from '../../adapters/http/controllers/auth.controller';
import { AuthenticateUserUseCase } from '../../modules/auth/application/use-cases/authenticate-user.use-case';
import { PrismaUserRepository } from '../../modules/users/infrastructure/database/prisma-user.repository';
export function makeAuthController() {
  const userRepository = new PrismaUserRepository();
  const authenticateUserUseCase = new AuthenticateUserUseCase(userRepository);
  return new AuthController(authenticateUserUseCase);
}
