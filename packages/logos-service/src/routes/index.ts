/**
 * Route registration for LOGOS Service
 */

import type { FastifyInstance } from 'fastify';
import { evaluateRoute } from './evaluate.js';
import { healthRoute } from './health.js';
import { metricsRoute } from './metrics.js';

export async function createRoutes(fastify: FastifyInstance) {
  // Health check
  fastify.get('/health', healthRoute);

  // Main verification endpoint
  fastify.post('/logos/evaluate', evaluateRoute);

  // Prometheus metrics
  fastify.get('/metrics', metricsRoute);

  // Root endpoint
  fastify.get('/', async () => ({
    service: 'LOGOS - Christological Verification System',
    version: '0.1.0',
    endpoints: {
      health: 'GET /health',
      evaluate: 'POST /logos/evaluate',
      metrics: 'GET /metrics'
    },
    documentation: 'https://github.com/lumensyntax-org/LOGOS'
  }));
}
