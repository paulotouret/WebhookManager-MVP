import { WebhookController } from '../../adapters/http/controllers/webhook.controller';
import { PrismaEndpointRepository } from '../../modules/endpoints/infrastructure/database/prisma-endpoint.repository';
import { PrismaEventRepository } from '../../modules/events/infrastructure/database/prisma-event.repository';
import { ReceiveWebhookUseCase } from '../../modules/webhook/application/use-cases/receive-webhook.use-case';
export function makeWebhookController() {
  const eventRepository = new PrismaEventRepository();
  const endpointRepository = new PrismaEndpointRepository();
  const receiveUseCase = new ReceiveWebhookUseCase(eventRepository, endpointRepository);
  return new WebhookController(receiveUseCase);
}
