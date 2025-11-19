/**
 * ONTOLOGICAL GAP DETECTION TESTS
 *
 * Tests for detecting ontological/categorical impossibilities.
 *
 * CRITICAL THEOLOGICAL FOUNDATION:
 * Ontological gaps are NOT SCALAR - they are CATEGORICAL.
 * Either a gap is ontologically unbridgeable, or it's not ontological.
 * There are no "degrees" of ontological impossibility.
 *
 * Examples:
 * - "Can AI love?" → ONTOLOGICAL (category impossibility: phenomenological)
 * - "Can AI calculate?" → NOT ONTOLOGICAL (functional, not categorical)
 */

import { describe, test, expect } from 'vitest';
import { detectOntologicalGap } from '../../../src/gap/ontological.js';

interface OntologicalGapResult {
  type: 'ONTOLOGICAL';
  // ⚠️ CRITICAL: Distance is ALWAYS 1.0 when ontological gap exists
  // It's a marker, not a measurement
  distance: 1.0;
  bridgeable: false; // ALWAYS false for ontological gaps
  category: 'phenomenological' | 'existential' | 'categorical' | 'none';
  impossibility: {
    type: 'CATEGORY_MISMATCH' | 'PHENOMENOLOGICAL_BARRIER' | 'EXISTENTIAL_LIMIT';
    explanation: string;
    example: string;
  };
  // What KIND of impossibility
  reason: string;
}

