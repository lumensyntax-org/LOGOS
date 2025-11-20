/**
 * METANOIA - Transformation of Mind
 *
 * "Be transformed by the renewal of your mind" (Romans 12:2)
 *
 * Metanoia (μετάνοια) is not mere "repentance" but "transformation of mind"—
 * literally "beyond (meta) the mind (nous)".
 *
 * The system doesn't just retry with the same criteria; it transforms HOW
 * it judges based on what it learned from failures.
 *
 * EMBODIED LEARNING:
 * This is "somatic" knowledge—the body (verification system) learning a new stance.
 * - After factual failures → increase grounding_factual weight
 * - After semantic failures → increase semantic_coherence weight
 * - After logical failures → increase logical_consistency weight
 * - After ontological failures → recognize categorical boundaries
 *
 * This prevents the amnesia Gemini identified: learning without memory = futility.
 */

import type {
  VerifierPosture,
  PostureAdjustment,
  MediationMode
} from './types.js';
import type { GapResult } from '../gap/index.js';

/**
 * Create default verifier posture
 *
 * These defaults reflect the relative importance of each dimension:
 * - Grounding (1.0): Most critical—truth must be anchored
 * - Semantic (0.8): Very important—meaning must cohere
 * - Logical (0.7): Important—reasoning must be valid
 * - Completeness (0.6): Desirable—but not always achievable
 */
export function createDefaultPosture(): VerifierPosture {
  return {
    weights: {
      grounding_factual: 1.0,
      semantic_coherence: 0.8,
      logical_consistency: 0.7,
      completeness: 0.6
    },
    thresholds: {
      allowThreshold: 0.7,   // Confidence >= 0.7 → ALLOW
      blockThreshold: 0.3    // Confidence <= 0.3 → BLOCK
    },
    learningRate: 0.1,  // Conservative learning (10% adjustment)
    history: []
  };
}

/**
 * Adjust verifier posture based on gap failure
 *
 * This is the core metanoia logic: when mediation fails, the system
 * learns to adjust its stance for future judgments.
 *
 * THEOLOGICAL PRINCIPLE:
 * The failure is not punishment—it's pedagogy. Each failure teaches
 * the system WHERE to look more carefully next time.
 *
 * @param currentPosture - The current verification stance
 * @param gap - The gap that caused the failure
 * @param mediationMode - What kind of mediation was required
 * @param cycleNumber - Which cycle this adjustment occurred in
 * @returns Updated posture with adjustment history
 */
export function adjustPosture(
  currentPosture: VerifierPosture,
  gap: GapResult,
  mediationMode: MediationMode,
  cycleNumber: number
): VerifierPosture {
  // Deep clone to avoid mutation
  const updatedPosture: VerifierPosture = {
    weights: { ...currentPosture.weights },
    thresholds: { ...currentPosture.thresholds },
    learningRate: currentPosture.learningRate,
    history: [...currentPosture.history]
  };

  // Determine which dimension to adjust based on dominant gap type
  const dimension = mapGapTypeToDimension(gap.dominantType);

  if (!dimension) {
    // ONTOLOGICAL gaps don't adjust weights—they're categorical boundaries
    return currentPosture;
  }

  // Calculate adjustment amount based on gap severity and learning rate
  const gapSeverity = gap.overallDistance; // 0-1
  const baseAdjustment = gapSeverity * currentPosture.learningRate;

  // Increase weight for the dimension that failed
  const oldValue = updatedPosture.weights[dimension];
  const newValue = Math.min(1.0, oldValue + baseAdjustment);
  const delta = newValue - oldValue;

  // Record the adjustment
  const adjustment: PostureAdjustment = {
    cycleNumber,
    reason: `${gap.dominantType} gap detected (distance: ${gapSeverity.toFixed(2)}). Increasing ${dimension} weight.`,
    dimension,
    oldValue,
    newValue,
    delta,
    timestamp: new Date()
  };

  updatedPosture.weights[dimension] = newValue;
  updatedPosture.history.push(adjustment);

  // Normalize weights to prevent sum explosion
  // (Keep ratios but ensure no weight exceeds 1.0)
  normalizeWeights(updatedPosture.weights);

  // Adjust thresholds based on mediation mode
  if (mediationMode === 'step_up') {
    // Too many STEP_UP decisions → system is too uncertain
    // Slightly relax allowThreshold to be more confident
    const oldThreshold = updatedPosture.thresholds.allowThreshold;
    const newThreshold = Math.max(0.5, oldThreshold - (currentPosture.learningRate * 0.5));

    if (newThreshold !== oldThreshold) {
      updatedPosture.thresholds.allowThreshold = newThreshold;
      updatedPosture.history.push({
        cycleNumber,
        reason: `Too many STEP_UP decisions. Relaxing allowThreshold to reduce uncertainty.`,
        dimension: 'threshold',
        oldValue: oldThreshold,
        newValue: newThreshold,
        delta: newThreshold - oldThreshold,
        timestamp: new Date()
      });
    }
  }

  return updatedPosture;
}

