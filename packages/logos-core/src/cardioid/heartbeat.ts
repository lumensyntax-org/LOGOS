/**
 * Cardioid Heartbeat - Single Cycle Implementation
 *
 * This module implements a single heartbeat cycle in the cardioid architecture:
 * DIASTOLE (expansion) → SYSTOLE (contraction) → CUSP (decision)
 *
 * THEOLOGICAL FOUNDATION:
 * Each heartbeat represents one complete circulation through the Trinitarian
 * pattern: Father (Source) → Son (Manifestation) → Spirit (Verification).
 *
 * The heartbeat is NOT a simple function call—it's a participation in the
 * eternal perichoresis (mutual indwelling) of the Trinity.
 */

import type { Source, Manifestation, Signal, ChristologicalResult } from '../types.js';
import type { GapResult } from '../gap/index.js';
import type { CardioidState, CuspDecision, MediationMode } from './types.js';
import { detectGap } from '../gap/index.js';
import { applyKenosis } from '../kenosis/index.js';
import { ponder } from './memory.js';

/**
 * Heartbeat Configuration
 */
export interface HeartbeatConfig {
  /** Policy thresholds */
  allowThreshold: number;
  blockThreshold: number;

  /** Should redemptive mode be active? */
  redemptiveMode: boolean;

  /** Smoothing factor for EWMA confidence */
  smoothingFactor: number;
}

/**
 * Result of a single heartbeat cycle
 */
export interface HeartbeatResult {
  /** The Christological result from this cycle */
  christologicalResult: ChristologicalResult;

  /** Decision made at the cusp */
  cuspDecision: CuspDecision;

  /** Updated state after this heartbeat */
  updatedState: CardioidState;

  /** Should circulation terminate? */
  shouldTerminate: boolean;

  /** Why should it terminate (if applicable)? */
  terminationReason: string | null;
}

/**
 * Execute one heartbeat cycle
 *
 * FLOW:
 * 1. DIASTOLE: Expand - receive Source and Manifestation
 * 2. SYSTOLE: Contract - detect Gap and apply Kenosis
 * 3. CUSP: Critical point - make mediation decision
 * 4. Return updated state for next cycle
 *
 * @param state - Current cardioid state
 * @param config - Heartbeat configuration
 * @param signals - Verification signals from Spirit
 * @returns Result of this heartbeat cycle
 */
export async function heartbeat(
  state: CardioidState,
  config: HeartbeatConfig,
  signals: Signal[]
): Promise<HeartbeatResult> {
  // =============================================================================
  // DIASTOLE (Expansion) - The Source manifests
  // =============================================================================
  // At this point, we already have Source and Manifestation from the state
  // The expansion has occurred - now we contract to detect the gap

  // =============================================================================
  // SYSTOLE (Contraction) - Detect the Gap
  // =============================================================================

  const intent = state.source.intent;
  const expression = state.manifestation?.content || '';
  const options = {
    groundTruth: state.source.groundTruth,
    premises: state.source.premises
  };

  const gap = detectGap(intent, expression, options);

  // Apply Kenosis (divine self-limitation)
  const rawConfidence = calculateConfidence(signals);

  const simpleGap = {
    distance: gap.overallDistance,
    type: gap.dominantType,
    bridgeable: gap.bridgeable
  };

  const kenosisResult = applyKenosis(rawConfidence, simpleGap);
  const adjustedConfidence = kenosisResult.limited;

  // =============================================================================
  // CUSP (Critical Point) - Mediation Decision
  // =============================================================================

  const cuspDecision = decideMediationMode(
    gap,
    adjustedConfidence,
    state,
    config
  );

  // =============================================================================
  // CHRISTOLOGICAL RESULT
  // =============================================================================

  const christologicalResult: ChristologicalResult = {
    gap,
    decision: mapMediationToPolicy(cuspDecision.mode),
    confidence: adjustedConfidence,
    sacraments: [], // TODO: Implement sacramental checkpoints
    redemptionAttempted: cuspDecision.resurrectable && cuspDecision.mode === 'redemptive',
    finalState: getFinalState(cuspDecision.mode)
  };

  // =============================================================================
  // MARIAN PONDERING
  // =============================================================================

  const updatedMemory = ponder(
    state.memory,
    christologicalResult,
    gap,
    cuspDecision.mode
  );

  // =============================================================================
  // TERMINATION CHECK
  // =============================================================================

  const termination = checkTermination(cuspDecision, gap, state);

  // =============================================================================
  // UPDATE STATE
  // =============================================================================

  const updatedState: CardioidState = {
    ...state,
    cycleNumber: state.cycleNumber + 1,
    gap,
    kenosisApplied: kenosisResult.humility,
    cuspDecision,
    memory: updatedMemory,
    terminated: termination.shouldTerminate,
    terminationReason: termination.reason
  };

  return {
    christologicalResult,
    cuspDecision,
    updatedState,
    shouldTerminate: termination.shouldTerminate,
    terminationReason: termination.reason
  };
}

