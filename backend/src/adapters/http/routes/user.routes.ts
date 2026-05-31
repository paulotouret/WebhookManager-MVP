import type { FastifyInstance } from 'fastify';
import { makeUserController } from '../../../main/factories/user.factory';
import { authMiddleware } from '../middlewares/auth.middleware';
export async function userRoutes(app: FastifyInstance) {
  const controller = makeUserController();
  app.post('/register', (req, rep) => controller.register(req, rep));
  app.register(async (authenticatedRoutes) => {
    authenticatedRoutes.addHook('preHandler', authMiddleware);
    authenticatedRoutes.get('/me', (req, rep) => controller.me(req, rep));
    authenticatedRoutes.put('/me', (req, rep) => controller.updateProfile(req, rep));
    authenticatedRoutes.put('/me/profile', (req, rep) => controller.updateProfile(req, rep));
    authenticatedRoutes.put('/me/password', (req, rep) => controller.changePassword(req, rep));
    authenticatedRoutes.post('/me/mfa/setup', (req, rep) => controller.generateMfaSetup(req, rep));
    authenticatedRoutes.post('/me/mfa/enable', (req, rep) => controller.confirmMfaSetup(req, rep));
    authenticatedRoutes.post('/me/mfa/disable', (req, rep) => controller.disableMfa(req, rep));
  });
}
