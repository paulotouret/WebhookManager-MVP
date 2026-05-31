import type { FastifyInstance } from 'fastify';
import { authRoutes } from '../adapters/http/routes/auth.routes';
import { endpointRoutes } from '../adapters/http/routes/endpoint.routes';
import { eventRoutes } from '../adapters/http/routes/event.routes';
import { projectRoutes } from '../adapters/http/routes/project.routes';
import { replayRoutes } from '../adapters/http/routes/replay.routes';
import { userRoutes } from '../adapters/http/routes/user.routes';
import { webhookRoutes } from '../adapters/http/routes/webhook.routes';

export async function registerRoutes(app: FastifyInstance) {
  app.register(userRoutes, { prefix: '/users' });
  app.register(authRoutes, { prefix: '/auth' });
  app.register(projectRoutes, { prefix: '/projects' });
  app.register(endpointRoutes, { prefix: '/endpoints' });
  app.register(eventRoutes, { prefix: '/events' });
  app.register(replayRoutes, { prefix: '/replay' });
  app.register(webhookRoutes, { prefix: '/wh' });
}