/**
 * Calculate confidence from signals
 */
function calculateConfidence(signals: Signal[]): number {
  if (signals.length === 0) return 0.5; // Neutral

  const weightedSum = signals.reduce((sum, s) => sum + (s.value * s.weight), 0);
  const totalWeight = signals.reduce((sum, s) => sum + s.weight, 0);
  const rawScore = totalWeight > 0 ? weightedSum / totalWeight : 0;

  // Convert to 0-1 range (signals are -1 to 1)
  return (rawScore + 1) / 2;
}

/**
 * Decide which mode of mediation to use at the Cusp
 *
 * THEOLOGICAL PRINCIPLE:
 * Christ mediates in multiple modes depending on the nature of the Gap.
 * Not all gaps require the same mode of mediation.
 *
 * @param gap - The detected gap
 * @param confidence - Kenosis-adjusted confidence
 * @param state - Current cardioid state
 * @param config - Configuration
 * @returns Cusp decision
 */
function decideMediationMode(
  gap: GapResult,
  confidence: number,
  state: CardioidState,
  config: HeartbeatConfig
): CuspDecision {
  // =============================================================================
  // ONTOLOGICAL BLOCK - Categorical impossibility
  // =============================================================================
  if (gap.dominantType === 'ONTOLOGICAL') {
    return {
      mode: 'ontological' as MediationMode,
      kenosisRequired: 1.0, // Maximum humility - acknowledge impossibility
      humanInvolvement: true, // Always require human discernment for ontological
      resurrectable: false, // Cannot resurrect categorical boundaries
      reason: `Ontological boundary detected: ${gap.reason}. This gap cannot be mediated by computational systems.`
    };
  }

  // =============================================================================
  // STEP_UP_HUMAN - Exceeds AI capacity
  // =============================================================================
  if (confidence > config.blockThreshold && confidence < config.allowThreshold) {
    // Purgatory - requires human judgment
    return {
      mode: 'step_up' as MediationMode,
      kenosisRequired: 0.5, // Moderate humility - acknowledge limitation
      humanInvolvement: true,
      resurrectable: true, // Might be transformable with human guidance
      reason: `Confidence in purgatory (${confidence.toFixed(3)}). Requires ecclesial discernment beyond AI capacity.`
    };
  }

  // =============================================================================
  // REDEMPTIVE_TRANSFORMATION - Requires resurrection
  // =============================================================================
  if (confidence <= config.blockThreshold && gap.bridgeable && config.redemptiveMode) {
    // Low confidence but bridgeable - try resurrection
    return {
      mode: 'redemptive' as MediationMode,
      kenosisRequired: 0.7, // High humility - acknowledge need for transformation
      humanInvolvement: false, // Can attempt without human (but may fail)
      resurrectable: true,
      reason: `Low confidence (${confidence.toFixed(3)}) but gap is bridgeable. Attempting redemptive transformation through resurrection.`
    };
  }

  // =============================================================================
  // ONTOLOGICAL BLOCK (via policy) - Unbridgeable + low confidence
  // =============================================================================
  if (confidence <= config.blockThreshold && !gap.bridgeable) {
    return {
      mode: 'ontological' as MediationMode,
      kenosisRequired: 0.9, // Very high humility - severe limitation
      humanInvolvement: true,
      resurrectable: false, // Unbridgeable means transformation won't help
      reason: `Low confidence (${confidence.toFixed(3)}) and gap is unbridgeable. Cannot mediate this gap.`
    };
  }

  // =============================================================================
  // KENOTIC_MEDIATION - Moderate gap, kenosis required
  // =============================================================================
  if (confidence >= config.allowThreshold && gap.overallDistance > 0.3) {
    // High confidence but noticeable gap - mediate through self-limitation
    return {
      mode: 'kenotic' as MediationMode,
      kenosisRequired: gap.overallDistance * 0.5, // Proportional to gap size
      humanInvolvement: false,
      resurrectable: false, // Already successful, no resurrection needed
      reason: `Confidence acceptable (${confidence.toFixed(3)}) but gap detected (${gap.overallDistance.toFixed(3)}). Mediating through kenotic self-limitation.`
    };
  }

  // =============================================================================
  // DIRECT_ALLOW - Minimal gap, direct passage
  // =============================================================================
  return {
    mode: 'direct_allow' as MediationMode,
    kenosisRequired: 0.1, // Minimal humility - acknowledge finitude
    humanInvolvement: false,
    resurrectable: false,
    reason: `High confidence (${confidence.toFixed(3)}) and minimal gap (${gap.overallDistance.toFixed(3)}). Direct passage without mediation.`
  };
}

