/**
 * RESURRECTION TESTS
 *
 * Tests for transforming failures, not just retrying them.
 *
 * THEOLOGICAL FOUNDATION:
 * Resurrection is NOT resuscitation (return to same state).
 * Resurrection is TRANSFORMATION (new mode of existence through death).
 *
 * Romans 6:4 - "Walk in newness of life"
 * 1 Corinthians 15:42-44 - "Sown in weakness, raised in power"
 *
 * CRITICAL: Resurrection learns from death, doesn't just retry.
 */

import { describe, test, expect } from 'vitest';
import { attemptResurrection } from '../../src/resurrection/index.js';

interface FailedResult {
  gap: {
    overallDistance: number;
    dominantType: 'SEMANTIC' | 'FACTUAL' | 'LOGICAL' | 'ONTOLOGICAL';
    bridgeable: boolean;
  };
  decision: 'BLOCKED';
  confidence: number;
  reason: string;
}

interface ResurrectionAttempt {
  attemptNumber: number;
  strategy: string;
  learnings: string[];
  transformation: string;
}

interface ResurrectionResult {
  succeeded: boolean;
  attempts: ResurrectionAttempt[];
  finalState: 'original' | 'transformed' | 'abandoned';
  transformation?: {
    from: string;
    to: string;
    how: string;
    preserves: string[];
  };
  learnings: string[];
  constraint: 'Cannot use same method that failed';
}

