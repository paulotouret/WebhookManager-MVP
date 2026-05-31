import { EventController } from '../../adapters/http/controllers/event.controller';
import { PrismaEventRepository } from '../../modules/events/infrastructure/database/prisma-event.repository';
export function makeEventController() {
  const repository = new PrismaEventRepository();
  return new EventController(repository);
}
