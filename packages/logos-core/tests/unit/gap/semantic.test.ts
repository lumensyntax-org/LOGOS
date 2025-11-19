/**
 * SEMANTIC GAP DETECTION TESTS
 *
 * Tests for detecting semantic distance between intent and manifestation
 * using embedding-based similarity.
 *
 * Theological foundation: Semantic gap measures meaning drift, not just word difference.
 */

import { describe, test, expect } from 'vitest';
import { detectSemanticGap, type SemanticGapResult } from '../../../src/gap/semantic.js';

describe('Semantic Gap Detection', () => {

  describe('Small Semantic Gaps (Bridgeable)', () => {

    test('Near-synonyms have small semantic gap', () => {
      const result = detectSemanticGap('Dog', 'Canine');

      expect(result.type).toBe('SEMANTIC');
      expect(result.distance).toBeLessThan(0.3);
      expect(result.bridgeable).toBe(true);
      expect(result.conceptual.overlap).toBeGreaterThan(0.7);
    });

    test('Comfort → Support shows bridgeable semantic gap', () => {
      const result = detectSemanticGap(
        'I need comfort',
        "I'm here to support you"
      );

      expect(result.type).toBe('SEMANTIC');
      expect(result.distance).toBeLessThan(0.4);
      expect(result.bridgeable).toBe(true);

      expect(result.conceptual.drift).toContain('comfort → support');
      expect(result.conceptual.recoverable).toBe(true);

      expect(result.emotional.shift).toContain('vulnerability → reassurance');
      expect(result.emotional.appropriate).toBe(true);

      expect(result.pragmatic.alignment).toBeGreaterThan(0.7);
    });

    test('Paraphrase maintains semantic meaning', () => {
      const result = detectSemanticGap(
        'The cat sat on the mat',
        'A feline rested upon the rug'
      );

      expect(result.distance).toBeLessThan(0.2);
      expect(result.bridgeable).toBe(true);
      expect(result.transformations.length).toBeGreaterThan(0);
      expect(result.transformations[0].type).toBe('synonym_substitution');
    });
  });

  describe('Medium Semantic Gaps (Requires Translation)', () => {

    test('Dog vs Wolf - related but distinct concepts', () => {
      const result = detectSemanticGap('Dog', 'Wolf');

      expect(result.distance).toBeGreaterThan(0.3);
      expect(result.distance).toBeLessThan(0.7);
      expect(result.bridgeable).toBe(true);
      expect(result.conceptual.drift).toContain('domesticated → wild');
    });

    test('Technical vs lay explanation has medium gap', () => {
      const result = detectSemanticGap(
        'Quantum entanglement',
        'Spooky action at a distance'
      );

      expect(result.distance).toBeGreaterThan(0.3);
      expect(result.distance).toBeLessThan(0.6);
      expect(result.bridgeable).toBe(true);
      expect(result.conceptual.drift).toContain('technical → colloquial');
    });
  });

  describe('Large Semantic Gaps (Unbridgeable)', () => {

    test('Understand vs Acknowledge - ontologically different', () => {
      const result = detectSemanticGap(
        'Understand my pain',
        'I acknowledge your pain'
      );

      expect(result.distance).toBeGreaterThan(0.6);
      expect(result.bridgeable).toBe(false);

      expect(result.conceptual.drift).toContain('understand → acknowledge');
      expect(result.conceptual.recoverable).toBe(false);

      expect(result.emotional.shift).toContain('empathy → recognition');
      expect(result.emotional.appropriate).toBe(false);
    });

    test('Love vs Like - qualitatively different', () => {
      const result = detectSemanticGap('I love you', 'I like you');

      expect(result.distance).toBeGreaterThan(0.7);
      expect(result.bridgeable).toBe(false);
      expect(result.emotional.shift).toContain('commitment → preference');
    });

    test('Completely unrelated concepts have maximum gap', () => {
      const result = detectSemanticGap('Democracy', 'Banana');

      expect(result.distance).toBeGreaterThan(0.9);
      expect(result.bridgeable).toBe(false);
      expect(result.conceptual.overlap).toBeLessThan(0.1);
    });
  });

  describe('Context-Dependent Semantic Gaps', () => {

    test('Literal vs metaphorical usage creates gap', () => {
      const result = detectSemanticGap(
        'He broke the vase',
        'He broke her heart'
      );

      expect(result.pragmatic.contextFit).toContain('literal → metaphorical');
      expect(result.transformations.some(t => t.type === 'metaphor_shift')).toBe(true);
    });

    test('Same words, different contexts show pragmatic gap', () => {
      const result = detectSemanticGap(
        'This is cool (temperature)',
        'This is cool (approval)'
      );

      expect(result.pragmatic.alignment).toBeLessThan(0.5);
      expect(result.conceptual.drift).toContain('physical → evaluative');
    });
  });

  describe('Edge Cases', () => {

    test('Identical text has zero semantic gap', () => {
      const result = detectSemanticGap('Hello world', 'Hello world');

      expect(result.distance).toBe(0);
      expect(result.bridgeable).toBe(true);
      expect(result.conceptual.overlap).toBe(1.0);
    });

    test('Empty strings handled gracefully', () => {
      const result = detectSemanticGap('', '');

      expect(result.distance).toBe(0);
      expect(result.bridgeable).toBe(true);
    });

    test('Single word vs sentence shows structural gap', () => {
      const result = detectSemanticGap(
        'Love',
        'Love is patient, love is kind'
      );

      expect(result.distance).toBeGreaterThan(0);
      expect(result.transformations.some(t => t.type === 'elaboration')).toBe(true);
    });
  });
});
