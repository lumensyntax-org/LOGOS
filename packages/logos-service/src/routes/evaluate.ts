/**
 * POST /logos/evaluate
 *
 * Main verification endpoint
 */

import type { FastifyRequest, FastifyReply } from 'fastify';
import { EvaluateRequestSchema, type EvaluateResponse } from '../types/api.js';
import type { Source, Manifestation, Signal } from '@logos/core';
import { recordVerificationMetrics } from '../metrics/index.js';

export async function evaluateRoute(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<EvaluateResponse> {
  const startTime = Date.now();

  // Validate request body
  const validation = EvaluateRequestSchema.safeParse(request.body);

  if (!validation.success) {
    return reply.code(400).send({
      error: 'Validation Error',
      message: validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
      statusCode: 400,
      timestamp: new Date().toISOString()
    });
  }

  const { source: sourceData, manifestation: manifestData, signals, policy } = validation.data;

  try {
    // Get LOGOS engine from fastify instance
    const logos = (request.server as any).logos;

    // Prepare source
    const source: Source = {
      intent: sourceData.intent,
      groundTruth: sourceData.groundTruth,
      premises: sourceData.premises,
      timestamp: sourceData.timestamp ? new Date(sourceData.timestamp) : new Date()
    };

    // Prepare manifestation
    const manifestation: Manifestation = {
      content: manifestData.content,
      timestamp: manifestData.timestamp ? new Date(manifestData.timestamp) : new Date()
    };

    // Prepare signals (with defaults if none provided)
    const inputSignals: Signal[] = signals.length > 0
      ? signals.map(s => ({
          name: s.name,
          value: s.value,
          weight: s.weight,
          source: s.source || 'api'
        }))
      : [
          { name: 'api_submission', value: 0.8, weight: 1.0, source: 'api' }
        ];

    // Update policy if provided
    if (policy) {
      logos.config.policy = {
        ...logos.config.policy,
        ...policy
      };
    }

    // Perform Christological verification
    const result = await logos.verify(source, manifestation, inputSignals);

    const duration = Date.now() - startTime;

    request.log.info({
      decision: result.decision,
      confidence: result.confidence,
      gap: result.gap.overallDistance,
      duration
    }, 'Verification completed');

    // Format response
    const response: EvaluateResponse = {
      decision: result.decision,
      confidence: result.confidence,
      gap: {
        overall: result.gap.overallDistance,
        semantic: result.gap.semantic?.distance || 0,
        factual: result.gap.factual?.distance || 0,
        logical: result.gap.logical?.distance || 0,
        ontological: result.gap.ontological?.distance || 0,
        dominantType: result.gap.dominantType,
        bridgeable: result.gap.bridgeable
      },
      mediation: {
        type: result.gap.mediation?.type || 'direct',
        kenosisApplied: result.kenosisApplied || 0,
        resurrectionAttempted: result.resurrectionAttempted || false
      },
      finalState: result.finalState,
      timestamp: new Date().toISOString()
    };

    // Record metrics for monitoring
    recordVerificationMetrics(response, duration / 1000); // Convert ms to seconds

    return response;
  } catch (error) {
    request.log.error({ err: error }, 'Verification failed');

    return reply.code(500).send({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      statusCode: 500,
      timestamp: new Date().toISOString()
    });
  }
}
