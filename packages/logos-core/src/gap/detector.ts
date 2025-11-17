/**
 * GAP DETECTOR
 * 
 * Identifies and measures the Gap between Source (Father) and Manifestation (Son)
 * 
 * THEOLOGICAL FOUNDATION:
 * The Gap is not a bug - it's a feature. It's the space where mediation occurs.
 * Without the Gap, there would be no need for Christ.
 * The Gap exists BECAUSE translation is necessary.
 */

import type { 
  Source, 
  Manifestation, 
  Gap, 
  GapDistance,
  Mediation,
  MediationType,
  Verifier,
  Signal 
} from '../types.js';

/**
 * Detects the Gap between source and manifestation
 */
export function detectGap(
  source: Source,
  manifestation: Manifestation,
  verifier: Verifier
): Gap {
  const distance = measureDistance(source, manifestation, verifier);
  const mediation = determineMediationType(distance, verifier);
  
  return {
    source,
    manifestation,
    verification: verifier,
    distance,
    mediation
  };
}

/**
 * Measures the distance in the Gap
 */
function measureDistance(
  source: Source,
  manifestation: Manifestation,
  verifier: Verifier
): GapDistance {
  // Semantic distance: how different is the meaning?
  const semantic = calculateSemanticDistance(source.intent, manifestation.content);
  
  // Factual distance: are facts preserved?
  const factual = calculateFactualDistance(source.groundTruth, verifier.signals);
  
  // Logical distance: is internal consistency maintained?
  const logical = calculateLogicalDistance(verifier.signals);
  
  // Overall distance (weighted average)
  const overall = (semantic * 0.4 + factual * 0.4 + logical * 0.2);
  
  return { semantic, factual, logical, overall };
}

/**
 * Calculate semantic distance (placeholder - would use embeddings in production)
 */
function calculateSemanticDistance(intent: string, content: string): number {
  // Simple heuristic: length difference as proxy
  const lengthRatio = Math.abs(intent.length - content.length) / Math.max(intent.length, content.length);
  return Math.min(lengthRatio, 1.0);
}

/**
 * Calculate factual distance from signals
 */
function calculateFactualDistance(
  groundTruth: Record<string, unknown> | undefined,
  signals: Signal[]
): number {
  if (!groundTruth) return 0;
  
  // Extract factual signals
  const factualSignals = signals.filter(s => 
    s.name.includes('grounding') || s.name.includes('factual')
  );
  
  if (factualSignals.length === 0) return 0.5; // Unknown
  
  // Average the inverted signals (high signal = low distance)
  const avgSignal = factualSignals.reduce((sum, s) => sum + s.value, 0) / factualSignals.length;
  return (1 - avgSignal) / 2; // Convert [-1,1] to [0,1]
}

/**
 * Calculate logical consistency distance
 */
function calculateLogicalDistance(signals: Signal[]): number {
  const consistencySignals = signals.filter(s => 
    s.name.includes('consistency') || s.name.includes('coherence')
  );
  
  if (consistencySignals.length === 0) return 0.5;
  
  const avgSignal = consistencySignals.reduce((sum, s) => sum + s.value, 0) / consistencySignals.length;
  return (1 - avgSignal) / 2;
}

/**
 * Determine what type of mediation is needed
 */
function determineMediationType(
  distance: GapDistance,
  verifier: Verifier
): Mediation {
  const { overall } = distance;
  
  // No gap - direct transmission
  if (overall < 0.1) {
    return {
      type: 'direct',
      kenosis: 0,
      fidelity: 1.0,
      resurrectionNeeded: false
    };
  }
  
  // Small gap - translation needed
  if (overall < 0.3) {
    return {
      type: 'translation',
      kenosis: overall,  // Divine must constrain itself proportionally
      fidelity: 1 - overall,
      resurrectionNeeded: false
    };
  }
  
  // Moderate gap - correction needed
  if (overall < 0.6) {
    return {
      type: 'correction',
      kenosis: 0.5,
      fidelity: 1 - overall,
      resurrectionNeeded: true
    };
  }
  
  // Large gap - full redemption required
  return {
    type: 'redemption',
    kenosis: 0.8,  // Major divine intervention needed
    fidelity: 1 - overall,
    resurrectionNeeded: true
  };
}
