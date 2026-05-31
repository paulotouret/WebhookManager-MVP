import { type Job, Worker } from 'bullmq';
import { redisConnection } from '../../../../infrastructure/cache/redis';
import { makeReplayController } from '../../../../main/factories/replay.factory';

const replayController = makeReplayController();

export const webhookWorker = new Worker(
  'webhook-delivery',
  async (job: Job) => {
    const { eventId, targetUrl } = job.data;
    await (replayController as any).executeReplayUseCase.execute({
      eventId,
      targetUrl,
    });
  },
  { connection: redisConnection as any },
);