/**
 * Map MediationMode to PolicyDecision for backward compatibility
 */
function mapMediationToPolicy(mode: MediationMode): 'ALLOW' | 'BLOCK' | 'STEP_UP' {
  switch (mode) {
    case 'direct_allow':
    case 'kenotic':
      return 'ALLOW';
    case 'ontological':
    case 'redemptive': // While attempting resurrection
      return 'BLOCK';
    case 'step_up':
      return 'STEP_UP';
    default:
      return 'BLOCK';
  }
}

/**
 * Get final state from mediation mode
 */
function getFinalState(mode: MediationMode): 'original' | 'redeemed' | 'blocked' {
  switch (mode) {
    case 'direct_allow':
    case 'kenotic':
      return 'original';
    case 'redemptive':
      return 'redeemed'; // Optimistic - resurrection will attempt
    case 'ontological':
      return 'blocked';
    case 'step_up':
      return 'original'; // Deferred to human, not blocked
    default:
      return 'blocked';
  }
}

/**
 * Check if circulation should terminate
 *
 * THREE TYPES OF TERMINATION:
 * 1. Ontological Boundary (hard stop) - Cannot be crossed
 * 2. Resurrection Exhaustion (soft stop) - Tried and failed
 * 3. Successful Mediation (natural completion) - Goal achieved
 *
 * @param decision - The cusp decision
 * @param gap - The detected gap
 * @param state - Current state
 * @returns Termination decision
 */
function checkTermination(
  decision: CuspDecision,
  gap: GapResult,
  state: CardioidState
): { shouldTerminate: boolean; reason: string | null } {
  // =============================================================================
  // TYPE 1: ONTOLOGICAL BOUNDARY (Hard Stop)
  // =============================================================================
  if (decision.mode === 'ontological' && gap.dominantType === 'ONTOLOGICAL') {
    return {
      shouldTerminate: true,
      reason: 'Ontological boundary: categorical impossibility cannot be mediated'
    };
  }

  // =============================================================================
  // TYPE 2: RESURRECTION EXHAUSTION (Soft Stop)
  // =============================================================================
  if (state.resurrectionAttempts >= state.maxResurrectionAttempts) {
    return {
      shouldTerminate: true,
      reason: `Resurrection exhausted: ${state.resurrectionAttempts} attempts failed`
    };
  }

  // =============================================================================
  // TYPE 3: SUCCESSFUL MEDIATION (Natural Completion)
  // =============================================================================
  if (decision.mode === 'direct_allow' || decision.mode === 'kenotic') {
    return {
      shouldTerminate: true,
      reason: 'Successful mediation: gap bridged'
    };
  }

  // =============================================================================
  // TYPE 4: MAX CYCLES REACHED (Safety Stop)
  // =============================================================================
  if (state.cycleNumber >= state.maxCycles) {
    return {
      shouldTerminate: true,
      reason: `Maximum cycles reached: ${state.maxCycles}`
    };
  }

  // =============================================================================
  // CONTINUE CIRCULATING
  // =============================================================================
  return {
    shouldTerminate: false,
    reason: null
  };
}
