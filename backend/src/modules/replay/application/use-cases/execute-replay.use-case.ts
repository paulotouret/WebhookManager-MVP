import crypto from 'node:crypto';
import { AppError } from '../../../../shared/errors/app-error';
import type { IEndpointRepository } from '../../../endpoints/domain/repositories/endpoint-repository.interface';
import type { IEventRepository } from '../../../events/domain/repositories/event-repository.interface';
import { Replay } from '../../domain/entities/replay.entity';
import type { IReplayRepository } from '../../domain/repositories/replay-repository.interface';

interface ExecuteReplayDto {
  eventId: string;
  targetUrl: string;
}
export class ExecuteReplayUseCase {
  constructor(
    private replayRepository: IReplayRepository,
    private eventRepository: IEventRepository,
    private endpointRepository: IEndpointRepository,
  ) {}
  async execute({ eventId, targetUrl }: ExecuteReplayDto): Promise<Replay> {
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new AppError('Event not found', 404);
    }
    const endpoint = await this.endpointRepository.findById(event.endpointId);
    if (!endpoint) {
      throw new AppError('Endpoint associated with event not found', 404);
    }
    let status = 0;
    let responseBody: any = null;
    try {
      const originalHeaders = event.headers as Record<string, string>;
      const headers: Record<string, string> = {};
      for (const [key, value] of Object.entries(originalHeaders)) {
        const lowerKey = key.toLowerCase();
        if (
          !['host', 'content-length', 'connection', 'authorization', 'cookie'].includes(lowerKey)
        ) {
          headers[key] = value;
        }
      }
      let requestBody: string | undefined;
      const hasBody = event.body && Object.keys(event.body as object).length > 0;
      if (event.method !== 'GET' && event.method !== 'HEAD' && hasBody) {
        requestBody = typeof event.body === 'string' ? event.body : JSON.stringify(event.body);
        if (!headers['content-type'] && !headers['Content-Type']) {
          headers['Content-Type'] = 'application/json';
        }
      }
      if (endpoint.secret && requestBody) {
        const signature = crypto
          .createHmac('sha256', endpoint.secret)
          .update(requestBody)
          .digest('hex');
        headers['HookFlow-Signature'] = `sha256=${signature}`;
      }
      const response = await fetch(targetUrl, {
        method: event.method,
        headers,
        body: requestBody,
      });
      status = response.status;
      const text = await response.text();
      try {
        responseBody = JSON.parse(text);
      } catch {
        responseBody = text;
      }
    } catch (err: any) {
      status = 500;
      responseBody = { error: err.message };
    }
    const replay = Replay.create({
      eventId,
      targetUrl,
      status,
      response: responseBody || {},
    });
    await this.replayRepository.create(replay);
    return replay;
  }
}
