/**
 * Prometheus metrics endpoint
 *
 * Exposes application metrics in Prometheus format
 */

import type { FastifyRequest, FastifyReply } from 'fastify';
import { register } from '../metrics/index.js';

/**
 * GET /metrics
 *
 * Returns metrics in Prometheus exposition format
 */
export async function metricsRoute(request: FastifyRequest, reply: FastifyReply) {
  try {
    // Set content type for Prometheus
    reply.header('Content-Type', register.contentType);

    // Return all metrics
    return await register.metrics();
  } catch (err) {
    request.log.error({ err }, 'Failed to generate metrics');
    reply.status(500).send({
      error: 'Internal Server Error',
      message: 'Failed to generate metrics'
    });
  }
}
