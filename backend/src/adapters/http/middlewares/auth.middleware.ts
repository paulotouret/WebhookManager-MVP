import type { FastifyReply, FastifyRequest } from 'fastify';
import { PrismaUserRepository } from '../../../modules/users/infrastructure/database/prisma-user.repository';

const userRepository = new PrismaUserRepository();
export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
    const payload = request.user as any;
    const userId = payload.sub;
    const tokenVersion = payload.version;
    
    const user = await userRepository.findById(userId);
    if (!user) {
      return reply.status(401).send({ message: 'User no longer exists' });
    }
    if (user.tokenVersion !== tokenVersion) {
      return reply.status(401).send({ message: 'Token has been invalidated. Please login again.' });
    }
  } catch (err: any) {
    return reply.status(401).send(err);
  }
}
