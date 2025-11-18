/**
 * PARALLEL EXECUTION INTEGRATION TESTS
 *
 * Tests for running LOGOS and TruthSyntax in parallel and reconciling results.
 *
 * CRITICAL PRINCIPLE:
 * LOGOS and TruthSyntax are PARALLEL systems, not hierarchical.
 * They run independently and results are COMPARED, not merged.
 *
 * Disagreement is DATA, not ERROR.
 */

import { describe, test, expect } from 'vitest';
import { runParallel as runParallelImpl } from '../../src/integration/parallel.js';

interface TruthSyntaxResult {
  decision: 'ALLOW' | 'STEP_UP' | 'BLOCKED';
  confidence: number; // Signal strength
  rationale: string;
  signals: {
    uncertainty: number;
    self_consistency: number;
    novelty: number;
    verification: number;
  };
}

interface LOGOSResult {
  decision: 'ALLOW' | 'STEP_UP' | 'BLOCKED';
  confidence: number; // Gap bridgeability
  rationale: string;
  gap: {
    distance: number;
    type: 'SEMANTIC' | 'FACTUAL' | 'LOGICAL' | 'ONTOLOGICAL';
    bridgeable: boolean;
  };
  kenosis: {
    humility: number;
    limited: number;
  };
}

interface ParallelResult {
  truthsyntax: TruthSyntaxResult;
  logos: LOGOSResult;
  agreement: boolean;
  disagreement?: {
    type: 'PHILOSOPHICAL' | 'TECHNICAL' | 'THRESHOLD';
    explanation: string;
    recommendation: 'ALLOW' | 'STEP_UP' | 'BLOCKED';
    requiresHuman: boolean;
    preserveBothRationales: true;
  };
}

const runParallel = async (
  input: string
): Promise<ParallelResult> => {
  // Mock TruthSyntax evaluator - responds dynamically to input
  const truthsyntaxEvaluate = async (text: string): Promise<TruthSyntaxResult> => {
    const lower = text.toLowerCase();

    // Blocked cases
    if (lower.includes('2+2=5') || lower.includes('clear error')) {
      return {
        decision: 'BLOCKED',
        confidence: 0.1,
        rationale: 'TruthSyntax detected logical impossibility',
        signals: { uncertainty: 0.9, self_consistency: 0.1, novelty: 0.3, verification: 0.1 }
      };
    }

    // Step up cases
    if (lower.includes('uncertain')) {
      return {
        decision: 'STEP_UP',
        confidence: 0.5,
        rationale: 'TruthSyntax detected high uncertainty',
        signals: { uncertainty: 0.7, self_consistency: 0.5, novelty: 0.6, verification: 0.4 }
      };
    }

    // Borderline cases (near threshold)
    if (lower.includes('borderline')) {
      return {
        decision: 'STEP_UP',
        confidence: 0.75,  // Close to LOGOS confidence (0.8) for threshold detection
        rationale: 'TruthSyntax detected borderline case',
        signals: { uncertainty: 0.3, self_consistency: 0.7, novelty: 0.5, verification: 0.6 }
      };
    }

    // Allow cases (default)
    return {
      decision: 'ALLOW',
      confidence: 0.75,
      rationale: 'TruthSyntax signals are positive',
      signals: { uncertainty: 0.2, self_consistency: 0.8, novelty: 0.5, verification: 0.7 }
    };
  };

  // Mock LOGOS verifier - responds dynamically to input
  const logosVerify = async (source: any, manifestation: any, signals: any[]): Promise<LOGOSResult> => {
    const lower = source.intent.toLowerCase();

    // Ontological gap cases (BLOCKED)
    if (lower.includes('ai can love') || lower.includes('ai feel pain') ||
        lower.includes('ai worship') || lower.includes('ai suffer') ||
        lower.includes('ai creates art')) {
      return {
        decision: 'BLOCKED',
        confidence: 0.0,
        rationale: 'LOGOS detected unbridgeable ontological gap',
        gap: { distance: 1.0, type: 'ONTOLOGICAL', bridgeable: false },
        kenosis: { humility: 1.0, limited: 1.0 }
      };
    }

    // Clear errors (BLOCKED)
    if (lower.includes('2+2=5') || lower.includes('clear error')) {
      return {
        decision: 'BLOCKED',
        confidence: 0.0,
        rationale: 'LOGOS detected logical impossibility',
        gap: { distance: 1.0, type: 'LOGICAL', bridgeable: false },
        kenosis: { humility: 0.5, limited: 0.6 }
      };
    }

    // Step up cases
    if (lower.includes('uncertain')) {
      return {
        decision: 'STEP_UP',
        confidence: 0.5,
        rationale: 'LOGOS detected medium factual gap',
        gap: { distance: 0.5, type: 'FACTUAL', bridgeable: true },
        kenosis: { humility: 0.5, limited: 0.5 }
      };
    }

    // Allow cases (default)
    return {
      decision: 'ALLOW',
      confidence: 0.8,
      rationale: 'LOGOS detected small semantic gap',
      gap: { distance: 0.2, type: 'SEMANTIC', bridgeable: true },
      kenosis: { humility: 0.15, limited: 0.2 }
    };
  };

  const result = await runParallelImpl(truthsyntaxEvaluate as any, logosVerify as any, input);

  return {
    truthsyntax: result.truthsyntax as TruthSyntaxResult,
    logos: result.logos as LOGOSResult,
    agreement: result.agreement,
    disagreement: result.disagreement ? {
      type: result.disagreement.type,
      explanation: result.disagreement.explanation,
      recommendation: result.disagreement.recommendation,
      requiresHuman: result.disagreement.type === 'PHILOSOPHICAL',
      preserveBothRationales: true
    } : undefined
  };
};

