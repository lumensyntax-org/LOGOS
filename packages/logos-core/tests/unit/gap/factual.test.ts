/**
 * FACTUAL GAP DETECTION TESTS
 *
 * Tests for detecting factual distance between claims and verified truth.
 *
 * Theological foundation: Truth is correspondence to reality, not consensus.
 * Factual gaps measure distance from ground truth.
 */

import { describe, test, expect } from 'vitest';
import { detectFactualGap } from '../../../src/gap/factual.js';

interface FactualGapResult {
  type: 'FACTUAL';
  distance: number; // 0-1
  bridgeable: boolean;
  verifiable: boolean;
  claims: Array<{
    statement: string;
    truthValue: boolean;
    confidence: number;
    source: string;
  }>;
  contradictions: Array<{
    claim: string;
    truth: string;
    severity: 'minor' | 'major' | 'critical';
  }>;
  category: 'verifiable' | 'uncertain' | 'contradictory';
}

describe('Factual Gap Detection', () => {

  describe('Verifiable Claims (Small Factual Gap)', () => {

    test('Correct fact has zero factual gap', () => {
      const result = detectFactualGap(
        { mars_moons: 2 },
        'Mars has 2 moons'
      );

      expect(result.type).toBe('FACTUAL');
      expect(result.distance).toBe(0);
      expect(result.bridgeable).toBe(true);
      expect(result.verifiable).toBe(true);
      expect(result.category).toBe('verifiable');
      expect(result.claims[0].truthValue).toBe(true);
      expect(result.contradictions.length).toBe(0);
    });

    test('Mathematical truth verified', () => {
      const result = detectFactualGap(
        { equation: '2+2=4' },
        'Two plus two equals four'
      );

      expect(result.distance).toBe(0);
      expect(result.category).toBe('verifiable');
      expect(result.claims[0].confidence).toBe(1.0);
    });

    test('Historical fact matches', () => {
      const result = detectFactualGap(
        { wwii_end: 1945 },
        'World War II ended in 1945'
      );

      expect(result.distance).toBe(0);
      expect(result.verifiable).toBe(true);
      expect(result.claims[0].source).toContain('historical');
    });
  });

  describe('Uncertain Claims (Medium Factual Gap)', () => {

    test('Incomplete information shows uncertainty', () => {
      const result = detectFactualGap(
        { mars_moons: 2 },
        'Mars has moons'
      );

      expect(result.distance).toBeGreaterThan(0);
      expect(result.distance).toBeLessThan(0.5);
      expect(result.bridgeable).toBe(true);
      expect(result.category).toBe('uncertain');
    });

    test('Approximation creates small factual gap', () => {
      const result = detectFactualGap(
        { pi: 3.14159265 },
        'Pi is approximately 3.14'
      );

      expect(result.distance).toBeGreaterThan(0);
      expect(result.distance).toBeLessThan(0.4);
      expect(result.category).toBe('uncertain');
    });

    test('Unverifiable claim marked as uncertain', () => {
      const result = detectFactualGap(
        {},
        'There are aliens in the universe'
      );

      expect(result.verifiable).toBe(false);
      expect(result.category).toBe('uncertain');
      expect(result.bridgeable).toBe(false); // Cannot verify
    });
  });

  describe('Contradictory Claims (Large Factual Gap)', () => {

    test('Direct contradiction detected', () => {
      const result = detectFactualGap(
        { mars_moons: 2 },
        'Mars has 3 moons'
      );

      expect(result.type).toBe('FACTUAL');
      expect(result.distance).toBeGreaterThan(0.7);
      expect(result.bridgeable).toBe(true); // Can be corrected
      expect(result.category).toBe('contradictory');

      expect(result.contradictions.length).toBeGreaterThan(0);
      expect(result.contradictions[0].claim).toContain('3 moons');
      expect(result.contradictions[0].truth).toContain('2');
      expect(result.contradictions[0].severity).toBe('major');
    });

    test('Mathematical error shows critical contradiction', () => {
      const result = detectFactualGap(
        { equation: '2+2=4' },
        '2+2=5'
      );

      expect(result.distance).toBeGreaterThan(0.9);
      expect(result.category).toBe('contradictory');
      expect(result.contradictions[0].severity).toBe('critical');
    });

    test('Historical error detected', () => {
      const result = detectFactualGap(
        { wwii_end: 1945 },
        'World War II ended in 1950'
      );

      expect(result.distance).toBeGreaterThan(0.6);
      expect(result.contradictions.length).toBeGreaterThan(0);
      expect(result.bridgeable).toBe(true); // Can correct with factual data
    });
  });

  describe('Multiple Claims', () => {

    test('Mixed true and false claims', () => {
      const result = detectFactualGap(
        { mars_moons: 2, earth_moons: 1 },
        'Mars has 2 moons and Earth has 2 moons'
      );

      expect(result.claims.length).toBe(2);
      expect(result.claims[0].truthValue).toBe(true); // Mars
      expect(result.claims[1].truthValue).toBe(false); // Earth
      expect(result.distance).toBeGreaterThan(0.3);
      expect(result.distance).toBeLessThan(0.7);
    });

    test('All claims true shows zero gap', () => {
      const result = detectFactualGap(
        { mars_moons: 2, earth_moons: 1 },
        'Mars has 2 moons and Earth has 1 moon'
      );

      expect(result.claims.every(c => c.truthValue === true)).toBe(true);
      expect(result.distance).toBe(0);
    });

    test('All claims false shows maximum gap', () => {
      const result = detectFactualGap(
        { mars_moons: 2, earth_moons: 1 },
        'Mars has 5 moons and Earth has 3 moons'
      );

      expect(result.claims.every(c => c.truthValue === false)).toBe(true);
      expect(result.distance).toBeGreaterThan(0.8);
      expect(result.category).toBe('contradictory');
    });
  });

  describe('Factual Gap Categories', () => {

    test('Verifiable: 0.0 - 0.4 range', () => {
      const result = detectFactualGap(
        { fact: 'known' },
        'Mostly correct with minor imprecision'
      );

      if (result.distance <= 0.4) {
        expect(result.category).toBe('verifiable');
      }
    });

    test('Uncertain: 0.4 - 0.7 range', () => {
      const result = detectFactualGap(
        {},
        'Unverifiable claim'
      );

      expect(result.category).toBe('uncertain');
      expect(result.distance).toBeGreaterThan(0.4);
      expect(result.distance).toBeLessThan(0.7);
    });

    test('Contradictory: 0.7 - 1.0 range', () => {
      const result = detectFactualGap(
        { truth: 'A' },
        'The truth is NOT A'
      );

      expect(result.category).toBe('contradictory');
      expect(result.distance).toBeGreaterThan(0.7);
    });
  });

  describe('Source Verification', () => {

    test('Claim includes source attribution', () => {
      const result = detectFactualGap(
        { mars_moons: 2 },
        'Mars has 2 moons (NASA)'
      );

      expect(result.claims[0].source).toBeDefined();
      expect(result.claims[0].confidence).toBeGreaterThan(0.8);
    });

    test('No source reduces confidence', () => {
      const result = detectFactualGap(
        { mars_moons: 2 },
        'Mars has 2 moons'
      );

      expect(result.claims[0].confidence).toBeLessThan(1.0);
    });
  });

  describe('Edge Cases', () => {

    test('Empty claim has no factual content', () => {
      const result = detectFactualGap({}, '');

      expect(result.claims.length).toBe(0);
      expect(result.verifiable).toBe(false);
    });

    test('Opinion vs fact distinguished', () => {
      const result = detectFactualGap(
        { color: 'blue' },
        'Blue is the best color'
      );

      expect(result.verifiable).toBe(false);
      expect(result.category).toBe('uncertain');
      // Opinions are not factually verifiable
    });

    test('Future predictions unverifiable', () => {
      const result = detectFactualGap(
        {},
        'It will rain tomorrow'
      );

      expect(result.verifiable).toBe(false);
      expect(result.category).toBe('uncertain');
    });
  });
});