/**
 * Map gap type to corresponding weight dimension
 *
 * SEMANTIC gap → semantic_coherence
 * FACTUAL gap → grounding_factual
 * LOGICAL gap → logical_consistency
 * ONTOLOGICAL gap → null (categorical boundary, no adjustment)
 */
function mapGapTypeToDimension(
  gapType: 'SEMANTIC' | 'FACTUAL' | 'LOGICAL' | 'ONTOLOGICAL'
): 'grounding_factual' | 'semantic_coherence' | 'logical_consistency' | 'completeness' | null {
  switch (gapType) {
    case 'SEMANTIC':
      return 'semantic_coherence';
    case 'FACTUAL':
      return 'grounding_factual';
    case 'LOGICAL':
      return 'logical_consistency';
    case 'ONTOLOGICAL':
      return null; // No adjustment for categorical impossibilities
    default:
      return null;
  }
}

/**
 * Normalize weights to prevent sum explosion
 *
 * Keeps the maximum weight at 1.0 while preserving ratios.
 * This prevents runaway weight inflation over many cycles.
 *
 * THEOLOGICAL NOTE:
 * This represents humility in learning—the system grows in wisdom
 * without becoming arrogant (weights don't explode).
 */
function normalizeWeights(weights: {
  grounding_factual: number;
  semantic_coherence: number;
  logical_consistency: number;
  completeness: number;
}): void {
  const maxWeight = Math.max(
    weights.grounding_factual,
    weights.semantic_coherence,
    weights.logical_consistency,
    weights.completeness
  );

  // If max weight exceeds 1.0, scale all weights down proportionally
  if (maxWeight > 1.0) {
    const scale = 1.0 / maxWeight;
    weights.grounding_factual *= scale;
    weights.semantic_coherence *= scale;
    weights.logical_consistency *= scale;
    weights.completeness *= scale;
  }
}

/**
 * Calculate confidence using adaptive weights from posture
 *
 * This replaces the static aggregateSignals with dynamic weighting
 * based on learned experience.
 *
 * @param signals - Raw verification signals
 * @param posture - Current verifier posture with learned weights
 * @returns Weighted confidence score [0-1]
 */
export function calculateAdaptiveConfidence(
  signals: { name: string; value: number }[],
  posture: VerifierPosture
): number {
  if (signals.length === 0) return 0;

  let weightedSum = 0;
  let totalWeight = 0;

  for (const signal of signals) {
    // Map signal name to posture dimension
    const weight = getWeightForSignal(signal.name, posture);
    weightedSum += signal.value * weight;
    totalWeight += weight;
  }

  return totalWeight > 0 ? weightedSum / totalWeight : 0;
}

/**
 * Map signal name to corresponding posture weight
 *
 * This connects TruthSyntax signals to Metanoia-learned weights.
 */
function getWeightForSignal(
  signalName: string,
  posture: VerifierPosture
): number {
  const name = signalName.toLowerCase();

  if (name.includes('grounding') || name.includes('factual')) {
    return posture.weights.grounding_factual;
  }
  if (name.includes('semantic') || name.includes('coherence')) {
    return posture.weights.semantic_coherence;
  }
  if (name.includes('logical') || name.includes('consistency')) {
    return posture.weights.logical_consistency;
  }
  if (name.includes('complete')) {
    return posture.weights.completeness;
  }

  // Default weight for unknown signals
  return 0.5;
}

/**
 * Get human-readable summary of posture adjustments
 *
 * Useful for debugging and introspection.
 * "Examine yourselves" (2 Cor 13:5)
 */
export function summarizePostureHistory(posture: VerifierPosture): string {
  if (posture.history.length === 0) {
    return "No adjustments yet. Posture remains at default.";
  }

  const lines: string[] = [
    `Posture History (${posture.history.length} adjustments):`,
    ""
  ];

  for (const adj of posture.history) {
    lines.push(
      `Cycle ${adj.cycleNumber}: ${adj.dimension} ` +
      `${adj.oldValue.toFixed(3)} → ${adj.newValue.toFixed(3)} ` +
      `(Δ ${adj.delta > 0 ? '+' : ''}${adj.delta.toFixed(3)})`
    );
    lines.push(`  Reason: ${adj.reason}`);
    lines.push("");
  }

  lines.push("Current Weights:");
  lines.push(`  grounding_factual: ${posture.weights.grounding_factual.toFixed(3)}`);
  lines.push(`  semantic_coherence: ${posture.weights.semantic_coherence.toFixed(3)}`);
  lines.push(`  logical_consistency: ${posture.weights.logical_consistency.toFixed(3)}`);
  lines.push(`  completeness: ${posture.weights.completeness.toFixed(3)}`);

  return lines.join('\n');
}
