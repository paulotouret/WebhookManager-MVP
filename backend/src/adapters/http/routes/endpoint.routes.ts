import type { FastifyInstance } from 'fastify';
import { makeEndpointController } from '../../../main/factories/endpoint.factory';
import { authMiddleware } from '../middlewares/auth.middleware';

export async function endpointRoutes(app: FastifyInstance) {
  const controller = makeEndpointController();

  app.post('/', { preHandler: [authMiddleware] }, (req, rep) => controller.create(req, rep));
  app.get('/', { preHandler: [authMiddleware] }, (req, rep) => controller.list(req, rep));
  app.get('/:id', { preHandler: [authMiddleware] }, (req, rep) => controller.get(req, rep));
  app.put('/:id', { preHandler: [authMiddleware] }, (req, rep) => controller.update(req, rep));
  app.delete('/:id', { preHandler: [authMiddleware] }, (req, rep) => controller.delete(req, rep));
}
