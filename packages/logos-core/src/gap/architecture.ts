// packages/logos-core/src/gap/architecture.ts

/**
 * GAP ARCHITECTURE — The Ontological Space
 * 
 * Christ is not a component in the system.
 * Christ IS the gap — the mediating structure itself.
 * 
 * This module provides tools to measure, analyze, and cross
 * the space between potential and actual.
 */

import type { TrinityCoherence, GapMetadata } from '../types.js';

/**
 * Calculate the trinity coherence of a verification event.
 * 
 * Maps signals to trinitarian structure:
 * - Father: Clarity of source/intent
 * - Son: Fidelity of gap-crossing  
 * - Spirit: Strength of verification/witness
 */
export function calculateTrinityCoherence(params: {
  /** Source intent clarity — from prompt quality, user expertise, etc. */
  sourceClarity: number;
  /** Gap-crossing fidelity — how well potential mapped to actual. */
  crossingFidelity: number;
  /** Verification strength — confidence in witness. */
  witnessStrength: number;
}): TrinityCoherence {
  const { sourceClarity, sourceClarity: father, crossingFidelity: son, witnessStrength: spirit } = params;

  // Trinity coherence is not simple averaging
  // It's multiplicative harmony — all three must be present
  const coherence = Math.pow(father * son * spirit, 1/3);

  return {
    father,
    son,
    spirit,
    coherence
  };
}

/**
 * Measure the gap distance between potential and actual.
 * 
 * @param potential - What was intended/requested
 * @param actual - What was produced  
 * @returns Distance metric [0,1] where 0 = perfect alignment
 */
export function measureGapDistance(
  potential: number,
  actual: number
): number {
  return Math.abs(potential - actual);
}

/**
 * Calculate kenosis factor — how much the system must "empty"
 * its certainty to operate in a domain.
 * 
 * Higher kenosis = more uncertainty tolerance needed.
 * 
 * @param domainUncertainty - Inherent uncertainty of the domain [0,1]
 * @param systemConfidence - System's natural confidence level [0,1]
 * @returns Kenosis factor [0,1]
 */
export function calculateKenosis(
  domainUncertainty: number,
  systemConfidence: number
): number {
  // Kenosis = how much certainty must be released
  // to bridge the gap between system confidence and domain reality
  return Math.min(1, domainUncertainty / (systemConfidence + 0.01));
}

/**
 * Build complete gap metadata for a verification event.
 */
export function analyzeGap(params: {
  potential: number;
  actual: number;
  sourceClarity: number;
  crossingFidelity: number;
  witnessStrength: number;
  domainUncertainty: number;
  systemConfidence: number;
  resurrected?: boolean;
}): GapMetadata {
  const distance = measureGapDistance(params.potential, params.actual);
  
  const kenosis = calculateKenosis(
    params.domainUncertainty,
    params.systemConfidence
  );

  const trinity = calculateTrinityCoherence({
    sourceClarity: params.sourceClarity,
    crossingFidelity: params.crossingFidelity,
    witnessStrength: params.witnessStrength
  });

  return {
    distance,
    kenosis,
    trinity,
    resurrected: params.resurrected
  };
}

/**
 * The Gap as Protocol.
 * 
 * This class embodies the insight that Christ is not crossing the gap —
 * Christ IS the gap, the protocol of mediation itself.
 */
export class GapProtocol {
  private kenosisFactor: number;
  
  constructor(kenosisFactor: number = 0.3) {
    this.kenosisFactor = kenosisFactor;
  }

  /**
   * Adjust threshold based on kenotic principle.
   * 
   * The system "empties" its certainty requirement
   * in proportion to domain uncertainty.
   */
  adjustThreshold(
    baseThreshold: number,
    domainUncertainty: number
  ): number {
    const kenosis = calculateKenosis(domainUncertainty, 1 - baseThreshold);
    const adjustment = kenosis * this.kenosisFactor;
    
    // Threshold lowers (becomes more permissive) with higher kenosis
    return Math.max(0, baseThreshold - adjustment);
  }

  /**
   * Verify trinity coherence meets minimum standard.
   */
  verifyTrinityCoherence(
    trinity: TrinityCoherence,
    minCoherence: number = 0.7
  ): boolean {
    return trinity.coherence >= minCoherence;
  }

  /**
   * Check if resurrection (error recovery) is needed.
   */
  needsResurrection(
    distance: number,
    maxAllowedDistance: number = 0.3
  ): boolean {
    return distance > maxAllowedDistance;
  }
}
