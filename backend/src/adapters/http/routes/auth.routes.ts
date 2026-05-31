import type { FastifyInstance } from 'fastify';
import { makeAuthController } from '../../../main/factories/auth.factory';
export async function authRoutes(app: FastifyInstance) {
  const controller = makeAuthController();
  app.post('/login', (req, rep) => controller.login(req, rep));
}
