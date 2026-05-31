import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import type { AuthenticateUserUseCase } from '../../../modules/auth/application/use-cases/authenticate-user.use-case';

const authenticateSchema = z.object({
  email: z.email(),
  password: z.string(),
});

export class AuthController {
  constructor(private authenticateUserUseCase: AuthenticateUserUseCase) {}

  async login(request: FastifyRequest, reply: FastifyReply) {
    const { email, password } = authenticateSchema.parse(request.body);

    const user = await this.authenticateUserUseCase.execute({
      email,
      password,
    });

    const token = await (request.server as any).jwt.sign({
      sub: user.id,
      version: user.tokenVersion,
    });

    return reply.send({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        mfaEnabled: user.mfaEnabled,
      },
    });
  }
}
