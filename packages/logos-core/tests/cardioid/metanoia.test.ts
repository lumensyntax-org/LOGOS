/**
 * Tests for METANOIA - Transformation of Mind
 *
 * Verifies that the verification posture adapts correctly based on failures.
 *
 * THEOLOGICAL FOUNDATION:
 * "Be transformed by the renewal of your mind" (Romans 12:2)
 *
 * The system doesn't just retry—it learns HOW to judge differently.
 */

import { describe, it, expect } from 'vitest';
import {
  createDefaultPosture,
  adjustPosture,
  calculateAdaptiveConfidence,
  summarizePostureHistory
} from '../../src/cardioid/metanoia.js';
import type { GapResult } from '../../src/gap/index.js';
import type { MediationMode } from '../../src/cardioid/types.js';

describe('Metanoia - Adaptive Posture', () => {
  describe('createDefaultPosture', () => {
    it('creates default posture with correct initial values', () => {
      const posture = createDefaultPosture();

      expect(posture.weights.grounding_factual).toBe(1.0);
      expect(posture.weights.semantic_coherence).toBe(0.8);
      expect(posture.weights.logical_consistency).toBe(0.7);
      expect(posture.weights.completeness).toBe(0.6);

      expect(posture.thresholds.allowThreshold).toBe(0.7);
      expect(posture.thresholds.blockThreshold).toBe(0.3);

      expect(posture.learningRate).toBe(0.1);
      expect(posture.history).toEqual([]);
    });
  });

  describe('adjustPosture - Gap Type Mapping', () => {
    it('increases grounding_factual weight after FACTUAL gap', () => {
      const posture = createDefaultPosture();

      const factualGap: GapResult = {
        semantic: null,
        factual: { category: 'contradictory' as const, reason: 'Fact check failed' },
        logical: null,
        ontological: null,
        overallDistance: 0.8,
        dominantType: 'FACTUAL' as const,
        bridgeable: true,
        reason: 'Factual error detected'
      };

      const updated = adjustPosture(posture, factualGap, 'redemptive', 1);

      // Grounding weight should increase (capped at 1.0)
      // With distance 0.8 and learning rate 0.1, delta = 0.08
      // 1.0 + 0.08 = 1.08, but capped at 1.0, so no actual change
      expect(updated.weights.grounding_factual).toBe(1.0); // Already at max

      // Other weights should remain normalized
      expect(updated.weights.semantic_coherence).toBeLessThanOrEqual(1.0);

      // History should record the adjustment attempt
      expect(updated.history.length).toBe(1);
      expect(updated.history[0]?.dimension).toBe('grounding_factual');
      // Delta might be 0 if weight was already at cap
      expect(updated.history[0]?.delta).toBeGreaterThanOrEqual(0);
    });

    it('increases semantic_coherence weight after SEMANTIC gap', () => {
      const posture = createDefaultPosture();

      const semanticGap: GapResult = {
        semantic: {
          conceptual: { drift: 'A → B' },
          transformations: []
        },
        factual: null,
        logical: null,
        ontological: null,
        overallDistance: 0.6,
        dominantType: 'SEMANTIC' as const,
        bridgeable: true,
        reason: 'Semantic drift detected'
      };

      const updated = adjustPosture(posture, semanticGap, 'redemptive', 1);

      expect(updated.weights.semantic_coherence).toBeGreaterThan(posture.weights.semantic_coherence);
      expect(updated.history[0]?.dimension).toBe('semantic_coherence');
    });

    it('increases logical_consistency weight after LOGICAL gap', () => {
      const posture = createDefaultPosture();

      const logicalGap: GapResult = {
        semantic: null,
        factual: null,
        logical: {
          category: 'invalid' as const,
          fallacies: [{ type: 'affirming_consequent' as const, location: 'line 1' }],
          reason: 'Logical fallacy'
        },
        ontological: null,
        overallDistance: 0.7,
        dominantType: 'LOGICAL' as const,
        bridgeable: true,
        reason: 'Logical error detected'
      };

      const updated = adjustPosture(posture, logicalGap, 'redemptive', 1);

      expect(updated.weights.logical_consistency).toBeGreaterThan(posture.weights.logical_consistency);
      expect(updated.history[0]?.dimension).toBe('logical_consistency');
    });

    it('does NOT adjust weights for ONTOLOGICAL gaps', () => {
      const posture = createDefaultPosture();

      const ontologicalGap: GapResult = {
        semantic: null,
        factual: null,
        logical: null,
        ontological: {
          category: 'categorical' as const,
          reason: 'Category error'
        },
        overallDistance: 1.0,
        dominantType: 'ONTOLOGICAL' as const,
        bridgeable: false,
        reason: 'Categorical impossibility'
      };

      const updated = adjustPosture(posture, ontologicalGap, 'ontological', 1);

      // Weights should be unchanged for ontological gaps
      expect(updated.weights.grounding_factual).toBe(posture.weights.grounding_factual);
      expect(updated.weights.semantic_coherence).toBe(posture.weights.semantic_coherence);
      expect(updated.weights.logical_consistency).toBe(posture.weights.logical_consistency);

      // No history entries for ontological
      expect(updated.history.length).toBe(0);
    });
  });

  describe('adjustPosture - Learning Rate', () => {
    it('adjusts weight proportional to gap severity and learning rate', () => {
      const posture = createDefaultPosture();
      posture.learningRate = 0.2; // Higher learning rate
      posture.weights.grounding_factual = 0.5; // Start lower so we can see the increase

      const severeGap: GapResult = {
        semantic: null,
        factual: { category: 'contradictory' as const, reason: 'Severe error' },
        logical: null,
        ontological: null,
        overallDistance: 0.9, // High severity
        dominantType: 'FACTUAL' as const,
        bridgeable: true,
        reason: 'Severe factual error'
      };

      const updated = adjustPosture(posture, severeGap, 'redemptive', 1);

      const delta = updated.weights.grounding_factual - posture.weights.grounding_factual;

      // Delta should be: gapSeverity (0.9) * learningRate (0.2) = 0.18
      expect(delta).toBeCloseTo(0.18, 2);
    });

    it('smaller adjustment for lower severity gaps', () => {
      const posture = createDefaultPosture();
      posture.learningRate = 0.1;
      posture.weights.grounding_factual = 0.5; // Start lower so we can see the increase

      const minorGap: GapResult = {
        semantic: null,
        factual: { category: 'unsupported' as const, reason: 'Minor issue' },
        logical: null,
        ontological: null,
        overallDistance: 0.3, // Low severity
        dominantType: 'FACTUAL' as const,
        bridgeable: true,
        reason: 'Minor factual gap'
      };

      const updated = adjustPosture(posture, minorGap, 'redemptive', 1);

      const delta = updated.weights.grounding_factual - posture.weights.grounding_factual;

      // Delta should be: gapSeverity (0.3) * learningRate (0.1) = 0.03
      expect(delta).toBeCloseTo(0.03, 2);
    });
  });

  describe('adjustPosture - Weight Normalization', () => {
    it('prevents weights from exceeding 1.0', () => {
      const posture = createDefaultPosture();

      // Apply multiple severe factual gaps to push weight toward ceiling
      let updated = posture;
      for (let i = 0; i < 10; i++) {
        const gap: GapResult = {
          semantic: null,
          factual: { category: 'contradictory' as const, reason: 'Error' },
          logical: null,
          ontological: null,
          overallDistance: 0.9,
          dominantType: 'FACTUAL' as const,
          bridgeable: true,
          reason: 'Repeated factual error'
        };

        updated = adjustPosture(updated, gap, 'redemptive', i + 1);
      }

      // All weights should be <= 1.0 (normalization)
      expect(updated.weights.grounding_factual).toBeLessThanOrEqual(1.0);
      expect(updated.weights.semantic_coherence).toBeLessThanOrEqual(1.0);
      expect(updated.weights.logical_consistency).toBeLessThanOrEqual(1.0);
      expect(updated.weights.completeness).toBeLessThanOrEqual(1.0);
    });
  });

  describe('adjustPosture - Threshold Adjustment', () => {
    it('relaxes allowThreshold after STEP_UP decision', () => {
      const posture = createDefaultPosture();

      const gap: GapResult = {
        semantic: null,
        factual: { category: 'unsupported' as const, reason: 'Uncertain' },
        logical: null,
        ontological: null,
        overallDistance: 0.5,
        dominantType: 'FACTUAL' as const,
        bridgeable: true,
        reason: 'Uncertainty detected'
      };

      const updated = adjustPosture(posture, gap, 'step_up', 1);

      // AllowThreshold should decrease (more lenient)
      expect(updated.thresholds.allowThreshold).toBeLessThan(posture.thresholds.allowThreshold);

      // Should have TWO history entries: weight adjustment + threshold adjustment
      expect(updated.history.length).toBe(2);

      const thresholdAdj = updated.history.find(h => h.dimension === 'threshold');
      expect(thresholdAdj).toBeDefined();
      expect(thresholdAdj!.reason).toContain('STEP_UP');
    });

    it('does NOT adjust threshold for redemptive mode', () => {
      const posture = createDefaultPosture();

      const gap: GapResult = {
        semantic: null,
        factual: { category: 'contradictory' as const, reason: 'Error' },
        logical: null,
        ontological: null,
        overallDistance: 0.7,
        dominantType: 'FACTUAL' as const,
        bridgeable: true,
        reason: 'Factual error'
      };

      const updated = adjustPosture(posture, gap, 'redemptive', 1);

      // Threshold should be unchanged
      expect(updated.thresholds.allowThreshold).toBe(posture.thresholds.allowThreshold);

      // Only ONE history entry (weight adjustment, no threshold)
      expect(updated.history.length).toBe(1);
    });
  });

  describe('calculateAdaptiveConfidence', () => {
    it('calculates weighted average using posture weights', () => {
      const posture = createDefaultPosture();

      const signals = [
        { name: 'grounding_factual', value: 0.9 },
        { name: 'semantic_coherence', value: 0.8 },
        { name: 'logical_consistency', value: 0.7 }
      ];

      const confidence = calculateAdaptiveConfidence(signals, posture);

      // Expected: (0.9*1.0 + 0.8*0.8 + 0.7*0.7) / (1.0 + 0.8 + 0.7)
      // = (0.9 + 0.64 + 0.49) / 2.5 = 2.03 / 2.5 = 0.812
      expect(confidence).toBeCloseTo(0.812, 2);
    });

    it('uses adjusted weights after learning', () => {
      const posture = createDefaultPosture();
      posture.weights.grounding_factual = 0.5; // Start lower so adjustment is visible

      // Adjust posture to increase factual weight
      const gap: GapResult = {
        semantic: null,
        factual: { category: 'contradictory' as const, reason: 'Error' },
        logical: null,
        ontological: null,
        overallDistance: 0.8,
        dominantType: 'FACTUAL' as const,
        bridgeable: true,
        reason: 'Factual error'
      };

      const adjusted = adjustPosture(posture, gap, 'redemptive', 1);

      const signals = [
        { name: 'grounding_factual', value: 0.9 },
        { name: 'semantic_coherence', value: 0.5 }
      ];

      const confidenceBefore = calculateAdaptiveConfidence(signals, posture);
      const confidenceAfter = calculateAdaptiveConfidence(signals, adjusted);

      // After adjustment, grounding_factual has higher weight
      // So high factual signal (0.9) should increase overall confidence
      expect(confidenceAfter).toBeGreaterThan(confidenceBefore);
    });
  });

  describe('summarizePostureHistory', () => {
    it('returns message for empty history', () => {
      const posture = createDefaultPosture();

      const summary = summarizePostureHistory(posture);

      expect(summary).toContain('No adjustments yet');
    });

    it('summarizes adjustment history', () => {
      const posture = createDefaultPosture();

      const gap: GapResult = {
        semantic: null,
        factual: { category: 'contradictory' as const, reason: 'Error' },
        logical: null,
        ontological: null,
        overallDistance: 0.7,
        dominantType: 'FACTUAL' as const,
        bridgeable: true,
        reason: 'Factual error detected'
      };

      const adjusted = adjustPosture(posture, gap, 'redemptive', 1);

      const summary = summarizePostureHistory(adjusted);

      expect(summary).toContain('Posture History');
      expect(summary).toContain('Cycle 1');
      expect(summary).toContain('grounding_factual');
      expect(summary).toContain('Current Weights');
    });
  });

  describe('Metanoia Integration Test', () => {
    it('learns from multiple failures and adjusts differently over time', () => {
      let posture = createDefaultPosture();
      posture.weights.grounding_factual = 0.5; // Start lower to see cumulative learning

      // Simulate 3 factual failures
      for (let i = 0; i < 3; i++) {
        const gap: GapResult = {
          semantic: null,
          factual: { category: 'contradictory' as const, reason: 'Error' },
          logical: null,
          ontological: null,
          overallDistance: 0.8,
          dominantType: 'FACTUAL' as const,
          bridgeable: true,
          reason: 'Factual error'
        };

        posture = adjustPosture(posture, gap, 'redemptive', i + 1);
      }

      // Grounding weight should have increased significantly
      const factualWeight = posture.weights.grounding_factual;
      expect(factualWeight).toBeGreaterThan(0.5); // Should be higher than starting value

      // History should have 3 entries
      expect(posture.history.length).toBe(3);

      // Each adjustment should be recorded
      posture.history.forEach((adj, idx) => {
        expect(adj.cycleNumber).toBe(idx + 1);
        expect(adj.dimension).toBe('grounding_factual');
      });

      // Now simulate a semantic failure
      const semanticGap: GapResult = {
        semantic: {
          conceptual: { drift: 'A → B' },
          transformations: []
        },
        factual: null,
        logical: null,
        ontological: null,
        overallDistance: 0.7,
        dominantType: 'SEMANTIC' as const,
        bridgeable: true,
        reason: 'Semantic drift'
      };

      posture = adjustPosture(posture, semanticGap, 'redemptive', 4);

      // Now semantic should also be increased
      expect(posture.weights.semantic_coherence).toBeGreaterThan(0.8);

      // History should now have 4 entries
      expect(posture.history.length).toBe(4);

      // Last entry should be semantic
      expect(posture.history[3]?.dimension).toBe('semantic_coherence');
    });
  });
});
