import type { FastifyReply, FastifyRequest } from 'fastify';
import type { ReceiveWebhookUseCase } from '../../../modules/webhook/application/use-cases/receive-webhook.use-case';

export class WebhookController {
  constructor(private receiveWebhookUseCase: ReceiveWebhookUseCase) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const { urlPath } = request.params as { urlPath: string };
    const { method, headers, body, query, ip } = request;

    await this.receiveWebhookUseCase.execute({
      urlPath,
      method,
      headers,
      body,
      query,
      remoteIp: ip,
    });

    return reply.status(200).send({ message: 'Webhook received' });
  }
}
