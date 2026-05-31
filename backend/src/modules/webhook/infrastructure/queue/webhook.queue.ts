import { Queue } from 'bullmq';
import { redisConnection } from '../../../../infrastructure/cache/redis';

export const webhookQueue = new Queue('webhook-delivery', {
  connection: redisConnection as any,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});
