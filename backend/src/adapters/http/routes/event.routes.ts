import type { FastifyInstance } from 'fastify';
import { makeEventController } from '../../../main/factories/event.factory';
import { authMiddleware } from '../middlewares/auth.middleware';

export async function eventRoutes(app: FastifyInstance) {
  const controller = makeEventController();
  
  app.get('/', { preHandler: [authMiddleware] }, (req, rep) => controller.list(req, rep));
  app.get('/:id', { preHandler: [authMiddleware] }, (req, rep) => controller.get(req, rep));
}
