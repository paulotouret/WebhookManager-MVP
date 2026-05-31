import type { Replay } from '../entities/replay.entity';
export interface IReplayRepository {
  create(replay: Replay): Promise<void>;
  findById(id: string): Promise<Replay | null>;
  findByEventId(eventId: string): Promise<Replay[]>;
}
