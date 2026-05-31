import { ReplayController } from '../../adapters/http/controllers/replay.controller';
import { PrismaEndpointRepository } from '../../modules/endpoints/infrastructure/database/prisma-endpoint.repository';
import { PrismaEventRepository } from '../../modules/events/infrastructure/database/prisma-event.repository';
import { ExecuteReplayUseCase } from '../../modules/replay/application/use-cases/execute-replay.use-case';
import { PrismaReplayRepository } from '../../modules/replay/infrastructure/database/prisma-replay.repository';
export function makeReplayController() {
  const replayRepository = new PrismaReplayRepository();
  const eventRepository = new PrismaEventRepository();
  const endpointRepository = new PrismaEndpointRepository();
  const executeUseCase = new ExecuteReplayUseCase(
    replayRepository,
    eventRepository,
    endpointRepository,
  );
  return new ReplayController(executeUseCase, replayRepository);
}
