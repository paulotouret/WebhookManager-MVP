import type { FastifyInstance } from 'fastify';
import { makeWebhookController } from '../../../main/factories/webhook.factory';
export async function webhookRoutes(app: FastifyInstance) {
  const controller = makeWebhookController();
  app.all('/:urlPath', (req, rep) => controller.handle(req, rep));
}
