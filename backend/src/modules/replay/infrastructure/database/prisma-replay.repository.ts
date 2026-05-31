import { prisma } from '../../../../infrastructure/database/prisma';
import { Replay } from '../../domain/entities/replay.entity';
import type { IReplayRepository } from '../../domain/repositories/replay-repository.interface';

export class PrismaReplayRepository implements IReplayRepository {
  async create(replay: Replay): Promise<void> {
    await prisma.replay.create({
      data: {
        id: replay.id,
        eventId: replay.eventId,
        targetUrl: replay.targetUrl,
        status: replay.status,
        response: replay.response,
        createdAt: replay.createdAt,
      },
    });
  }
  async findById(id: string): Promise<Replay | null> {
    const data = await prisma.replay.findUnique({
      where: { id },
    });
    if (!data) return null;
    return Replay.create(
      {
        eventId: data.eventId,
        targetUrl: data.targetUrl,
        status: data.status,
        response: data.response,
        createdAt: data.createdAt,
      },
      data.id,
    );
  }
  async findByEventId(eventId: string): Promise<Replay[]> {
    const data = await prisma.replay.findMany({
      where: { eventId },
    });
    return data.map((item) =>
      Replay.create(
        {
          eventId: item.eventId,
          targetUrl: item.targetUrl,
          status: item.status,
          response: item.response,
          createdAt: item.createdAt,
        },
        item.id,
      ),
    );
  }
}
