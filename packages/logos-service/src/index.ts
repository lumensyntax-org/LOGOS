/**
 * LOGOS HTTP Service
 *
 * Exposes Christological verification via REST API
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { createRoutes } from './routes/index.js';
import { errorHandler } from './middleware/error-handler.js';
import { LogosEngine } from '@logos/core';
import Redis from 'ioredis';
import { initSentry, flushSentry } from './sentry.js';

const PORT = parseInt(process.env.PORT || '8787');
const HOST = process.env.HOST || '0.0.0.0';
const REDIS_URL = process.env.REDIS_URL;

async function buildServer() {
  // Initialize Sentry for error tracking
  initSentry();

  // Create Fastify instance with logging
  const fastify = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
      transport: process.env.NODE_ENV !== 'production'
        ? { target: 'pino-pretty' }
        : undefined
    },
    requestIdLogLabel: 'reqId',
    disableRequestLogging: false,
    requestIdHeader: 'x-request-id'
  });

  // Register plugins
  await fastify.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:']
      }
    }
  });

  await fastify.register(cors, {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true
  });

  // Rate limiting
  await fastify.register(rateLimit, {
    max: parseInt(process.env.RATE_LIMIT_MAX || '60'),
    timeWindow: process.env.RATE_LIMIT_WINDOW || '1 minute',
    redis: REDIS_URL ? new Redis(REDIS_URL) : undefined,
    nameSpace: 'logos:rl:',
    errorResponseBuilder: () => ({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
      statusCode: 429,
      timestamp: new Date().toISOString()
    })
  });

  // Initialize LOGOS Engine
  const logosEngine = new LogosEngine({
    policy: {
      allowThreshold: parseFloat(process.env.ALLOW_THRESHOLD || '0.7'),
      blockThreshold: parseFloat(process.env.BLOCK_THRESHOLD || '0.3'),
      redemptiveMode: process.env.REDEMPTIVE_MODE !== 'false',
      maxResurrectionAttempts: parseInt(process.env.MAX_RESURRECTION_ATTEMPTS || '3')
    },
    theologicalMode: true
  });

  // Attach LOGOS engine to fastify instance
  fastify.decorate('logos', logosEngine);

  // Initialize Redis (optional)
  let redis: Redis | undefined;
  if (REDIS_URL) {
    redis = new Redis(REDIS_URL, {
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3
    });

    redis.on('connect', () => {
      fastify.log.info('Redis connected');
    });

    redis.on('error', (err) => {
      fastify.log.error({ err }, 'Redis error');
    });

    fastify.decorate('redis', redis);
  }

  // Register routes
  await fastify.register(createRoutes);

  // Error handler
  fastify.setErrorHandler(errorHandler);

  // Graceful shutdown
  const signals = ['SIGINT', 'SIGTERM'];
  signals.forEach((signal) => {
    process.on(signal, async () => {
      fastify.log.info(`Received ${signal}, closing server gracefully`);

      // Flush Sentry events before shutdown
      try {
        await flushSentry(2000);
      } catch (err) {
        fastify.log.error({ err }, 'Failed to flush Sentry');
      }

      if (redis) {
        await redis.quit();
      }

      await fastify.close();
      process.exit(0);
    });
  });

  return fastify;
}

// Start server
async function start() {
  try {
    const fastify = await buildServer();

    await fastify.listen({
      port: PORT,
      host: HOST
    });

    fastify.log.info(
      `LOGOS Service listening on ${HOST}:${PORT} (${process.env.NODE_ENV || 'development'})`
    );
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  start();
}

export { buildServer };