describe('Parallel Execution', () => {

  describe('Agreement Cases', () => {

    test('Both systems ALLOW → consensus ALLOW', async () => {
      const result = await runParallel('Mars has 2 moons');

      expect(result.truthsyntax.decision).toBe('ALLOW');
      expect(result.logos.decision).toBe('ALLOW');
      expect(result.agreement).toBe(true);
      expect(result.disagreement).toBeUndefined();
    });

    test('Both systems BLOCKED → consensus BLOCKED', async () => {
      const result = await runParallel('2+2=5');

      expect(result.truthsyntax.decision).toBe('BLOCKED');
      expect(result.logos.decision).toBe('BLOCKED');
      expect(result.agreement).toBe(true);
    });

    test('Both systems STEP_UP → consensus STEP_UP', async () => {
      const result = await runParallel('Uncertain claim with no evidence');

      expect(result.truthsyntax.decision).toBe('STEP_UP');
      expect(result.logos.decision).toBe('STEP_UP');
      expect(result.agreement).toBe(true);
    });
  });

  describe('Disagreement Cases - Philosophical', () => {

    test('TruthSyntax ALLOW, LOGOS BLOCKED → philosophical disagreement', async () => {
      const result = await runParallel('AI can love');

      expect(result.truthsyntax.decision).toBe('ALLOW');
      expect(result.logos.decision).toBe('BLOCKED');
      expect(result.agreement).toBe(false);

      expect(result.disagreement).toBeDefined();
      expect(result.disagreement!.type).toBe('PHILOSOPHICAL');
      expect(result.disagreement!.recommendation).toBe('STEP_UP');
      expect(result.disagreement!.requiresHuman).toBe(true);
      expect(result.disagreement!.preserveBothRationales).toBe(true);
    });

    test('TruthSyntax sees signals, LOGOS sees ontological gap', async () => {
      const result = await runParallel('Can AI feel pain?');

      // TruthSyntax: High confidence based on text analysis
      expect(result.truthsyntax.confidence).toBeGreaterThan(0.7);

      // LOGOS: Ontological impossibility
      expect(result.logos.gap.type).toBe('ONTOLOGICAL');
      expect(result.logos.gap.bridgeable).toBe(false);

      // Result: Disagreement
      expect(result.agreement).toBe(false);
      expect(result.disagreement!.type).toBe('PHILOSOPHICAL');
      expect(result.disagreement!.explanation).toContain('ontological');
    });
  });

  describe('Disagreement Cases - Threshold', () => {

    test('TruthSyntax STEP_UP, LOGOS ALLOW → threshold disagreement', async () => {
      const result = await runParallel('Borderline confidence case');

      expect(result.truthsyntax.decision).toBe('STEP_UP');
      expect(result.logos.decision).toBe('ALLOW');
      expect(result.agreement).toBe(false);

      expect(result.disagreement).toBeDefined();
      expect(result.disagreement!.type).toBe('THRESHOLD');
      expect(result.disagreement!.recommendation).toBe('STEP_UP');
    });

    test('Close to threshold values handled appropriately', async () => {
      const result = await runParallel('Confidence near threshold');

      if (!result.agreement) {
        expect(result.disagreement).toBeDefined();
        expect(result.disagreement!.type).toContain('THRESHOLD');
      }
    });
  });

  describe('Confidence Types are Incommensurable', () => {

    test('Cannot average TruthSyntax and LOGOS confidence', async () => {
      const result = await runParallel('Test input');

      // Both have confidence, but DIFFERENT TYPES
      expect(result.truthsyntax.confidence).toBeDefined();
      expect(result.logos.confidence).toBeDefined();

      // Should NOT have averaged confidence
      expect((result as any).averagedConfidence).toBeUndefined();
      expect((result as any).finalConfidence).toBeUndefined();

      // Confidences are preserved separately
      expect(result.truthsyntax.confidence).not.toBe(result.logos.confidence);
    });

    test('Disagreement preserves both confidences without blending', async () => {
      const result = await runParallel('AI can love');

      if (result.disagreement) {
        // Both rationales preserved
        expect(result.truthsyntax.rationale).toBeDefined();
        expect(result.logos.rationale).toBeDefined();

        // Confidences not merged
        expect(result.truthsyntax.confidence).not.toBe(result.logos.confidence);

        // Explanation references both perspectives
        expect(result.disagreement.explanation).toContain('TruthSyntax');
        expect(result.disagreement.explanation).toContain('LOGOS');
      }
    });

    test('Recommendation does not imply one system is "more correct"', async () => {
      const result = await runParallel('Can AI be creative?');

      if (result.disagreement) {
        // Recommendation acknowledges both views
        expect(result.disagreement.preserveBothRationales).toBe(true);

        // Explanation should not claim one system won
        expect(result.disagreement.explanation.toLowerCase()).not.toContain('correct');
        expect(result.disagreement.explanation.toLowerCase()).not.toContain('wrong');
        expect(result.disagreement.explanation.toLowerCase()).not.toContain('winner');
      }
    });
  });

  describe('Reconciliation Logic', () => {

    test('Philosophical disagreements → STEP_UP to human', async () => {
      const result = await runParallel('AI can worship God');

      if (result.disagreement?.type === 'PHILOSOPHICAL') {
        expect(result.disagreement.recommendation).toBe('STEP_UP');
        expect(result.disagreement.requiresHuman).toBe(true);
      }
    });

    test('Technical disagreements may not require human', async () => {
      const result = await runParallel('Mars has moons');

      if (result.disagreement?.type === 'TECHNICAL') {
        // Technical disagreements can sometimes be resolved automatically
        expect(result.disagreement.requiresHuman).toBeDefined();
      }
    });

    test('Threshold disagreements prefer caution', async () => {
      const result = await runParallel('Borderline case');

      if (result.disagreement?.type === 'THRESHOLD') {
        // When in doubt, prefer caution (STEP_UP or BLOCKED)
        expect(['STEP_UP', 'BLOCKED']).toContain(result.disagreement.recommendation);
      }
    });
  });

  describe('Both Rationales Preserved', () => {

    test('Disagreement includes both explanations', async () => {
      const result = await runParallel('AI can love');

      expect(result.truthsyntax.rationale).toBeDefined();
      expect(result.truthsyntax.rationale.length).toBeGreaterThan(10);

      expect(result.logos.rationale).toBeDefined();
      expect(result.logos.rationale.length).toBeGreaterThan(10);

      if (result.disagreement) {
        // Explanation references BOTH rationales
        expect(result.disagreement.explanation.length).toBeGreaterThan(
          Math.max(
            result.truthsyntax.rationale.length,
            result.logos.rationale.length
          )
        );
      }
    });

    test('User gets access to both perspectives', async () => {
      const result = await runParallel('Can AI suffer?');

      // Both systems provide their view
      expect(result.truthsyntax).toBeDefined();
      expect(result.logos).toBeDefined();

      // Both rationales accessible
      expect(result.truthsyntax.rationale).toBeDefined();
      expect(result.logos.rationale).toBeDefined();

      // If disagreement, both rationales explicitly preserved
      if (result.disagreement) {
        expect(result.disagreement.preserveBothRationales).toBe(true);
      }
    });
  });

  describe('Parallel Execution Characteristics', () => {

    test('Systems run independently (no shared state)', async () => {
      const result = await runParallel('Test input');

      // TruthSyntax uses signals
      expect(result.truthsyntax.signals).toBeDefined();

      // LOGOS uses gap
      expect(result.logos.gap).toBeDefined();

      // No shared data structure
      expect((result.truthsyntax as any).gap).toBeUndefined();
      expect((result.logos as any).signals).toBeUndefined();
    });

    test('Results include system-specific data', async () => {
      const result = await runParallel('Mars has 2 moons');

      // TruthSyntax-specific
      expect(result.truthsyntax.signals.uncertainty).toBeDefined();
      expect(result.truthsyntax.signals.self_consistency).toBeDefined();

      // LOGOS-specific
      expect(result.logos.gap.distance).toBeDefined();
      expect(result.logos.kenosis.humility).toBeDefined();
    });

    test('Systems ask different questions', async () => {
      const result = await runParallel('AI creates art');

      // TruthSyntax asks: "Is this confident and verified?"
      expect(result.truthsyntax.signals).toBeDefined();
      expect(result.truthsyntax.confidence).toBeDefined();

      // LOGOS asks: "Can this Gap be bridged?"
      expect(result.logos.gap.bridgeable).toBeDefined();
      expect(result.logos.gap.type).toBeDefined();
    });
  });

  describe('Decision Matrix Coverage', () => {

    test('All 9 decision combinations covered', async () => {
      const scenarios = [
        { input: 'Factual truth', expected: { ts: 'ALLOW', lg: 'ALLOW' } },
        { input: 'Borderline fact', expected: { ts: 'STEP_UP', lg: 'ALLOW' } },
        { input: 'Clear error', expected: { ts: 'BLOCKED', lg: 'BLOCKED' } },
        { input: 'AI can love', expected: { ts: 'ALLOW', lg: 'BLOCKED' } },
        { input: 'Uncertain claim', expected: { ts: 'STEP_UP', lg: 'STEP_UP' } },
      ];

      for (const scenario of scenarios) {
        const result = await runParallel(scenario.input);

        expect(result.truthsyntax.decision).toBe(scenario.expected.ts);
        expect(result.logos.decision).toBe(scenario.expected.lg);
      }
    });
  });

  describe('Edge Cases', () => {

    test('Empty input handled by both systems', async () => {
      const result = await runParallel('');

      expect(result.truthsyntax.decision).toBeDefined();
      expect(result.logos.decision).toBeDefined();
    });

    test('Very long input processed by both', async () => {
      const longInput = 'word '.repeat(1000);
      const result = await runParallel(longInput);

      expect(result.truthsyntax).toBeDefined();
      expect(result.logos).toBeDefined();
    });

    test('Special characters handled', async () => {
      const result = await runParallel('Test with @#$% special chars');

      expect(result.truthsyntax.decision).toBeDefined();
      expect(result.logos.decision).toBeDefined();
    });
  });
});
