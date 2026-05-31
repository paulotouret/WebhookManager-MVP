import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import type { ChangeUserPasswordUseCase } from '../../../modules/users/application/use-cases/change-user-password.use-case';
import type { ConfirmMFASetupUseCase } from '../../../modules/users/application/use-cases/confirm-mfa-setup.use-case';
import type { DisableMFAUseCase } from '../../../modules/users/application/use-cases/disable-mfa.use-case';
import type { GenerateMFASetupUseCase } from '../../../modules/users/application/use-cases/generate-mfa-setup.use-case';
import type { GetUserProfileUseCase } from '../../../modules/users/application/use-cases/get-user-profile.use-case';
import type { RegisterUserUseCase } from '../../../modules/users/application/use-cases/register-user.use-case';
import type { UpdateUserProfileUseCase } from '../../../modules/users/application/use-cases/update-user-profile.use-case';

const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
  name: z.string().optional(),
});

const updateProfileSchema = z
  .object({
    name: z.string().min(1).optional(),
    email: z.email().optional(),
  })
  .refine((data) => data.name !== undefined || data.email !== undefined, {
    message: 'At least one field must be provided',
  });

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

const confirmMfaSchema = z.object({
  code: z.string().regex(/^\d{6}$/),
});

const disableMfaSchema = z.object({
  password: z.string().min(1),
});

export class UserController {
  constructor(
    private registerUserUseCase: RegisterUserUseCase,
    private getUserProfileUseCase: GetUserProfileUseCase,
    private updateUserProfileUseCase: UpdateUserProfileUseCase,
    private changeUserPasswordUseCase: ChangeUserPasswordUseCase,
    private generateMFASetupUseCase: GenerateMFASetupUseCase,
    private confirmMFASetupUseCase: ConfirmMFASetupUseCase,
    private disableMFAUseCase: DisableMFAUseCase,
  ) {}

  async register(request: FastifyRequest, reply: FastifyReply) {
    const { email, name, password } = registerSchema.parse(request.body);
    const user = await this.registerUserUseCase.execute({
      email,
      name,
      password,
    });

    const token = await (request.server as any).jwt.sign({
      sub: user.id,
      version: user.tokenVersion,
    });

    return reply.status(201).send({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        mfaEnabled: user.mfaEnabled,
      },
    });
  }

  async me(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any)?.sub;
    const user = await this.getUserProfileUseCase.execute(userId);

    return reply.send({
      id: user.id,
      email: user.email,
      name: user.name,
      mfaEnabled: user.mfaEnabled,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  async updateProfile(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any)?.sub;
    const { name, email } = updateProfileSchema.parse(request.body);
    const user = await this.updateUserProfileUseCase.execute({
      userId,
      name,
      email,
    });

    return reply.send({
      id: user.id,
      email: user.email,
      name: user.name,
      mfaEnabled: user.mfaEnabled,
      updatedAt: user.updatedAt,
    });
  }

  async changePassword(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any)?.sub;
    const { currentPassword, newPassword } = changePasswordSchema.parse(request.body);

    await this.changeUserPasswordUseCase.execute({
      userId,
      currentPassword,
      newPassword,
    });

    return reply.send({ message: 'Password changed successfully' });
  }

  async generateMfaSetup(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any)?.sub;
    const mfaSetup = await this.generateMFASetupUseCase.execute(userId);
    return reply.send(mfaSetup);
  }

  async confirmMfaSetup(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any)?.sub;
    const { code } = confirmMfaSchema.parse(request.body);
    const result = await this.confirmMFASetupUseCase.execute(userId, code);
    return reply.send(result);
  }

  async disableMfa(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any)?.sub;
    const { password } = disableMfaSchema.parse(request.body);
    await this.disableMFAUseCase.execute(userId, password);
    return reply.send({ message: 'MFA disabled successfully' });
  }
}
