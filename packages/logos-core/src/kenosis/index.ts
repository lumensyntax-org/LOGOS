/**
 * KENOSIS - Divine Self-Limitation
 *
 * Philippians 2:6-8 - Christ "emptied himself" to bridge the gap.
 *
 * CRITICAL THEOLOGICAL PRINCIPLE:
 * Kenosis is NOT a penalty function.
 * Kenosis is POWER through RESTRAINT.
 * It's theological humility in face of the Gap.
 *
 * When facing large gaps, confidence must be LIMITED (not penalized)
 * to honor the reality of the Gap.
 */

import type { Gap } from '../types.js';

export interface KenosisResult {
  divine: number;        // What COULD be claimed (original confidence)
  humility: number;      // What is WITHHELD (self-limitation)
  kenosis: number;       // The limiting factor (1 - humility)
  limited: number;       // What IS actually claimed (divine * kenosis)
  rationale: string;     // WHY this kenosis (never use word "penalty")
}

/**
 * Calculate humility based on gap properties
 *
 * Humility increases with:
 * - Gap distance (larger gap = more humility)
 * - Unbridgeability (unbridgeable = maximum humility)
 * - Ontological gaps (categorical impossibility = maximum humility)
 */
function calculateHumility(gap: Gap): number {
  // Ontological gaps ALWAYS require maximum humility
  if (gap.type === 'ONTOLOGICAL') {
    return 0.95; // Almost total self-limitation
  }

  // Base humility from distance
  let humility = gap.distance * 0.7; // Base: 0 to 0.7

  // Increase for unbridgeable gaps
  if (!gap.bridgeable) {
    humility += 0.2;
  }

  // Type-specific adjustments
  switch (gap.type) {
    case 'LOGICAL':
      // Logical gaps require strong humility
      humility += 0.1;
      break;
    case 'FACTUAL':
      // Factual gaps can be verified, less drastic
      humility += 0.05;
      break;
    case 'SEMANTIC':
      // Semantic gaps are most flexible
      // No additional humility
      break;
  }

  // Clamp to [0, 1]
  return Math.min(Math.max(humility, 0), 1);
}

/**
 * Generate rationale explaining the kenosis
 *
 * CRITICAL: Never use words like "penalty", "punish", "reduce"
 * Always use theological language: "humility", "self-limitation", "restraint"
 */
function generateRationale(gap: Gap, humility: number): string {
  const gapType = gap.type.toLowerCase();
  const distance = gap.distance.toFixed(2);
  const bridgeable = gap.bridgeable ? 'bridgeable' : 'unbridgeable';

  // Base rationale
  let rationale = `Divine self-limitation in response to ${gapType} gap (distance: ${distance}, ${bridgeable}). `;

  // Add gap-specific explanation
  switch (gap.type) {
    case 'ONTOLOGICAL':
      rationale += 'Ontological impossibility requires maximum humility - ' +
                  'this Gap represents categorical boundaries that cannot be crossed by assertion alone. ' +
                  'Kenosis acknowledges the limits of what can be claimed.';
      break;

    case 'LOGICAL':
      rationale += 'Logical gaps indicate inference failures. ' +
                  'Humility restrains confidence until reasoning can be corrected. ' +
                  'This self-limitation honors the logos (reason) that structures reality.';
      break;

    case 'FACTUAL':
      rationale += 'Factual gaps require evidence-based restraint. ' +
                  'Humility withholds claims until facts can be verified. ' +
                  'Truth demands correspondence to reality, not confident assertion.';
      break;

    case 'SEMANTIC':
      rationale += 'Semantic gaps indicate meaning drift. ' +
                  'Humility acknowledges when intent and expression diverge. ' +
                  'Self-limitation prevents over-claiming semantic equivalence.';
      break;
  }

  // Add bridgeability note
  if (!gap.bridgeable) {
    rationale += ' This Gap cannot be bridged through mediation alone, requiring greater kenotic restraint.';
  }

  return rationale;
}

/**
 * Apply kenosis (divine self-limitation) to base confidence
 *
 * @param baseConfidence - Original confidence (0-1) before kenosis
 * @param gap - The Gap being mediated
 * @returns KenosisResult with humility, limited confidence, and rationale
 */
export function applyKenosis(
  baseConfidence: number,
  gap: Gap
): KenosisResult {
  // Validate input
  if (baseConfidence < 0 || baseConfidence > 1) {
    throw new Error(`Invalid baseConfidence: ${baseConfidence}. Must be in [0, 1].`);
  }

  // Calculate humility (how much to withhold)
  const humility = calculateHumility(gap);

  // Calculate kenosis factor (how much to keep)
  const kenosis = 1 - humility;

  // Calculate limited confidence (divine * kenosis)
  const limited = baseConfidence * kenosis;

  // Generate rationale
  const rationale = generateRationale(gap, humility);

  return {
    divine: baseConfidence,
    humility,
    kenosis,
    limited,
    rationale
  };
}

/**
 * Check if kenosis permits mediation
 *
 * Even after kenosis, if limited confidence is too low, mediation may not be possible.
 */
export function kenosisPermitsMediation(
  kenosisResult: KenosisResult,
  threshold: number = 0.1
): boolean {
  return kenosisResult.limited >= threshold;
}
