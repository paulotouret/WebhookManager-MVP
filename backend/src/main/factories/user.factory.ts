import { UserController } from '../../adapters/http/controllers/user.controller';
import { ChangeUserPasswordUseCase } from '../../modules/users/application/use-cases/change-user-password.use-case';
import { ConfirmMFASetupUseCase } from '../../modules/users/application/use-cases/confirm-mfa-setup.use-case';
import { DisableMFAUseCase } from '../../modules/users/application/use-cases/disable-mfa.use-case';
import { GenerateMFASetupUseCase } from '../../modules/users/application/use-cases/generate-mfa-setup.use-case';
import { GetUserProfileUseCase } from '../../modules/users/application/use-cases/get-user-profile.use-case';
import { RegisterUserUseCase } from '../../modules/users/application/use-cases/register-user.use-case';
import { UpdateUserProfileUseCase } from '../../modules/users/application/use-cases/update-user-profile.use-case';
import { PrismaUserRepository } from '../../modules/users/infrastructure/database/prisma-user.repository';
export function makeUserController() {
  const userRepository = new PrismaUserRepository();
  const registerUserUseCase = new RegisterUserUseCase(userRepository);
  const getUserProfileUseCase = new GetUserProfileUseCase(userRepository);
  const updateUserProfileUseCase = new UpdateUserProfileUseCase(userRepository);
  const changeUserPasswordUseCase = new ChangeUserPasswordUseCase(userRepository);
  const generateMFASetupUseCase = new GenerateMFASetupUseCase(userRepository);
  const confirmMFASetupUseCase = new ConfirmMFASetupUseCase(userRepository);
  const disableMFAUseCase = new DisableMFAUseCase(userRepository);
  return new UserController(
    registerUserUseCase,
    getUserProfileUseCase,
    updateUserProfileUseCase,
    changeUserPasswordUseCase,
    generateMFASetupUseCase,
    confirmMFASetupUseCase,
    disableMFAUseCase,
  );
}
