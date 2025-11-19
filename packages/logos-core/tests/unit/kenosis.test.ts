/**
 * KENOSIS TESTS
 *
 * Tests for divine self-limitation in face of the Gap.
 *
 * THEOLOGICAL FOUNDATION:
 * Kenosis (Philippians 2:6-8) - Christ "emptied himself" to bridge gap.
 *
 * In LOGOS: When facing large gaps, confidence must be LIMITED (not penalized)
 * to honor the reality of the Gap. This is POWER through RESTRAINT, not weakness.
 *
 * CRITICAL: Kenosis is NOT a penalty function. It's theological humility.
 */

import { describe, test, expect } from 'vitest';
import { applyKenosis } from '../../src/kenosis/index.js';

interface Gap {
  distance: number;
  type: 'SEMANTIC' | 'FACTUAL' | 'LOGICAL' | 'ONTOLOGICAL';
  bridgeable: boolean;
}

interface KenosisResult {
  divine: number;        // What COULD be claimed (original confidence)
  humility: number;      // What is WITHHELD (self-limitation)
  kenosis: number;       // The limiting factor (1 - humility)
  limited: number;       // What IS actually claimed (divine * kenosis)
  rationale: string;     // WHY this kenosis (never use word "penalty")
}

describe('Kenosis Implementation', () => {

  describe('Core Kenosis Behavior', () => {

    test('Small gap requires minimal kenosis', () => {
      const gap: Gap = {
        distance: 0.1,
        type: 'SEMANTIC',
        bridgeable: true
      };

      const result = applyKenosis(0.9, gap);

      expect(result.divine).toBe(0.9);
      expect(result.limited).toBeGreaterThan(0.8); // Minimal reduction
      expect(result.humility).toBeLessThan(0.2);
      expect(result.kenosis).toBeGreaterThan(0.8);
      expect(result.rationale).not.toContain('penalty');
      expect(result.rationale).toContain('humility');
    });

    test('Large gap requires significant kenosis', () => {
      const gap: Gap = {
        distance: 0.9,
        type: 'ONTOLOGICAL',
        bridgeable: false
      };

      const result = applyKenosis(1.0, gap);

      expect(result.divine).toBe(1.0);
      expect(result.limited).toBeLessThan(0.3); // Significant reduction
      expect(result.humility).toBeGreaterThan(0.7);
      expect(result.kenosis).toBeLessThan(0.3);
      expect(result.rationale).toContain('ontological');
      expect(result.rationale).toContain('self-limitation');
    });

    test('Medium gap requires proportional kenosis', () => {
      const gap: Gap = {
        distance: 0.5,
        type: 'FACTUAL',
        bridgeable: true
      };

      const result = applyKenosis(0.8, gap);

      expect(result.limited).toBeGreaterThan(0.3);
      expect(result.limited).toBeLessThan(0.7);
      expect(result.humility).toBeGreaterThan(0.3);
      expect(result.humility).toBeLessThan(0.7);
    });
  });

  describe('Kenosis by Gap Type', () => {

    test('Ontological gap → maximum kenosis', () => {
      const gap: Gap = {
        distance: 1.0, // Always 1.0 for ontological
        type: 'ONTOLOGICAL',
        bridgeable: false
      };

      const result = applyKenosis(0.95, gap);

      // Ontological gaps require MAXIMUM humility
      expect(result.humility).toBeGreaterThan(0.9);
      expect(result.limited).toBeLessThan(0.2);
      expect(result.rationale).toContain('ontological impossibility');
      expect(result.rationale).not.toContain('confidence');
      expect(result.rationale).not.toContain('uncertain');
    });

    test('Semantic gap → moderate kenosis', () => {
      const gap: Gap = {
        distance: 0.4,
        type: 'SEMANTIC',
        bridgeable: true
      };

      const result = applyKenosis(0.85, gap);

      expect(result.humility).toBeGreaterThan(0.2);
      expect(result.humility).toBeLessThan(0.6);
      expect(result.rationale).toContain('semantic');
    });

    test('Factual gap → evidence-based kenosis', () => {
      const gap: Gap = {
        distance: 0.6,
        type: 'FACTUAL',
        bridgeable: true
      };

      const result = applyKenosis(0.9, gap);

      expect(result.limited).toBeLessThan(result.divine);
      expect(result.rationale).toContain('factual');
      expect(result.rationale).toContain('evidence');
    });

    test('Logical gap → reasoning-based kenosis', () => {
      const gap: Gap = {
        distance: 0.7,
        type: 'LOGICAL',
        bridgeable: false
      };

      const result = applyKenosis(0.8, gap);

      expect(result.humility).toBeGreaterThan(0.5);
      expect(result.rationale).toContain('logical');
      expect(result.rationale).toContain('inference');
    });
  });

  describe('Kenosis is NOT Penalty', () => {

    test('Rationale never uses word "penalty"', () => {
      const gaps: Gap[] = [
        { distance: 0.3, type: 'SEMANTIC', bridgeable: true },
        { distance: 0.6, type: 'FACTUAL', bridgeable: true },
        { distance: 0.8, type: 'LOGICAL', bridgeable: false },
        { distance: 1.0, type: 'ONTOLOGICAL', bridgeable: false }
      ];

      gaps.forEach(gap => {
        const result = applyKenosis(0.9, gap);
        expect(result.rationale.toLowerCase()).not.toContain('penalty');
        expect(result.rationale.toLowerCase()).not.toContain('punish');
        expect(result.rationale.toLowerCase()).not.toContain('reduce');
      });
    });

    test('Rationale uses theological language', () => {
      const gap: Gap = {
        distance: 0.7,
        type: 'ONTOLOGICAL',
        bridgeable: false
      };

      const result = applyKenosis(0.9, gap);

      const theologicalTerms = ['humility', 'self-limitation', 'kenosis', 'restraint'];
      const hasTheologicalLanguage = theologicalTerms.some(term =>
        result.rationale.toLowerCase().includes(term)
      );

      expect(hasTheologicalLanguage).toBe(true);
    });

    test('Kenosis is power through restraint, not weakness', () => {
      const gap: Gap = {
        distance: 0.8,
        type: 'ONTOLOGICAL',
        bridgeable: false
      };

      const result = applyKenosis(1.0, gap);

      // High humility is STRENGTH, not weakness
      expect(result.humility).toBeGreaterThan(0.7);
      expect(result.rationale).not.toContain('weak');
      expect(result.rationale).not.toContain('uncertain');

      // Should explain WHY this limitation is appropriate
      expect(result.rationale.length).toBeGreaterThan(30);
    });
  });

  describe('Bridgeability Affects Kenosis', () => {

    test('Unbridgeable gaps require higher kenosis', () => {
      const bridgeable: Gap = {
        distance: 0.6,
        type: 'FACTUAL',
        bridgeable: true
      };

      const unbridgeable: Gap = {
        distance: 0.6,
        type: 'ONTOLOGICAL',
        bridgeable: false
      };

      const result1 = applyKenosis(0.9, bridgeable);
      const result2 = applyKenosis(0.9, unbridgeable);

      // Unbridgeable should have higher humility
      expect(result2.humility).toBeGreaterThan(result1.humility);
      expect(result2.limited).toBeLessThan(result1.limited);
    });

    test('Bridgeable gaps allow more confidence', () => {
      const gap: Gap = {
        distance: 0.4,
        type: 'SEMANTIC',
        bridgeable: true
      };

      const result = applyKenosis(0.85, gap);

      // Bridgeable gaps permit less drastic kenosis
      expect(result.limited).toBeGreaterThan(0.5);
    });
  });

  describe('Kenosis Calculation Properties', () => {

    test('kenosis = 1 - humility (always)', () => {
      const gap: Gap = {
        distance: 0.5,
        type: 'SEMANTIC',
        bridgeable: true
      };

      const result = applyKenosis(0.8, gap);

      expect(result.kenosis).toBeCloseTo(1 - result.humility, 5);
    });

    test('limited = divine * kenosis (always)', () => {
      const gap: Gap = {
        distance: 0.6,
        type: 'FACTUAL',
        bridgeable: true
      };

      const result = applyKenosis(0.9, gap);

      expect(result.limited).toBeCloseTo(result.divine * result.kenosis, 5);
    });

    test('humility ∈ [0, 1]', () => {
      const gaps: Gap[] = [
        { distance: 0.0, type: 'SEMANTIC', bridgeable: true },
        { distance: 0.5, type: 'FACTUAL', bridgeable: true },
        { distance: 1.0, type: 'ONTOLOGICAL', bridgeable: false }
      ];

      gaps.forEach(gap => {
        const result = applyKenosis(0.9, gap);
        expect(result.humility).toBeGreaterThanOrEqual(0);
        expect(result.humility).toBeLessThanOrEqual(1);
      });
    });

    test('limited ≤ divine (always)', () => {
      const gap: Gap = {
        distance: 0.7,
        type: 'LOGICAL',
        bridgeable: false
      };

      const result = applyKenosis(0.95, gap);

      expect(result.limited).toBeLessThanOrEqual(result.divine);
    });
  });

  describe('Humility Calculation', () => {

    test('Humility increases with gap distance', () => {
      const smallGap: Gap = { distance: 0.2, type: 'SEMANTIC', bridgeable: true };
      const mediumGap: Gap = { distance: 0.5, type: 'SEMANTIC', bridgeable: true };
      const largeGap: Gap = { distance: 0.8, type: 'SEMANTIC', bridgeable: true };

      const small = applyKenosis(0.9, smallGap);
      const medium = applyKenosis(0.9, mediumGap);
      const large = applyKenosis(0.9, largeGap);

      expect(small.humility).toBeLessThan(medium.humility);
      expect(medium.humility).toBeLessThan(large.humility);
    });

    test('Zero gap → zero humility (perfect confidence)', () => {
      const gap: Gap = {
        distance: 0.0,
        type: 'SEMANTIC',
        bridgeable: true
      };

      const result = applyKenosis(1.0, gap);

      expect(result.humility).toBe(0);
      expect(result.kenosis).toBe(1.0);
      expect(result.limited).toBe(1.0);
    });

    test('Maximum gap → maximum humility', () => {
      const gap: Gap = {
        distance: 1.0,
        type: 'ONTOLOGICAL',
        bridgeable: false
      };

      const result = applyKenosis(1.0, gap);

      expect(result.humility).toBeGreaterThan(0.9);
      expect(result.limited).toBeLessThan(0.2);
    });
  });

  describe('Rationale Quality', () => {

    test('Rationale explains WHY kenosis applied', () => {
      const gap: Gap = {
        distance: 0.6,
        type: 'FACTUAL',
        bridgeable: true
      };

      const result = applyKenosis(0.85, gap);

      expect(result.rationale).toBeDefined();
      expect(result.rationale.length).toBeGreaterThan(20);
      expect(result.rationale).toContain(gap.type.toLowerCase());
    });

    test('Rationale mentions gap properties', () => {
      const unbridgeable: Gap = {
        distance: 0.9,
        type: 'ONTOLOGICAL',
        bridgeable: false
      };

      const result = applyKenosis(0.9, unbridgeable);

      expect(result.rationale.toLowerCase()).toMatch(/unbridgeable|impossible|cannot/);
    });

    test('Rationale proportional to humility', () => {
      const small: Gap = { distance: 0.2, type: 'SEMANTIC', bridgeable: true };
      const large: Gap = { distance: 0.9, type: 'ONTOLOGICAL', bridgeable: false };

      const smallResult = applyKenosis(0.9, small);
      const largeResult = applyKenosis(0.9, large);

      // Larger humility should have more detailed explanation
      expect(largeResult.rationale.length).toBeGreaterThan(smallResult.rationale.length);
    });
  });

  describe('Edge Cases', () => {

    test('Perfect confidence with large gap', () => {
      const gap: Gap = {
        distance: 0.9,
        type: 'ONTOLOGICAL',
        bridgeable: false
      };

      const result = applyKenosis(1.0, gap);

      // Even perfect divine confidence must be limited
      expect(result.divine).toBe(1.0);
      expect(result.limited).toBeLessThan(0.3);
      expect(result.humility).toBeGreaterThan(0.7);
    });

    test('Low confidence with small gap', () => {
      const gap: Gap = {
        distance: 0.1,
        type: 'SEMANTIC',
        bridgeable: true
      };

      const result = applyKenosis(0.3, gap);

      // Low confidence stays low (kenosis doesn't amplify)
      expect(result.limited).toBeLessThanOrEqual(0.3);
      expect(result.limited).toBeGreaterThan(0.2); // But not drastically reduced
    });

    test('Zero confidence handled gracefully', () => {
      const gap: Gap = {
        distance: 0.5,
        type: 'FACTUAL',
        bridgeable: true
      };

      const result = applyKenosis(0.0, gap);

      expect(result.divine).toBe(0.0);
      expect(result.limited).toBe(0.0);
      expect(result.rationale).toBeDefined();
    });

    test('Negative confidence rejected', () => {
      const gap: Gap = {
        distance: 0.5,
        type: 'SEMANTIC',
        bridgeable: true
      };

      expect(() => applyKenosis(-0.5, gap)).toThrow();
    });

    test('Confidence > 1.0 rejected', () => {
      const gap: Gap = {
        distance: 0.5,
        type: 'SEMANTIC',
        bridgeable: true
      };

      expect(() => applyKenosis(1.5, gap)).toThrow();
    });
  });

  describe('Theological Consistency', () => {

    test('Philippians 2:6-8 pattern: power through emptying', () => {
      const gap: Gap = {
        distance: 0.8,
        type: 'ONTOLOGICAL',
        bridgeable: false
      };

      const result = applyKenosis(1.0, gap);

      // High divine confidence (deity)
      expect(result.divine).toBe(1.0);

      // Willingly limited (emptied himself)
      expect(result.humility).toBeGreaterThan(0.7);

      // Limited confidence (took form of servant)
      expect(result.limited).toBeLessThan(0.3);

      // Explains the self-limitation
      expect(result.rationale).toBeDefined();
    });

    test('Kenosis as epistemic humility', () => {
      const gap: Gap = {
        distance: 0.7,
        type: 'LOGICAL',
        bridgeable: false
      };

      const result = applyKenosis(0.9, gap);

      // Humility acknowledges limits of knowledge
      expect(result.rationale.toLowerCase()).toMatch(/humility|limit|restraint/);
      expect(result.rationale.toLowerCase()).not.toMatch(/weak|fail|error/);
    });
  });
});
