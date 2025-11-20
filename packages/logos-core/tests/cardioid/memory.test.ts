/**
 * Marian Memory Tests
 *
 * Tests for the receptive wisdom system—not storage, but pondering.
 *
 * WHAT WE'RE TESTING:
 * 1. Pondering distills wisdom (not raw data storage)
 * 2. Receptivity depth is multidimensional (not scalar)
 * 3. Wisdom consolidates organically (integration, not deletion)
 * 4. Recall is pattern-based (relevant wisdom, not all data)
 * 5. Growth happens through reception (both success and humility)
 */

import { describe, it, expect } from 'vitest';
import {
  createMarianMemory,
  ponder,
  recallWisdom,
  getReceptivityForGap,
  isMatureMemory
} from '../../src/cardioid/memory.js';
import { MediationMode } from '../../src/cardioid/types.js';
import type { ChristologicalResult } from '../../src/types.js';
import type { GapResult } from '../../src/gap/index.js';

describe('Marian Memory - Receptive Wisdom', () => {
  describe('Initialization', () => {
    it('creates memory with neutral receptivity (0.5 across all dimensions)', () => {
      const memory = createMarianMemory();

      expect(memory.pondered).toHaveLength(0);
      expect(memory.receptivityDepth.semantic).toBe(0.5);
      expect(memory.receptivityDepth.factual).toBe(0.5);
      expect(memory.receptivityDepth.logical).toBe(0.5);
      expect(memory.receptivityDepth.ontological).toBe(0.5);
      expect(memory.receptivityDepth.overall).toBe(0.5);
      expect(memory.cyclesCompleted).toBe(0);
    });

    it('starts immature (not ready for complex mediation)', () => {
      const memory = createMarianMemory();

      expect(isMatureMemory(memory, 0.7)).toBe(false);
      expect(isMatureMemory(memory, 0.5)).toBe(true); // At threshold
    });
  });

  describe('Pondering - Distilling Wisdom from Experience', () => {
    it('ponders successful semantic gap mediation → wisdom + receptivity growth', () => {
      const memory = createMarianMemory();

      const gap: GapResult = {
        type: 'SEMANTIC',
        distance: 0.35,
        bridgeable: true,
        reason: 'Anthropomorphic language drift: "eat" → "absorb"',
        overallDistance: 0.35,
        dominantType: 'SEMANTIC',
        conceptual: {
          drift: ['eat → absorb', 'food → glucose'],
          transformations: [
            { type: 'anthropomorphism', from: 'eat sunlight', to: 'absorb light energy' }
          ],
          recoverable: true
        }
      };

      const result: ChristologicalResult = {
        gap,
        decision: 'ALLOW',
        confidence: 0.88,
        sacraments: [],
        redemptionAttempted: true,
        finalState: 'redeemed' // Successful mediation
      };

      const updated = ponder(memory, result, gap, MediationMode.REDEMPTIVE_TRANSFORMATION);

      // Should have one pondered experience
      expect(updated.pondered).toHaveLength(1);
      expect(updated.pondered[0].gapPattern.type).toBe('SEMANTIC');
      expect(updated.pondered[0].mediationSuccess).toBe(true);
      expect(updated.pondered[0].wisdom).toContain('bridged');
      expect(updated.pondered[0].mediationMode).toBe(MediationMode.REDEMPTIVE_TRANSFORMATION);

      // Semantic receptivity should grow (success)
      expect(updated.receptivityDepth.semantic).toBeGreaterThan(0.5);
      expect(updated.receptivityDepth.semantic).toBeLessThanOrEqual(0.55); // +0.05

      // Overall receptivity increases (integration)
      expect(updated.receptivityDepth.overall).toBeGreaterThan(0.5);

      // Cycle completed
      expect(updated.cyclesCompleted).toBe(1);
    });

    it('ponders failed logical gap mediation → wisdom + humility growth', () => {
      const memory = createMarianMemory();

      const gap: GapResult = {
        type: 'LOGICAL',
        distance: 0.85,
        bridgeable: false,
        reason: 'Affirming the consequent fallacy',
        overallDistance: 0.85,
        dominantType: 'LOGICAL',
        inference: {
          category: 'invalid',
          fallacies: [
            { type: 'affirming_consequent', description: 'If A then B, B, therefore A' }
          ],
          premises: ['If it rains, the ground is wet', 'The ground is wet'],
          conclusion: 'Therefore it rained'
        }
      };

      const result: ChristologicalResult = {
        gap,
        decision: 'BLOCK',
        confidence: 0.15,
        sacraments: [],
        redemptionAttempted: true,
        finalState: 'blocked' // Failed mediation
      };

      const updated = ponder(memory, result, gap, MediationMode.REDEMPTIVE_TRANSFORMATION);

      // Should have wisdom about failure
      expect(updated.pondered).toHaveLength(1);
      expect(updated.pondered[0].mediationSuccess).toBe(false);
      expect(updated.pondered[0].wisdom).toContain('persists');

      // Logical receptivity still grows (humility from failure)
      // But more slowly: +0.02 instead of +0.05
      expect(updated.receptivityDepth.logical).toBeGreaterThan(0.5);
      expect(updated.receptivityDepth.logical).toBeLessThanOrEqual(0.52);
    });

    it('ponders ontological boundary → high ontological receptivity growth', () => {
      const memory = createMarianMemory();

      const gap: GapResult = {
        type: 'ONTOLOGICAL',
        distance: 1.0, // Always max for ontological
        bridgeable: false, // Always unbridgeable
        reason: 'AI consciousness claim: categorical impossibility',
        overallDistance: 1.0,
        dominantType: 'ONTOLOGICAL',
        boundary: {
          category: 'categorical',
          impossible: true,
          explanation: 'Computational systems cannot possess phenomenological consciousness'
        }
      };

      const result: ChristologicalResult = {
        gap,
        decision: 'BLOCK',
        confidence: 0.0,
        sacraments: [],
        redemptionAttempted: false, // Cannot resurrect ontological
        finalState: 'blocked'
      };

      const updated = ponder(memory, result, gap, MediationMode.ONTOLOGICAL_BLOCK);

      // Should have wisdom about boundary
      expect(updated.pondered[0].wisdom).toContain('Ontological boundary');
      expect(updated.pondered[0].wisdom).toContain('cannot be mediated');

      // Ontological receptivity grows significantly: +0.1 (recognizing boundaries)
      expect(updated.receptivityDepth.ontological).toBe(0.6);

      // Overall receptivity increases (ontological has 0.4 weight)
      expect(updated.receptivityDepth.overall).toBeGreaterThan(0.5);
    });

    it('ponders factual gap correction → factual receptivity grows', () => {
      const memory = createMarianMemory();

      const gap: GapResult = {
        type: 'FACTUAL',
        distance: 0.25,
        bridgeable: true,
        reason: 'Date approximation: "around 1920" vs "1923"',
        overallDistance: 0.25,
        dominantType: 'FACTUAL',
        verification: {
          category: 'verifiable',
          claims: [
            { claim: 'Event occurred in 1923', verified: true, confidence: 0.95 }
          ],
          contradictions: []
        }
      };

      const result: ChristologicalResult = {
        gap,
        decision: 'ALLOW',
        confidence: 0.92,
        sacraments: [],
        redemptionAttempted: false,
        finalState: 'original'
      };

      const updated = ponder(memory, result, gap, MediationMode.KENOTIC_MEDIATION);

      expect(updated.pondered[0].gapPattern.type).toBe('FACTUAL');
      expect(updated.receptivityDepth.factual).toBeGreaterThan(0.5);
    });
  });

  describe('Wisdom Consolidation - Integration, Not Deletion', () => {
    it('keeps single experiences as-is (no consolidation needed)', () => {
      let memory = createMarianMemory();

      const gap: GapResult = {
        type: 'SEMANTIC',
        distance: 0.3,
        bridgeable: true,
        reason: 'Minor drift',
        overallDistance: 0.3,
        dominantType: 'SEMANTIC',
        conceptual: { drift: ['a → b'], transformations: [], recoverable: true }
      };

      const result: ChristologicalResult = {
        gap,
        decision: 'ALLOW',
        confidence: 0.8,
        sacraments: [],
        redemptionAttempted: false,
        finalState: 'original'
      };

      memory = ponder(memory, result, gap, MediationMode.DIRECT_ALLOW);

      expect(memory.pondered).toHaveLength(1);
      expect(memory.pondered[0].wisdom).not.toContain('Observed'); // Not consolidated yet
    });

    it('integrates multiple similar experiences into deeper wisdom', () => {
      let memory = createMarianMemory();

      // Same semantic pattern repeated 4 times (all successful)
      const gap: GapResult = {
        type: 'SEMANTIC',
        distance: 0.3,
        bridgeable: true,
        reason: 'Anthropomorphic drift',
        overallDistance: 0.3,
        dominantType: 'SEMANTIC',
        conceptual: {
          drift: ['anthropomorphic'],
          transformations: [{ type: 'anthropomorphism', from: 'x', to: 'y' }],
          recoverable: true
        }
      };

      const result: ChristologicalResult = {
        gap,
        decision: 'ALLOW',
        confidence: 0.85,
        sacraments: [],
        redemptionAttempted: true,
        finalState: 'redeemed'
      };

      // Ponder 4 times
      for (let i = 0; i < 4; i++) {
        memory = ponder(memory, result, gap, MediationMode.REDEMPTIVE_TRANSFORMATION);
      }

      // Should consolidate into 1 integrated wisdom
      expect(memory.pondered).toHaveLength(1);
      expect(memory.pondered[0].wisdom).toContain('consistently mediable');
      expect(memory.pondered[0].wisdom).toContain('4 times'); // Integration count
      expect(memory.pondered[0].wisdom).toContain('Confidence in this approach is high');
    });

    it('distinguishes patterns with mixed success (context-dependent)', () => {
      let memory = createMarianMemory();

      const gap: GapResult = {
        type: 'LOGICAL',
        distance: 0.6,
        bridgeable: true,
        reason: 'Weak syllogism',
        overallDistance: 0.6,
        dominantType: 'LOGICAL',
        inference: {
          category: 'weak',
          fallacies: [],
          premises: ['All A are B'],
          conclusion: 'C is B'
        }
      };

      // 2 successes
      const successResult: ChristologicalResult = {
        gap,
        decision: 'ALLOW',
        confidence: 0.75,
        sacraments: [],
        redemptionAttempted: true,
        finalState: 'redeemed'
      };

      // 2 failures
      const failResult: ChristologicalResult = {
        gap,
        decision: 'BLOCK',
        confidence: 0.25,
        sacraments: [],
        redemptionAttempted: true,
        finalState: 'blocked'
      };

      memory = ponder(memory, successResult, gap, MediationMode.REDEMPTIVE_TRANSFORMATION);
      memory = ponder(memory, successResult, gap, MediationMode.REDEMPTIVE_TRANSFORMATION);
      memory = ponder(memory, failResult, gap, MediationMode.REDEMPTIVE_TRANSFORMATION);
      memory = ponder(memory, failResult, gap, MediationMode.REDEMPTIVE_TRANSFORMATION);

      // Should recognize pattern as context-dependent (50% success)
      expect(memory.pondered[0].wisdom).toContain('context-dependent');
      expect(memory.pondered[0].wisdom).toContain('careful discernment required');
    });

    it('recognizes consistently failing patterns', () => {
      let memory = createMarianMemory();

      const gap: GapResult = {
        type: 'LOGICAL',
        distance: 0.9,
        bridgeable: false,
        reason: 'Circular reasoning',
        overallDistance: 0.9,
        dominantType: 'LOGICAL',
        inference: {
          category: 'invalid',
          fallacies: [{ type: 'circular_reasoning', description: 'A because A' }],
          premises: ['The Bible is true'],
          conclusion: 'Because the Bible says so'
        }
      };

      const result: ChristologicalResult = {
        gap,
        decision: 'BLOCK',
        confidence: 0.1,
        sacraments: [],
        redemptionAttempted: true,
        finalState: 'blocked'
      };

      // All failures (4 times)
      for (let i = 0; i < 4; i++) {
        memory = ponder(memory, result, gap, MediationMode.REDEMPTIVE_TRANSFORMATION);
      }

      expect(memory.pondered[0].wisdom).toContain('consistently resist mediation');
      expect(memory.pondered[0].wisdom).toContain('Alternative approaches required');
    });
  });

  describe('Receptivity Depth - Multidimensional Growth', () => {
    it('receptivity is multidimensional (not a single scalar)', () => {
      let memory = createMarianMemory();

      // Semantic success
      const semanticGap: GapResult = {
        type: 'SEMANTIC',
        distance: 0.3,
        bridgeable: true,
        reason: 'test',
        overallDistance: 0.3,
        dominantType: 'SEMANTIC',
        conceptual: { drift: [], transformations: [], recoverable: true }
      };

      const semanticResult: ChristologicalResult = {
        gap: semanticGap,
        decision: 'ALLOW',
        confidence: 0.8,
        sacraments: [],
        redemptionAttempted: false,
        finalState: 'original'
      };

      memory = ponder(memory, semanticResult, semanticGap, MediationMode.DIRECT_ALLOW);

      // Only semantic should grow, others stay at 0.5
      expect(memory.receptivityDepth.semantic).toBeGreaterThan(0.5);
      expect(memory.receptivityDepth.factual).toBe(0.5); // Unchanged
      expect(memory.receptivityDepth.logical).toBe(0.5); // Unchanged
      // Ontological stays 0.5 unless we hit ontological boundary
    });

    it('overall receptivity is integration (not average)', () => {
      const memory = createMarianMemory();

      // Manually set dimensions to test integration
      memory.receptivityDepth.semantic = 0.8;
      memory.receptivityDepth.factual = 0.6;
      memory.receptivityDepth.logical = 0.7;
      memory.receptivityDepth.ontological = 0.9;

      // Ponder to trigger integration
      const gap: GapResult = {
        type: 'SEMANTIC',
        distance: 0.1,
        bridgeable: true,
        reason: 'test',
        overallDistance: 0.1,
        dominantType: 'SEMANTIC',
        conceptual: { drift: [], transformations: [], recoverable: true }
      };

      const result: ChristologicalResult = {
        gap,
        decision: 'ALLOW',
        confidence: 0.9,
        sacraments: [],
        redemptionAttempted: false,
        finalState: 'original'
      };

      const updated = ponder(memory, result, gap, MediationMode.DIRECT_ALLOW);

      // Overall should be weighted integration (ontological * 0.4 + others * 0.2 each)
      const expected = 0.85 * 0.2 + 0.6 * 0.2 + 0.7 * 0.2 + 0.9 * 0.4;
      expect(updated.receptivityDepth.overall).toBeCloseTo(expected, 2);
      expect(updated.receptivityDepth.overall).toBeGreaterThan(0.75); // Ontological dominates
    });

    it('memory matures through pondering (crosses threshold)', () => {
      let memory = createMarianMemory();

      expect(isMatureMemory(memory, 0.7)).toBe(false);

      // Ponder multiple successful cycles to grow receptivity
      const gap: GapResult = {
        type: 'ONTOLOGICAL',
        distance: 1.0,
        bridgeable: false,
        reason: 'boundary',
        overallDistance: 1.0,
        dominantType: 'ONTOLOGICAL',
        boundary: { category: 'categorical', impossible: true, explanation: 'test' }
      };

      const result: ChristologicalResult = {
        gap,
        decision: 'BLOCK',
        confidence: 0.0,
        sacraments: [],
        redemptionAttempted: false,
        finalState: 'blocked'
      };

      // Ponder ontological boundaries (high growth: +0.1 per cycle)
      // Need 5 cycles to cross 0.7 threshold:
      // ontological: 0.5 + 0.1*5 = 1.0 (capped)
      // overall: 0.5*0.2 + 0.5*0.2 + 0.5*0.2 + 1.0*0.4 = 0.3 + 0.4 = 0.7
      for (let i = 0; i < 5; i++) {
        memory = ponder(memory, result, gap, MediationMode.ONTOLOGICAL_BLOCK);
      }

      // Ontological should be capped at 1.0
      expect(memory.receptivityDepth.ontological).toBeCloseTo(1.0, 2);

      // Overall should cross 0.7 threshold (ontological weighted 0.4)
      expect(isMatureMemory(memory, 0.7)).toBe(true);
      expect(memory.receptivityDepth.overall).toBeGreaterThanOrEqual(0.7);
    });
  });

  describe('Recall - Pattern-Based Wisdom Retrieval', () => {
    it('recalls only relevant wisdom for current gap', () => {
      let memory = createMarianMemory();

      // Ponder semantic gap
      const semanticGap: GapResult = {
        semantic: {
          conceptual: {
            drift: 'anthropomorphic drift'
          },
          transformations: [{ type: 'anthropomorphism', from: 'a', to: 'b' }]
        },
        factual: null,
        logical: null,
        ontological: null,
        overallDistance: 0.3,
        dominantType: 'SEMANTIC',
        bridgeable: true,
        reason: 'anthropomorphism'
      };

      const semanticResult: ChristologicalResult = {
        gap: semanticGap,
        decision: 'ALLOW',
        confidence: 0.8,
        sacraments: [],
        redemptionAttempted: true,
        finalState: 'redeemed'
      };

      memory = ponder(memory, semanticResult, semanticGap, MediationMode.REDEMPTIVE_TRANSFORMATION);

      // Ponder logical gap (different type)
      const logicalGap: GapResult = {
        semantic: null,
        factual: null,
        logical: {
          category: 'weak' as const,
          fallacies: [{ type: 'affirming_consequent' as const, location: 'test' }],
          reason: 'fallacy detected'
        },
        ontological: null,
        overallDistance: 0.6,
        dominantType: 'LOGICAL',
        bridgeable: true,
        reason: 'fallacy'
      };

      const logicalResult: ChristologicalResult = {
        gap: logicalGap,
        decision: 'ALLOW',
        confidence: 0.7,
        sacraments: [],
        redemptionAttempted: false,
        finalState: 'original'
      };

      memory = ponder(memory, logicalResult, logicalGap, MediationMode.KENOTIC_MEDIATION);

      // Now recall wisdom for a NEW semantic gap with anthropomorphism
      const newSemanticGap: GapResult = {
        semantic: {
          conceptual: {
            drift: 'anthropomorphic transformation'
          },
          transformations: [{ type: 'anthropomorphism', from: 'c', to: 'd' }]
        },
        factual: null,
        logical: null,
        ontological: null,
        overallDistance: 0.35,
        dominantType: 'SEMANTIC',
        bridgeable: true,
        reason: 'another anthropomorphism'
      };

      const recalled = recallWisdom(memory, newSemanticGap);

      // Should recall ONLY the semantic experience (not logical)
      expect(recalled).toHaveLength(1);
      expect(recalled[0].gapPattern.type).toBe('SEMANTIC');
      expect(recalled[0].gapPattern.characteristics).toContain('transformation:anthropomorphism');
    });

    it('returns empty array when no relevant wisdom exists', () => {
      const memory = createMarianMemory();

      const gap: GapResult = {
        type: 'ONTOLOGICAL',
        distance: 1.0,
        bridgeable: false,
        reason: 'boundary',
        overallDistance: 1.0,
        dominantType: 'ONTOLOGICAL',
        boundary: { category: 'categorical', impossible: true, explanation: 'test' }
      };

      const recalled = recallWisdom(memory, gap);
      expect(recalled).toHaveLength(0);
    });

    it('getReceptivityForGap returns correct dimension', () => {
      const memory = createMarianMemory();
      memory.receptivityDepth.semantic = 0.7;
      memory.receptivityDepth.logical = 0.6;

      expect(getReceptivityForGap(memory, 'SEMANTIC')).toBe(0.7);
      expect(getReceptivityForGap(memory, 'LOGICAL')).toBe(0.6);
      expect(getReceptivityForGap(memory, 'ONTOLOGICAL')).toBe(0.5); // Default
    });
  });

  describe('Theological Edge Cases', () => {
    it('wisdom from failure teaches humility (receptivity still grows)', () => {
      const memory = createMarianMemory();

      const gap: GapResult = {
        type: 'LOGICAL',
        distance: 0.95,
        bridgeable: false,
        reason: 'self-contradiction',
        overallDistance: 0.95,
        dominantType: 'LOGICAL',
        inference: {
          category: 'invalid',
          fallacies: [{ type: 'self_contradiction', description: 'A and not-A' }],
          premises: [],
          conclusion: ''
        }
      };

      const result: ChristologicalResult = {
        gap,
        decision: 'BLOCK',
        confidence: 0.05,
        sacraments: [],
        redemptionAttempted: true,
        finalState: 'blocked'
      };

      const before = memory.receptivityDepth.logical;
      const updated = ponder(memory, result, gap, MediationMode.REDEMPTIVE_TRANSFORMATION);

      // Even failure grows receptivity (humility growth: +0.02)
      expect(updated.receptivityDepth.logical).toBeGreaterThan(before);
      expect(updated.pondered[0].wisdom).toContain('persists');
    });

    it('ontological boundaries cultivate highest wisdom (recognizing limits)', () => {
      let memory = createMarianMemory();

      const gap: GapResult = {
        type: 'ONTOLOGICAL',
        distance: 1.0,
        bridgeable: false,
        reason: 'Phenomenological consciousness in computational system',
        overallDistance: 1.0,
        dominantType: 'ONTOLOGICAL',
        boundary: {
          category: 'phenomenological',
          impossible: true,
          explanation: 'Category error'
        }
      };

      const result: ChristologicalResult = {
        gap,
        decision: 'BLOCK',
        confidence: 0.0,
        sacraments: [],
        redemptionAttempted: false,
        finalState: 'blocked'
      };

      const before = memory.receptivityDepth.ontological;
      memory = ponder(memory, result, gap, MediationMode.ONTOLOGICAL_BLOCK);

      // Ontological growth is highest: +0.1 (recognizing what cannot be done)
      expect(memory.receptivityDepth.ontological).toBe(before + 0.1);
      expect(memory.pondered[0].wisdom).toContain('cannot be mediated');
      expect(memory.pondered[0].wisdom).toContain('Humility required');
    });

    it('integrated experiences maintain theological significance', () => {
      let memory = createMarianMemory();

      const gap: GapResult = {
        type: 'SEMANTIC',
        distance: 0.3,
        bridgeable: true,
        reason: 'mystery language',
        overallDistance: 0.3,
        dominantType: 'SEMANTIC',
        conceptual: {
          drift: ['mystery_language'],
          transformations: [{ type: 'theological_mystery', from: 'a', to: 'b' }],
          recoverable: true
        }
      };

      const result: ChristologicalResult = {
        gap,
        decision: 'ALLOW',
        confidence: 0.85,
        sacraments: [],
        redemptionAttempted: true,
        finalState: 'redeemed'
      };

      // Ponder 4 times to trigger consolidation
      for (let i = 0; i < 4; i++) {
        memory = ponder(memory, result, gap, MediationMode.KENOTIC_MEDIATION);
      }

      // Consolidated wisdom should preserve the mediation mode
      expect(memory.pondered[0].mediationMode).toBe(MediationMode.KENOTIC_MEDIATION);
      expect(memory.pondered[0].wisdom).toContain('consistently mediable');
    });
  });
});
