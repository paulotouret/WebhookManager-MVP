import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import type { ExecuteReplayUseCase } from '../../../modules/replay/application/use-cases/execute-replay.use-case';
import type { IReplayRepository } from '../../../modules/replay/domain/repositories/replay-repository.interface';
import { prisma } from '../../../infrastructure/database/prisma';

const replaySchema = z.object({
  eventId: z.string().uuid(),
  targetUrl: z.string().url(),
});
export class ReplayController {
  constructor(
    private executeReplayUseCase: ExecuteReplayUseCase,
    private replayRepository: IReplayRepository,
  ) {}

  async replay(request: FastifyRequest, reply: FastifyReply) {
    const data = replaySchema.parse(request.body);
    const replay = await this.executeReplayUseCase.execute(data);
    return reply.status(201).send({
      id: replay.id,
      status: replay.status,
      response: replay.response,
    });
  }

  async listByEvent(request: FastifyRequest, reply: FastifyReply) {
    const { eventId } = request.params as { eventId: string };
    const replays = await prisma.replay.findMany({
      where: { eventId },
      orderBy: { createdAt: 'desc' },
    });
    return reply.send(replays);
  }
}