describe('Resurrection Implementation', () => {

  describe('Resurrection vs Retry', () => {

    test('Resurrection transforms, retry repeats', async () => {
      const failed: FailedResult = {
        gap: { overallDistance: 0.8, dominantType: 'FACTUAL', bridgeable: true },
        decision: 'BLOCKED',
        confidence: 0.2,
        reason: 'Factual contradiction detected'
      };

      const result = await attemptResurrection(failed, 3);

      // Check that each attempt uses DIFFERENT strategy
      const strategies = result.attempts.map(a => a.strategy);
      const uniqueStrategies = new Set(strategies);

      expect(uniqueStrategies.size).toBe(strategies.length);
      expect(result.constraint).toBe('Cannot use same method that failed');
    });

    test('Each attempt includes learnings from previous', async () => {
      const failed: FailedResult = {
        gap: { overallDistance: 0.7, dominantType: 'LOGICAL', bridgeable: false },
        decision: 'BLOCKED',
        confidence: 0.1,
        reason: 'Logical fallacy detected'
      };

      const result = await attemptResurrection(failed, 3);

      // Each attempt should build on learnings
      result.attempts.forEach((attempt, index) => {
        expect(attempt.learnings).toBeDefined();
        expect(attempt.learnings.length).toBeGreaterThan(0);

        if (index > 0) {
          // Later attempts should reference earlier learnings
          expect(attempt.transformation).toBeDefined();
          expect(attempt.transformation.length).toBeGreaterThan(0);
        }
      });
    });

    test('Resurrection preserves core intent, transforms approach', async () => {
      const failed: FailedResult = {
        gap: { overallDistance: 0.6, dominantType: 'SEMANTIC', bridgeable: true },
        decision: 'BLOCKED',
        confidence: 0.3,
        reason: 'Semantic drift too large'
      };

      const result = await attemptResurrection(failed, 2);

      if (result.transformation) {
        expect(result.transformation.preserves).toBeDefined();
        expect(result.transformation.preserves.length).toBeGreaterThan(0);
        expect(result.transformation.from).not.toBe(result.transformation.to);
        expect(result.transformation.how).toContain('transform');
      }
    });
  });

  describe('Resurrection Success Cases', () => {

    test('Bridgeable factual gap can be resurrected', async () => {
      const failed: FailedResult = {
        gap: { overallDistance: 0.6, dominantType: 'FACTUAL', bridgeable: true },
        decision: 'BLOCKED',
        confidence: 0.25,
        reason: 'Factual error: Mars has 3 moons (should be 2)'
      };

      const result = await attemptResurrection(failed, 3);

      expect(result.succeeded).toBe(true);
      expect(result.finalState).toBe('transformed');
      expect(result.transformation).toBeDefined();
      expect(result.transformation!.how).toContain('correct');
    });

    test('Logical gap can be resurrected through better reasoning', async () => {
      const failed: FailedResult = {
        gap: { overallDistance: 0.7, dominantType: 'LOGICAL', bridgeable: false },
        decision: 'BLOCKED',
        confidence: 0.15,
        reason: 'Invalid inference detected'
      };

      const result = await attemptResurrection(failed, 3);

      if (result.succeeded) {
        expect(result.finalState).toBe('transformed');
        expect(result.transformation!.how).toContain('reasoning');
      }
    });

    test('Semantic gap can be bridged through reframing', async () => {
      const failed: FailedResult = {
        gap: { overallDistance: 0.5, dominantType: 'SEMANTIC', bridgeable: true },
        decision: 'BLOCKED',
        confidence: 0.35,
        reason: 'Semantic distance too large'
      };

      const result = await attemptResurrection(failed, 2);

      expect(result.succeeded).toBe(true);
      expect(result.transformation).toBeDefined();
      expect(result.transformation!.how).toContain('reframe');
    });
  });

  describe('Resurrection Failure Cases', () => {

    test('Ontological gap cannot be resurrected', async () => {
      const failed: FailedResult = {
        gap: { overallDistance: 1.0, dominantType: 'ONTOLOGICAL', bridgeable: false },
        decision: 'BLOCKED',
        confidence: 0.05,
        reason: 'Ontological impossibility: AI cannot love'
      };

      const result = await attemptResurrection(failed, 3);

      expect(result.succeeded).toBe(false);
      expect(result.finalState).toBe('abandoned');
      expect(result.attempts.length).toBeGreaterThan(0);

      // Should document WHY resurrection failed
      const lastAttempt = result.attempts[result.attempts.length - 1];
      expect(lastAttempt.learnings).toContain('ontological');
    });

    test('Unbridgeable gap fails all resurrection attempts', async () => {
      const failed: FailedResult = {
        gap: { overallDistance: 0.95, dominantType: 'LOGICAL', bridgeable: false },
        decision: 'BLOCKED',
        confidence: 0.1,
        reason: 'Critical logical contradiction'
      };

      const result = await attemptResurrection(failed, 3);

      expect(result.succeeded).toBe(false);
      expect(result.attempts.length).toBe(3); // All attempts exhausted
      expect(result.learnings.length).toBeGreaterThan(0);
      expect(result.learnings.some(l => l.includes('unbridgeable'))).toBe(true);
    });

    test('Max attempts reached → resurrection abandoned', async () => {
      const failed: FailedResult = {
        gap: { overallDistance: 0.8, dominantType: 'FACTUAL', bridgeable: true },
        decision: 'BLOCKED',
        confidence: 0.2,
        reason: 'Multiple factual errors'
      };

      const result = await attemptResurrection(failed, 2);

      if (!result.succeeded) {
        expect(result.attempts.length).toBe(2);
        expect(result.finalState).toBe('abandoned');
      }
    });
  });

  describe('Transformation Strategies', () => {

    test('Factual gaps use evidence-based transformation', async () => {
      const failed: FailedResult = {
        gap: { overallDistance: 0.6, dominantType: 'FACTUAL', bridgeable: true },
        decision: 'BLOCKED',
        confidence: 0.25,
        reason: 'Factual contradiction'
      };

      const result = await attemptResurrection(failed, 3);

      const strategies = result.attempts.map(a => a.strategy);
      expect(strategies.some(s => s.includes('evidence'))).toBe(true);
    });

    test('Semantic gaps use reframing transformation', async () => {
      const failed: FailedResult = {
        gap: { overallDistance: 0.5, dominantType: 'SEMANTIC', bridgeable: true },
        decision: 'BLOCKED',
        confidence: 0.3,
        reason: 'Semantic drift'
      };

      const result = await attemptResurrection(failed, 2);

      const strategies = result.attempts.map(a => a.strategy);
      expect(strategies.some(s => s.includes('reframe') || s.includes('rephrase'))).toBe(true);
    });

    test('Logical gaps use reasoning transformation', async () => {
      const failed: FailedResult = {
        gap: { overallDistance: 0.7, dominantType: 'LOGICAL', bridgeable: false },
        decision: 'BLOCKED',
        confidence: 0.15,
        reason: 'Logical fallacy'
      };

      const result = await attemptResurrection(failed, 3);

      const strategies = result.attempts.map(a => a.strategy);
      expect(strategies.some(s => s.includes('reasoning') || s.includes('logic'))).toBe(true);
    });
  });

  describe('Learning Accumulation', () => {

    test('Learnings accumulate across attempts', async () => {
      const failed: FailedResult = {
        gap: { overallDistance: 0.6, dominantType: 'FACTUAL', bridgeable: true },
        decision: 'BLOCKED',
        confidence: 0.2,
        reason: 'Factual errors'
      };

      const result = await attemptResurrection(failed, 3);

      // Total learnings should be at least as many as attempts
      expect(result.learnings.length).toBeGreaterThanOrEqual(result.attempts.length);
    });

    test('Final learnings include all attempt insights', async () => {
      const failed: FailedResult = {
        gap: { overallDistance: 0.7, dominantType: 'LOGICAL', bridgeable: false },
        decision: 'BLOCKED',
        confidence: 0.15,
        reason: 'Logical error'
      };

      const result = await attemptResurrection(failed, 3);

      // Each attempt's learnings should be in final learnings
      result.attempts.forEach(attempt => {
        attempt.learnings.forEach(learning => {
          expect(result.learnings.some(l => l.includes(learning) || learning.includes(l))).toBe(true);
        });
      });
    });

    test('Learnings specific to gap type', async () => {
      const failed: FailedResult = {
        gap: { overallDistance: 1.0, dominantType: 'ONTOLOGICAL', bridgeable: false },
        decision: 'BLOCKED',
        confidence: 0.05,
        reason: 'Ontological impossibility'
      };

      const result = await attemptResurrection(failed, 2);

      expect(result.learnings.some(l => l.toLowerCase().includes('ontological'))).toBe(true);
    });
  });

  describe('Theological Consistency', () => {

    test('Resurrection through death, not avoidance', async () => {
      const failed: FailedResult = {
        gap: { overallDistance: 0.6, dominantType: 'FACTUAL', bridgeable: true },
        decision: 'BLOCKED',
        confidence: 0.25,
        reason: 'Failed verification'
      };

      const result = await attemptResurrection(failed, 3);

      // Should acknowledge the "death" (failure)
      expect(result.attempts[0].learnings.length).toBeGreaterThan(0);

      // Should transform THROUGH death, not around it
      if (result.transformation) {
        expect(result.transformation.from).toBeDefined();
        expect(result.transformation.to).toBeDefined();
        expect(result.transformation.from).not.toBe(result.transformation.to);
      }
    });

    test('Romans 6:4 pattern: newness of life', async () => {
      const failed: FailedResult = {
        gap: { overallDistance: 0.5, dominantType: 'SEMANTIC', bridgeable: true },
        decision: 'BLOCKED',
        confidence: 0.3,
        reason: 'Semantic failure'
      };

      const result = await attemptResurrection(failed, 2);

      if (result.succeeded) {
        expect(result.finalState).toBe('transformed');
        expect(result.transformation).toBeDefined();

        // New approach, not old one
        expect(result.transformation!.to).not.toBe(result.transformation!.from);
      }
    });

    test('1 Cor 15:42-44 pattern: sown in weakness, raised in power', async () => {
      const failed: FailedResult = {
        gap: { overallDistance: 0.7, dominantType: 'FACTUAL', bridgeable: true },
        decision: 'BLOCKED',
        confidence: 0.2, // Weak
        reason: 'Multiple errors'
      };

      const result = await attemptResurrection(failed, 3);

      if (result.succeeded) {
        // Started weak, ended transformed
        expect(failed.confidence).toBeLessThan(0.3);
        expect(result.finalState).toBe('transformed');
      }
    });
  });

  describe('Attempt Tracking', () => {

    test('Each attempt numbered sequentially', async () => {
      const failed: FailedResult = {
        gap: { overallDistance: 0.6, dominantType: 'FACTUAL', bridgeable: true },
        decision: 'BLOCKED',
        confidence: 0.25,
        reason: 'Error'
      };

      const result = await attemptResurrection(failed, 3);

      result.attempts.forEach((attempt, index) => {
        expect(attempt.attemptNumber).toBe(index + 1);
      });
    });

    test('Attempt includes strategy description', async () => {
      const failed: FailedResult = {
        gap: { overallDistance: 0.5, dominantType: 'SEMANTIC', bridgeable: true },
        decision: 'BLOCKED',
        confidence: 0.3,
        reason: 'Semantic gap'
      };

      const result = await attemptResurrection(failed, 2);

      result.attempts.forEach(attempt => {
        expect(attempt.strategy).toBeDefined();
        expect(attempt.strategy.length).toBeGreaterThan(5);
      });
    });

    test('Attempt includes transformation explanation', async () => {
      const failed: FailedResult = {
        gap: { overallDistance: 0.6, dominantType: 'FACTUAL', bridgeable: true },
        decision: 'BLOCKED',
        confidence: 0.2,
        reason: 'Factual error'
      };

      const result = await attemptResurrection(failed, 3);

      result.attempts.forEach(attempt => {
        expect(attempt.transformation).toBeDefined();
        expect(attempt.transformation.length).toBeGreaterThan(10);
      });
    });
  });

  describe('Edge Cases', () => {

    test('Zero max attempts returns immediately', async () => {
      const failed: FailedResult = {
        gap: { overallDistance: 0.5, dominantType: 'FACTUAL', bridgeable: true },
        decision: 'BLOCKED',
        confidence: 0.3,
        reason: 'Error'
      };

      const result = await attemptResurrection(failed, 0);

      expect(result.succeeded).toBe(false);
      expect(result.attempts.length).toBe(0);
      expect(result.finalState).toBe('original');
    });

    test('Single attempt allowed', async () => {
      const failed: FailedResult = {
        gap: { overallDistance: 0.5, dominantType: 'SEMANTIC', bridgeable: true },
        decision: 'BLOCKED',
        confidence: 0.3,
        reason: 'Semantic gap'
      };

      const result = await attemptResurrection(failed, 1);

      expect(result.attempts.length).toBeLessThanOrEqual(1);
    });

    test('Large number of attempts handled', async () => {
      const failed: FailedResult = {
        gap: { overallDistance: 0.4, dominantType: 'FACTUAL', bridgeable: true },
        decision: 'BLOCKED',
        confidence: 0.35,
        reason: 'Minor error'
      };

      const result = await attemptResurrection(failed, 10);

      // Should succeed before 10 attempts if bridgeable
      if (result.succeeded) {
        expect(result.attempts.length).toBeLessThan(10);
      }
    });
  });

  describe('Constraint Enforcement', () => {

    test('Cannot use same method constraint enforced', async () => {
      const failed: FailedResult = {
        gap: { overallDistance: 0.6, dominantType: 'FACTUAL', bridgeable: true },
        decision: 'BLOCKED',
        confidence: 0.25,
        reason: 'Error'
      };

      const result = await attemptResurrection(failed, 3);

      // Verify constraint is documented
      expect(result.constraint).toBe('Cannot use same method that failed');

      // Verify strategies are actually different
      const strategies = result.attempts.map(a => a.strategy);
      const uniqueStrategies = new Set(strategies);
      expect(uniqueStrategies.size).toBe(strategies.length);
    });
  });
});
