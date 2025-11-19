/**
 * GAP Module - The Heart of LOGOS
 *
 * Exports all gap-related functionality:
 * - Detection: Identifying the gap between source and manifestation (4D)
 * - Kenosis: Divine self-limitation for mediation
 * - Resurrection: Error recovery through gap-crossing
 *
 * CRITICAL: Ontological gaps override all others (categorical impossibility).
 */

import { detectSemanticGap } from './semantic.js';
import { detectFactualGap } from './factual.js';
import { detectLogicalGap } from './logical.js';
import { detectOntologicalGap } from './ontological.js';

export interface GapResult {
  semantic: ReturnType<typeof detectSemanticGap> | null;
  factual: ReturnType<typeof detectFactualGap> | null;
  logical: ReturnType<typeof detectLogicalGap> | null;
  ontological: ReturnType<typeof detectOntologicalGap> | null;

  overallDistance: number;
  bridgeable: boolean;
  dominantType: 'SEMANTIC' | 'FACTUAL' | 'LOGICAL' | 'ONTOLOGICAL' | 'NONE';
  reason: string;
}

/**
 * Detect gap across all 4 dimensions
 *
 * @param intent - Source intent or ground truth
 * @param expression - Manifestation or claim
 * @param options - Additional context (premises for logical, ground truth for factual)
 */
export function detectGap(
  intent: string,
  expression: string,
  options: {
    premises?: string[];
    groundTruth?: Record<string, unknown>;
  } = {}
): GapResult {
  // 1. Check ontological gap first (categorical impossibility)
  const ontological = detectOntologicalGap(intent, expression);

  // If ontological gap exists, it overrides everything else
  if (ontological !== null) {
    return {
      semantic: null,
      factual: null,
      logical: null,
      ontological,
      overallDistance: 1.0, // Ontological is always 1.0
      bridgeable: false,
      dominantType: 'ONTOLOGICAL',
      reason: ontological.reason
    };
  }

  // 2. Detect other gap types
  const semantic = detectSemanticGap(intent, expression);

  const factual = options.groundTruth
    ? detectFactualGap(options.groundTruth, expression)
    : null;

  const logical = options.premises
    ? detectLogicalGap(options.premises, expression)
    : null;

  // 3. Calculate overall distance (weighted average of non-null gaps)
  const gaps = [semantic, factual, logical].filter((g): g is NonNullable<typeof g> => g !== null);

  if (gaps.length === 0) {
    // No gaps detected
    return {
      semantic,
      factual,
      logical,
      ontological: null,
      overallDistance: 0,
      bridgeable: true,
      dominantType: 'NONE',
      reason: 'No significant gaps detected'
    };
  }

  const totalDistance = gaps.reduce((sum, gap) => sum + gap.distance, 0);
  const overallDistance = totalDistance / gaps.length;

  // 4. Determine dominant gap type (highest distance)
  let dominantType: GapResult['dominantType'] = 'NONE';
  let maxDistance = 0;

  if (semantic && semantic.distance > maxDistance) {
    maxDistance = semantic.distance;
    dominantType = 'SEMANTIC';
  }
  if (factual && factual.distance > maxDistance) {
    maxDistance = factual.distance;
    dominantType = 'FACTUAL';
  }
  if (logical && logical.distance > maxDistance) {
    maxDistance = logical.distance;
    dominantType = 'LOGICAL';
  }

  // 5. Check if bridgeable (all gaps must be bridgeable)
  const bridgeable = gaps.every((gap: any) => {
    if ('bridgeable' in gap) return gap.bridgeable;
    if ('valid' in gap) return !gap.valid || gap.distance < 0.7; // logical
    return true;
  });

  // 6. Generate reason
  const reason = generateReason(dominantType, maxDistance, bridgeable);

  return {
    semantic,
    factual,
    logical,
    ontological: null,
    overallDistance,
    bridgeable,
    dominantType,
    reason
  };
}

/**
 * Generate human-readable reason for gap assessment
 */
function generateReason(
  dominantType: GapResult['dominantType'],
  distance: number,
  bridgeable: boolean
): string {
  if (dominantType === 'NONE') {
    return 'No significant gaps detected';
  }

  const gapName = dominantType.toLowerCase();
  const severity = distance < 0.3 ? 'small' : distance < 0.7 ? 'moderate' : 'large';
  const bridgeStatus = bridgeable ? 'bridgeable' : 'unbridgeable';

  return `${severity} ${gapName} gap (distance: ${distance.toFixed(2)}, ${bridgeStatus})`;
}

// Re-export individual detectors
export { detectSemanticGap } from './semantic.js';
export { detectFactualGap } from './factual.js';
export { detectLogicalGap } from './logical.js';
export { detectOntologicalGap } from './ontological.js';

// Re-export kenosis and resurrection
export { applyKenosis } from '../kenosis/index.js';
export { attemptResurrection } from '../resurrection/index.js';
