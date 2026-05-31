import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import fastifyStatic from '@fastify/static';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import fastify from 'fastify';
import path from 'node:path';
import { ZodError } from 'zod';
import 'dotenv/config';

import { AppError } from '../shared/errors/app-error';
import { registerRoutes } from './routes';

const app = fastify({
  logger:
    process.env.NODE_ENV !== 'production'
      ? {
          transport: {
            target: 'pino-pretty',
          },
        }
      : true,
});

app.setErrorHandler((error, _request, reply) => {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      message: 'Validation error',
      errors: error.flatten().fieldErrors,
    });
  }

  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      message: error.message,
    });
  }

  const statusCode = (error as any).statusCode || 500;
  const message = statusCode === 500 ? 'Internal server error' : (error as any).message;

  return reply.status(statusCode).send({ message });
});

app.register(cors, {
  origin: ['http://localhost:5000', 'http://localhost:5173', 'http://localhost:3000', true],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true,
});

app.register(helmet);

app.register(jwt, {
  secret: process.env.JWT_SECRET || 'super-secret-key-change-it-now-in-production',
});

app.register(swagger, {
  openapi: {
    info: {
      title: 'Webhook Manager API',
      description: 'API documentation for Webhook Manager',
      version: '1.0.0',
    },
  },
});

app.register(swaggerUi, {
  routePrefix: '/docs',
});

app.register(registerRoutes);

if (process.env.NODE_ENV === 'production') {
  const frontendDist = path.resolve(__dirname, '../../../frontend/dist');

  app.register(fastifyStatic, {
    root: frontendDist,
    prefix: '/',
  });

  app.setNotFoundHandler((_request, reply) => {
    return reply.sendFile('index.html');
  });
}

app.get('/api/health', async () => {
  return { status: 'ok' };
});

if (process.env.NODE_ENV !== 'production') {
  app.get('/', async () => {
    return { message: 'Webhook Manager API is running' };
  });
}

export { app };
