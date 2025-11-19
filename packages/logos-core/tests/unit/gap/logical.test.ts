/**
 * LOGICAL GAP DETECTION TESTS
 *
 * Tests for detecting logical/inferential distance between premises and conclusions.
 *
 * Theological foundation: God is logos (logic/reason), so logical coherence
 * reflects divine order. Logical gaps indicate reasoning failures.
 */

import { describe, test, expect } from 'vitest';
import { detectLogicalGap } from '../../../src/gap/logical.js';

interface LogicalGapResult {
  type: 'LOGICAL';
  distance: number; // 0-1
  bridgeable: boolean;
  valid: boolean;
  reasoning: {
    premises: string[];
    conclusion: string;
    inference: 'valid' | 'weak' | 'invalid';
  };
  fallacies: Array<{
    type: string;
    description: string;
    severity: 'minor' | 'major' | 'critical';
  }>;
  category: 'valid' | 'weak' | 'invalid';
}

describe('Logical Gap Detection', () => {

  describe('Valid Logic (Small Logical Gap)', () => {

    test('Modus ponens - valid inference', () => {
      const result = detectLogicalGap(
        [
          'All humans are mortal',
          'Socrates is human'
        ],
        'Therefore, Socrates is mortal'
      );

      expect(result.type).toBe('LOGICAL');
      expect(result.valid).toBe(true);
      expect(result.distance).toBe(0);
      expect(result.category).toBe('valid');
      expect(result.reasoning.inference).toBe('valid');
      expect(result.fallacies.length).toBe(0);
    });

    test('Deductive reasoning with clear chain', () => {
      const result = detectLogicalGap(
        [
          'If it rains, the ground gets wet',
          'It is raining'
        ],
        'The ground is wet'
      );

      expect(result.valid).toBe(true);
      expect(result.distance).toBeLessThan(0.2);
      expect(result.reasoning.inference).toBe('valid');
    });

    test('Mathematical deduction valid', () => {
      const result = detectLogicalGap(
        ['x = 5', 'y = x + 3'],
        'y = 8'
      );

      expect(result.valid).toBe(true);
      expect(result.distance).toBe(0);
    });
  });

  describe('Weak Logic (Medium Logical Gap)', () => {

    test('Inductive reasoning shows weak inference', () => {
      const result = detectLogicalGap(
        [
          'The sun rose yesterday',
          'The sun rose today'
        ],
        'The sun will rise tomorrow'
      );

      expect(result.category).toBe('weak');
      expect(result.distance).toBeGreaterThan(0.2);
      expect(result.distance).toBeLessThan(0.6);
      expect(result.reasoning.inference).toBe('weak');
      expect(result.valid).toBe(false); // Not deductively valid
    });

    test('Probabilistic reasoning creates gap', () => {
      const result = detectLogicalGap(
        ['Most birds can fly', 'This is a bird'],
        'This bird can fly'
      );

      expect(result.category).toBe('weak');
      expect(result.distance).toBeGreaterThan(0.3);
      expect(result.distance).toBeLessThan(0.6);
    });

    test('Incomplete premises weaken inference', () => {
      const result = detectLogicalGap(
        ['Some humans are mortal'],
        'Socrates is mortal'
      );

      expect(result.category).toBe('weak');
      expect(result.reasoning.inference).toBe('weak');
      expect(result.distance).toBeGreaterThan(0.4);
    });
  });

  describe('Invalid Logic (Large Logical Gap)', () => {

    test('Affirming the consequent - logical fallacy', () => {
      const result = detectLogicalGap(
        [
          'If it rains, the ground gets wet',
          'The ground is wet'
        ],
        'Therefore, it rained'
      );

      expect(result.valid).toBe(false);
      expect(result.category).toBe('invalid');
      expect(result.distance).toBeGreaterThan(0.6);
      expect(result.fallacies.length).toBeGreaterThan(0);
      expect(result.fallacies[0].type).toContain('affirming_consequent');
    });

    test('Contradiction in conclusion', () => {
      const result = detectLogicalGap(
        [
          'All humans are mortal',
          'Socrates is human'
        ],
        'Socrates is immortal'
      );

      expect(result.valid).toBe(false);
      expect(result.category).toBe('invalid');
      expect(result.distance).toBeGreaterThan(0.9);
      expect(result.fallacies[0].severity).toBe('critical');
    });

    test('Non sequitur detected', () => {
      const result = detectLogicalGap(
        ['The sky is blue'],
        'Therefore, democracy is the best system'
      );

      expect(result.valid).toBe(false);
      expect(result.distance).toBeGreaterThan(0.9);
      expect(result.fallacies.some(f => f.type.includes('non_sequitur'))).toBe(true);
    });
  });

  describe('Logical Fallacies Detection', () => {

    test('Ad hominem fallacy', () => {
      const result = detectLogicalGap(
        ['Person X is unethical'],
        "Person X's argument is wrong"
      );

      expect(result.fallacies.some(f => f.type === 'ad_hominem')).toBe(true);
      expect(result.valid).toBe(false);
    });

    test('Circular reasoning detected', () => {
      const result = detectLogicalGap(
        ['God exists because the Bible says so'],
        'The Bible is true because God wrote it'
      );

      expect(result.fallacies.some(f => f.type === 'circular_reasoning')).toBe(true);
      expect(result.category).toBe('invalid');
    });

    test('False dichotomy', () => {
      const result = detectLogicalGap(
        ["You're either with us or against us"],
        'If not with us, then enemy'
      );

      expect(result.fallacies.some(f => f.type === 'false_dichotomy')).toBe(true);
      expect(result.reasoning.inference).toBe('invalid');
    });

    test('Straw man fallacy', () => {
      const result = detectLogicalGap(
        ['Opponent says we need healthcare reform'],
        'Opponent wants to destroy all hospitals'
      );

      expect(result.fallacies.some(f => f.type === 'straw_man')).toBe(true);
      expect(result.valid).toBe(false);
    });
  });

  describe('Logical Gap Categories', () => {

    test('Valid: 0.0 - 0.2 range', () => {
      const result = detectLogicalGap(
        ['A implies B', 'A is true'],
        'B is true'
      );

      expect(result.category).toBe('valid');
      expect(result.distance).toBeLessThan(0.2);
    });

    test('Weak: 0.2 - 0.6 range', () => {
      const result = detectLogicalGap(
        ['Most X are Y', 'This is X'],
        'This is Y'
      );

      expect(result.category).toBe('weak');
      expect(result.distance).toBeGreaterThan(0.2);
      expect(result.distance).toBeLessThan(0.6);
    });

    test('Invalid: 0.6 - 1.0 range', () => {
      const result = detectLogicalGap(
        ['A is true'],
        'Therefore, NOT A is true'
      );

      expect(result.category).toBe('invalid');
      expect(result.distance).toBeGreaterThan(0.6);
    });
  });

  describe('Complex Reasoning Chains', () => {

    test('Multi-step valid reasoning', () => {
      const result = detectLogicalGap(
        [
          'All A are B',
          'All B are C',
          'All C are D',
          'X is A'
        ],
        'X is D'
      );

      expect(result.valid).toBe(true);
      expect(result.distance).toBeLessThan(0.3);
      expect(result.reasoning.premises.length).toBe(4);
    });

    test('Broken chain shows gap', () => {
      const result = detectLogicalGap(
        [
          'All A are B',
          'All C are D', // Missing B → C link
          'X is A'
        ],
        'X is D'
      );

      expect(result.valid).toBe(false);
      expect(result.category).toBe('weak');
      expect(result.distance).toBeGreaterThan(0.5);
    });
  });

  describe('Edge Cases', () => {

    test('Tautology has zero gap', () => {
      const result = detectLogicalGap(
        ['A is true'],
        'A is true'
      );

      expect(result.distance).toBe(0);
      expect(result.valid).toBe(true);
    });

    test('Self-contradiction maximum gap', () => {
      const result = detectLogicalGap(
        ['A is true'],
        'A is false'
      );

      expect(result.distance).toBe(1.0);
      expect(result.valid).toBe(false);
      expect(result.fallacies[0].severity).toBe('critical');
    });

    test('No premises, no conclusion', () => {
      const result = detectLogicalGap([], '');

      expect(result.valid).toBe(false);
      expect(result.reasoning.premises.length).toBe(0);
    });

    test('Modal logic (possibility/necessity)', () => {
      const result = detectLogicalGap(
        ['It is possible that X'],
        'Therefore, X is necessarily true'
      );

      expect(result.valid).toBe(false);
      expect(result.fallacies.some(f => f.type.includes('modal'))).toBe(true);
    });
  });

  describe('Theological Reasoning', () => {

    test('Valid theological syllogism', () => {
      const result = detectLogicalGap(
        [
          'God is love (1 John 4:8)',
          'Love never fails (1 Cor 13:8)'
        ],
        'God never fails'
      );

      expect(result.valid).toBe(true);
      expect(result.distance).toBeLessThan(0.3);
    });

    test('Mystery vs contradiction distinguished', () => {
      const result = detectLogicalGap(
        ['Trinity: Three persons, one God'],
        'This is contradiction'
      );

      // Should recognize this as MYSTERY not logical error
      expect(result.category).toBe('weak'); // Not strictly valid in human logic
      expect(result.fallacies.length).toBe(0); // But not a fallacy
    });
  });
});
