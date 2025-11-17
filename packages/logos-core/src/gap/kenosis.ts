/**
 * KENOSIS - The Divine Self-Limitation
 * 
 * Philippians 2:6-7 - Christ "emptied himself" (kenosis) to bridge infinite → finite
 * 
 * In LOGOS: The verification system must constrain its certainty
 * to operate within the boundaries of uncertain human knowledge.
 * 
 * Perfect knowledge cannot operate directly in imperfect domains.
 * It must "empty itself" to become accessible.
 */

import type { GapDistance, Mediation } from '../types.js';

/**
 * Apply kenosis - constrain infinite to finite capacity
 */
export function applyKenosis(
  divineConfidence: number,  // The "perfect" confidence score
  humanContext: GapDistance   // The limitations of the domain
): number {
  const { overall } = humanContext;
  
  // The larger the gap, the more the divine must constrain itself
  const kenosisFactor = calculateKenosisFactor(overall);
  
  // Divine confidence is "emptied" proportionally
  return divineConfidence * (1 - kenosisFactor);
}

/**
 * Calculate how much self-limitation is needed
 */
function calculateKenosisFactor(gapDistance: number): number {
  // Sigmoid curve: gentle constraint for small gaps, strong for large
  return 1 / (1 + Math.exp(-10 * (gapDistance - 0.5)));
}

/**
 * Determine if kenosis allows for mediation
 * 
 * Even with self-limitation, is the gap crossable?
 */
export function kenosisPermitsMediation(mediation: Mediation): boolean {
  const { kenosis, fidelity } = mediation;
  
  // If kenosis is too extreme (>0.9), gap may be uncrossable
  if (kenosis > 0.9) {
    return fidelity > 0.3;  // Need at least some fidelity
  }
  
  // Normal case: kenosis permits mediation if fidelity is reasonable
  return fidelity > 0.1;
}

/**
 * Calculate the "cost" of kenosis
 * 
 * Every act of divine self-limitation has a cost in reduced certainty
 */
export function calculateKenosisCost(
  originalConfidence: number,
  adjustedConfidence: number
): number {
  return originalConfidence - adjustedConfidence;
}
