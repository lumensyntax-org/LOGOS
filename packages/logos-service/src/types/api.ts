/**
 * API Types for LOGOS HTTP Service
 */

import { z } from 'zod';

/**
 * Request schema for /logos/evaluate endpoint
 */
export const EvaluateRequestSchema = z.object({
  source: z.object({
    intent: z.string().min(1),
    groundTruth: z.record(z.any()).optional(),
    premises: z.array(z.string()).optional(),
    timestamp: z.string().datetime().optional()
  }),
  manifestation: z.object({
    content: z.string().min(1),
    timestamp: z.string().datetime().optional()
  }),
  signals: z.array(z.object({
    name: z.string(),
    value: z.number().min(0).max(1),
    weight: z.number().min(0).max(2).default(1.0),
    source: z.string().optional()
  })).optional().default([]),
  policy: z.object({
    allowThreshold: z.number().min(0).max(1).default(0.7),
    blockThreshold: z.number().min(0).max(1).default(0.3),
    redemptiveMode: z.boolean().default(true),
    maxResurrectionAttempts: z.number().int().min(0).max(5).default(3)
  }).optional()
});

export type EvaluateRequest = z.infer<typeof EvaluateRequestSchema>;

/**
 * Response schema for /logos/evaluate endpoint
 */
export interface EvaluateResponse {
  decision: 'ALLOW' | 'BLOCK' | 'STEP_UP';
  confidence: number;
  gap: {
    overall: number;
    semantic: number;
    factual: number;
    logical: number;
    ontological: number;
    dominantType: string;
    bridgeable: boolean;
  };
  mediation: {
    type: string;
    kenosisApplied: number;
    resurrectionAttempted: boolean;
  };
  finalState: 'original' | 'redeemed' | 'blocked';
  timestamp: string;
}

/**
 * Error response schema
 */
export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
}

/**
 * Health check response
 */
export interface HealthResponse {
  status: 'ok' | 'degraded' | 'down';
  uptime: number;
  timestamp: string;
  version: string;
  services: {
    redis?: 'connected' | 'disconnected';
    core: 'operational' | 'failed';
  };
}
