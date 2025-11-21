/**
 * Global error handler for Fastify
 */

import type { FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import type { ErrorResponse } from '../types/api.js';
import { Sentry } from '../sentry.js';

export async function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  // Log error
  request.log.error({
    err: error,
    reqId: request.id,
    method: request.method,
    url: request.url
  }, 'Request error');

  // Capture in Sentry (with request context)
  Sentry.withScope((scope) => {
    scope.setContext('request', {
      id: request.id,
      method: request.method,
      url: request.url,
      headers: request.headers
    });

    // Add user context if available (e.g., from auth middleware)
    if ((request as any).user) {
      scope.setUser({ id: (request as any).user.id });
    }

    // Set tags
    scope.setTag('route', request.url);
    scope.setTag('method', request.method);

    // Only capture 500 errors in Sentry
    const statusCode = error.statusCode || 500;
    if (statusCode >= 500) {
      Sentry.captureException(error);
    }
  });

  // Determine status code
  const statusCode = error.statusCode || 500;

  // Build error response
  const response: ErrorResponse = {
    error: error.name || 'Error',
    message: error.message || 'An unexpected error occurred',
    statusCode,
    timestamp: new Date().toISOString()
  };

  // Don't expose internal errors in production
  if (statusCode === 500 && process.env.NODE_ENV === 'production') {
    response.message = 'Internal server error';
  }

  reply.code(statusCode).send(response);
}
