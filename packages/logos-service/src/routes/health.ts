/**
 * GET /health
 *
 * Health check endpoint
 */

import type { FastifyRequest, FastifyReply } from 'fastify';
import type { HealthResponse } from '../types/api.js';

export async function healthRoute(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<HealthResponse> {
  const uptime = process.uptime();

  // Check Redis connection (if available)
  const redis = (request.server as any).redis;
  let redisStatus: 'connected' | 'disconnected' | undefined;

  if (redis) {
    try {
      await redis.ping();
      redisStatus = 'connected';
    } catch {
      redisStatus = 'disconnected';
    }
  }

  // Check LOGOS engine
  const logos = (request.server as any).logos;
  const coreStatus = logos ? 'operational' : 'failed';

  // Determine overall status
  const status =
    coreStatus === 'failed' ? 'down' :
    redisStatus === 'disconnected' ? 'degraded' :
    'ok';

  const response: HealthResponse = {
    status,
    uptime,
    timestamp: new Date().toISOString(),
    version: '0.1.0',
    services: {
      redis: redisStatus,
      core: coreStatus
    }
  };

  // Set appropriate status code
  if (status === 'down') {
    reply.code(503);
  } else if (status === 'degraded') {
    reply.code(200); // Still operational, just degraded
  }

  return response;
}
