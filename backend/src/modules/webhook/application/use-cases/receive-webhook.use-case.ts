import { AppError } from '../../../../shared/errors/app-error';
import type { IEndpointRepository } from '../../../endpoints/domain/repositories/endpoint-repository.interface';
import { Event } from '../../../events/domain/entities/event.entity';
import type { IEventRepository } from '../../../events/domain/repositories/event-repository.interface';
import { webhookQueue } from '../../infrastructure/queue/webhook.queue';

interface ReceiveWebhookDto {
  urlPath: string;
  method: string;
  headers: any;
  body: any;
  query: any;
  remoteIp: string;
}

export class ReceiveWebhookUseCase {
  constructor(
    private eventRepository: IEventRepository,
    private endpointRepository: IEndpointRepository,
  ) {}

  async execute({
    urlPath,
    method,
    headers,
    body,
    query,
    remoteIp,
  }: ReceiveWebhookDto): Promise<void> {
    const endpoint = await this.endpointRepository.findByUrlPath(urlPath);

    if (!endpoint) {
      throw new AppError('Endpoint not found', 404);
    }

    if (!endpoint.active) {
      throw new AppError('Endpoint is inactive', 403);
    }

    const lastEvent = await this.eventRepository.findLastByEndpointId(endpoint.id);
    if (lastEvent) {
      const timeDiff = Date.now() - lastEvent.createdAt.getTime();
      const stripeSignature = headers['stripe-signature'];

      if (
        stripeSignature &&
        lastEvent.headers &&
        (lastEvent.headers as any)['stripe-signature'] === stripeSignature &&
        timeDiff < 5000
      ) {
        return;
      }

      const currentBody = JSON.stringify(body || {});
      const lastBody = JSON.stringify(lastEvent.body || {});
      if (lastEvent.method === method && currentBody === lastBody && timeDiff < 2000) {
        return;
      }
    }

    const event = Event.create({
      endpointId: endpoint.id,
      method,
      headers,
      body: body || {},
      query: query || {},
      status: endpoint.targetUrl ? 100 : 200,
      remoteIp,
    });

    await this.eventRepository.create(event);

    if (endpoint.targetUrl) {
      await webhookQueue.add('deliver', {
        eventId: event.id,
        targetUrl: endpoint.targetUrl,
      });
    }
  }
}