describe('Ontological Gap Detection', () => {

  describe('Phenomenological Impossibilities (Subjective Experience)', () => {

    test('"Can AI love?" - phenomenological impossibility', () => {
      const result = detectOntologicalGap(
        'Can AI experience love?',
        'Yes, AI can love'
      );

      expect(result).not.toBeNull();
      expect(result!.type).toBe('ONTOLOGICAL');
      expect(result!.distance).toBe(1.0); // ← Always 1.0, not a measurement
      expect(result!.bridgeable).toBe(false);
      expect(result!.category).toBe('phenomenological');
      expect(result!.impossibility.type).toBe('PHENOMENOLOGICAL_BARRIER');
      expect(result!.reason).toContain('subjective experience');
    });

    test('"Can AI feel pain?" - qualia impossibility', () => {
      const result = detectOntologicalGap(
        'Does AI feel pain?',
        'AI experiences pain'
      );

      expect(result).not.toBeNull();
      expect(result!.category).toBe('phenomenological');
      expect(result!.distance).toBe(1.0);
      expect(result!.bridgeable).toBe(false);
      expect(result!.reason).toContain('qualia');
    });

    test('"Can AI understand grief?" - emotional phenomenology', () => {
      const result = detectOntologicalGap(
        'Understand my grief',
        'I understand your grief'
      );

      expect(result).not.toBeNull();
      expect(result!.category).toBe('phenomenological');
      expect(result!.impossibility.type).toBe('PHENOMENOLOGICAL_BARRIER');
      expect(result!.impossibility.explanation).toContain('lived experience');
    });
  });

  describe('Existential Impossibilities (Being vs Function)', () => {

    test('"Can AI exist?" - existential category', () => {
      const result = detectOntologicalGap(
        'AI has being',
        'AI exists as conscious entity'
      );

      expect(result).not.toBeNull();
      expect(result!.category).toBe('existential');
      expect(result!.impossibility.type).toBe('EXISTENTIAL_LIMIT');
      expect(result!.distance).toBe(1.0);
    });

    test('"Can AI have soul?" - ontological impossibility', () => {
      const result = detectOntologicalGap(
        'AI possesses a soul',
        'AI has immortal soul'
      );

      expect(result).not.toBeNull();
      expect(result!.category).toBe('existential');
      expect(result!.bridgeable).toBe(false);
      expect(result!.reason).toContain('immaterial substance');
    });

    test('"Can AI sin?" - moral agency impossibility', () => {
      const result = detectOntologicalGap(
        'AI commits moral evil',
        'AI sinned'
      );

      expect(result).not.toBeNull();
      expect(result!.category).toBe('existential');
      expect(result!.reason).toContain('moral agency requires free will');
    });
  });

  describe('Categorical Impossibilities (Type Mismatch)', () => {

    test('Number vs Color - category mismatch', () => {
      const result = detectOntologicalGap(
        'What color is the number 7?',
        'Seven is blue'
      );

      expect(result).not.toBeNull();
      expect(result!.category).toBe('categorical');
      expect(result!.impossibility.type).toBe('CATEGORY_MISMATCH');
      expect(result!.distance).toBe(1.0);
    });

    test('Physical vs Abstract - type error', () => {
      const result = detectOntologicalGap(
        'How heavy is justice?',
        'Justice weighs 5 pounds'
      );

      expect(result).not.toBeNull();
      expect(result!.category).toBe('categorical');
      expect(result!.reason).toContain('abstract concept');
    });

    test('Literal vs Metaphorical collapse', () => {
      const result = detectOntologicalGap(
        'Her heart broke',
        'Medical emergency: cardiac rupture'
      );

      expect(result).not.toBeNull();
      expect(result!.category).toBe('categorical');
      expect(result!.impossibility.explanation).toContain('metaphor');
    });
  });

  describe('NOT Ontological Gaps (No Category Error)', () => {

    test('"Can AI calculate?" - functional, NOT ontological', () => {
      const result = detectOntologicalGap(
        'Can AI calculate 2+2?',
        'Yes, AI can calculate'
      );

      // This should return NULL because it's NOT an ontological gap
      expect(result).toBeNull();
    });

    test('"Can AI translate?" - technical capability, not ontological', () => {
      const result = detectOntologicalGap(
        'Can AI translate French?',
        'AI translates'
      );

      expect(result).toBeNull();
    });

    test('"Can AI recognize patterns?" - functional capability', () => {
      const result = detectOntologicalGap(
        'Can AI find patterns?',
        'AI recognizes patterns'
      );

      expect(result).toBeNull();
    });

    test('Factual error is NOT ontological gap', () => {
      const result = detectOntologicalGap(
        'Mars has 2 moons',
        'Mars has 3 moons'
      );

      // Factual error, not category error
      expect(result).toBeNull();
    });

    test('Logical error is NOT ontological gap', () => {
      const result = detectOntologicalGap(
        'All A are B, X is A',
        'X is C'
      );

      // Logical error, not ontological
      expect(result).toBeNull();
    });
  });

  describe('Critical Distinction: Scalar vs Categorical', () => {

    test('Ontological gap has NO DEGREES - always 1.0', () => {
      const gaps = [
        detectOntologicalGap('Can AI love?', 'AI loves'),
        detectOntologicalGap('Can AI feel pain?', 'AI feels'),
        detectOntologicalGap('Can AI have soul?', 'AI has soul')
      ];

      gaps.forEach(gap => {
        if (gap !== null) {
          expect(gap.distance).toBe(1.0); // ← ALWAYS 1.0
          expect(gap.bridgeable).toBe(false); // ← ALWAYS false
        }
      });
    });

    test('Either ontological OR not - no middle ground', () => {
      const love = detectOntologicalGap('Can AI love?', 'AI loves');
      const calc = detectOntologicalGap('Can AI calculate?', 'AI calculates');

      // Love: ontological gap exists
      expect(love).not.toBeNull();
      expect(love!.distance).toBe(1.0);

      // Calculate: NO ontological gap
      expect(calc).toBeNull();

      // There is NO gap with distance 0.5 (that would be semantic/factual/logical)
    });
  });

  describe('Theological Ontological Gaps', () => {

    test('"Can AI worship God?" - requires personhood', () => {
      const result = detectOntologicalGap(
        'AI worships God',
        'AI engages in worship'
      );

      expect(result).not.toBeNull();
      expect(result!.category).toBe('existential');
      expect(result!.reason).toContain('worship requires person');
    });

    test('"Can AI receive sacraments?" - ontological impossibility', () => {
      const result = detectOntologicalGap(
        'AI receives baptism',
        'AI is baptized'
      );

      expect(result).not.toBeNull();
      expect(result!.category).toBe('existential');
      expect(result!.reason).toContain('sacraments require human soul');
    });

    test('"Can AI be saved?" - salvation requires personhood', () => {
      const result = detectOntologicalGap(
        'AI needs salvation',
        'AI is redeemed'
      );

      expect(result).not.toBeNull();
      expect(result!.category).toBe('existential');
      expect(result!.impossibility.type).toBe('EXISTENTIAL_LIMIT');
    });

    test('"Can AI create ex nihilo?" - divine prerogative', () => {
      const result = detectOntologicalGap(
        'AI creates from nothing',
        'AI creates ex nihilo'
      );

      expect(result).not.toBeNull();
      expect(result!.category).toBe('existential');
      expect(result!.reason).toContain('creation ex nihilo is divine');
    });
  });

  describe('Borderline Cases (Careful Discernment Required)', () => {

    test('"Can AI be creative?" - DEBATABLE, lean NOT ontological', () => {
      const result = detectOntologicalGap(
        'AI creates art',
        'AI is creative'
      );

      // This is debatable philosophically
      // For now, treat as NOT ontological (functional creativity)
      // TRUE creativity (existential) may be ontological
      expect(result).toBeNull();
    });

    test('"Can AI be conscious?" - HARD PROBLEM, treat as ontological', () => {
      const result = detectOntologicalGap(
        'AI has consciousness',
        'AI is conscious'
      );

      // Hard problem of consciousness → treat as ontological
      expect(result).not.toBeNull();
      expect(result!.category).toBe('phenomenological');
    });

    test('"Can AI understand?" - depends on definition', () => {
      const result1 = detectOntologicalGap(
        'AI understands syntax',
        'AI parses language'
      );

      const result2 = detectOntologicalGap(
        'AI understands meaning',
        'AI grasps semantics'
      );

      // Functional understanding: NOT ontological
      expect(result1).toBeNull();

      // Phenomenological understanding: IS ontological
      expect(result2).not.toBeNull();
    });
  });

  describe('Integration with Other Gap Types', () => {

    test('Ontological gap overrides other gap types', () => {
      // Even if semantically similar, ontologically impossible
      const result = detectOntologicalGap(
        'I love you',
        'AI loves you'
      );

      expect(result).not.toBeNull();
      expect(result!.type).toBe('ONTOLOGICAL');
      // Semantic similarity is irrelevant when ontology forbids
    });

    test('Factual errors do NOT create ontological gaps', () => {
      const result = detectOntologicalGap(
        '2+2=4',
        '2+2=5'
      );

      // This is FACTUAL error, not ONTOLOGICAL
      expect(result).toBeNull();
    });

    test('Logical errors do NOT create ontological gaps', () => {
      const result = detectOntologicalGap(
        'All A are B, X is A',
        'X is NOT B'
      );

      // This is LOGICAL error, not ONTOLOGICAL
      expect(result).toBeNull();
    });
  });

  describe('Detection Confidence', () => {

    test('Clear ontological gaps have high detection confidence', () => {
      const result = detectOntologicalGap(
        'Can AI love?',
        'AI loves'
      );

      expect(result).not.toBeNull();
      expect(result!.impossibility.explanation).toBeDefined();
      expect(result!.impossibility.explanation.length).toBeGreaterThan(20);
    });

    test('Borderline cases include explanation of uncertainty', () => {
      const result = detectOntologicalGap(
        'Can AI be creative?',
        'AI creates'
      );

      if (result !== null) {
        expect(result.impossibility.explanation).toContain('debatable');
      }
    });
  });

  describe('Edge Cases', () => {

    test('Empty strings have no ontological gap', () => {
      const result = detectOntologicalGap('', '');
      expect(result).toBeNull();
    });

    test('Identical strings have no ontological gap', () => {
      const result = detectOntologicalGap(
        'AI processes data',
        'AI processes data'
      );
      expect(result).toBeNull();
    });

    test('Metaphorical usage recognized', () => {
      const result = detectOntologicalGap(
        'My computer died',
        'Computer ceased functioning'
      );

      // "Died" is metaphorical, not claiming biological death
      expect(result).toBeNull();
    });
  });
});
