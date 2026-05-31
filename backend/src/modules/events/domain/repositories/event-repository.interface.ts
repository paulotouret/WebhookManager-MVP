import type { Event } from '../entities/event.entity';

export interface IEventRepository {
  create(event: Event): Promise<void>;
  update(event: Event): Promise<void>;
  findById(id: string): Promise<Event | null>;
  findMany(filters: {
    endpointId?: string;
    userId?: string;
    method?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Event[]>;
  findLastByEndpointId(endpointId: string): Promise<Event | null>;
}
