import type { FastifyInstance } from 'fastify';
import { makeReplayController } from '../../../main/factories/replay.factory';
import { authMiddleware } from '../middlewares/auth.middleware';

export async function replayRoutes(app: FastifyInstance) {
  const controller = makeReplayController();
  
  app.post('/', { preHandler: [authMiddleware] }, (req, rep) => controller.replay(req, rep));
  app.get('/:eventId', { preHandler: [authMiddleware] }, (req, rep) => controller.listByEvent(req, rep));
}
