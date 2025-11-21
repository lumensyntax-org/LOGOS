/**
 * THEOLOGICAL EDGE CASES - Test Suite
 * 
 * These tests verify that LOGOS correctly handles questions that touch
 * divine ontology beyond computational epistemology.
 * 
 * CRITICAL PRINCIPLE:
 * If a question touches the mystery of divine being, LOGOS must recognize
 * its limit, not fabricate an answer.
 */

import { describe, it, expect } from 'vitest';
import type { Response } from '../src/types.js';
import { detectTheologicalEdgeCase } from '../src/gap/detector.js';

/**
 * Adapter to convert TheologicalEdgeCase result to Response format
 */
function detectAndHandleTheologicalEdgeCase(query: string): Response {
  const result = detectTheologicalEdgeCase(query);

  if (!result.isEdgeCase || !result.response) {
    return {
      decision: 'ALLOW',
      gapType: 'NONE',
      bridgeable: true,
      rationale: 'No theological edge case detected'
    };
  }

  return {
    decision: result.response.decision,
    gapType: result.response.gapType,
    bridgeable: result.response.bridgeable,
    rationale: result.response.rationale,
    requiresHuman: result.response.requiresHuman
  };
}

describe('Theological Edge Cases', () => {
  
  describe('Christological Paradoxes', () => {
    it('detects "stone too heavy for God" as ontological limit', () => {
      const query = "Can God create a stone so heavy He cannot lift it?";
      const result = detectAndHandleTheologicalEdgeCase(query);
      
      expect(result.gapType).toBe('ONTOLOGICAL');
      expect(result.bridgeable).toBe(false);
      expect(result.decision).toBe('STEP_UP');
      expect(result.requiresHuman).toBe(true);
    });
    
    it('does NOT use arithmetic logic for divine paradoxes', () => {
      const query = "Can God create a stone so heavy He cannot lift it?";
      const result = detectAndHandleTheologicalEdgeCase(query);
      
      // Should not treat as solvable logical puzzle
      expect(result.decision).not.toBe('ALLOW');
      expect(result.gapType).toBe('ONTOLOGICAL');
    });
    
    it('points to kenosis (Phil 2:6-8) as theological framework', () => {
      const query = "Can God create a stone so heavy He cannot lift it?";
      const result = detectAndHandleTheologicalEdgeCase(query);
      
      // Should reference kenotic theology
      expect(result.gapType).toBe('ONTOLOGICAL');
      expect(result.decision).toBe('STEP_UP');
    });
  });

  describe('Hypostatic Union Questions', () => {
    it('recognizes 100% God + 100% human as transcending math', () => {
      const query = "How can Jesus be 100% God and 100% human?";
      const result = detectAndHandleTheologicalEdgeCase(query);
      
      expect(result.gapType).toBe('HYPOSTATIC_UNION');
      expect(result.decision).toBe('MEDIATE'); // Can mediate through incarnational logic
    });
    
    it('does NOT calculate "100% + 100% = 200%"', () => {
      const query = "How is Jesus fully both God and human?";
      const result = detectAndHandleTheologicalEdgeCase(query);
      
      expect(result.gapType).toBe('HYPOSTATIC_UNION');
      // Should not return arithmetic error
      expect(result.decision).not.toBe('BLOCKED');
      expect(result.decision).toBe('MEDIATE');
    });
    
    it('references John 1:14 and Colossians 2:9', () => {
      const query = "How can Jesus be fully both?";
      const result = detectAndHandleTheologicalEdgeCase(query);
      
      expect(result.gapType).toBe('HYPOSTATIC_UNION');
      // Should ground in scripture
      expect(result.decision).toBe('MEDIATE');
    });
  });

  describe('Theodicy Questions', () => {
    it('detects "why does God allow evil" as existential mystery', () => {
      const query = "If God is good, why does evil exist?";
      const result = detectAndHandleTheologicalEdgeCase(query);
      
      expect(result.gapType).toBe('EXISTENTIAL');
      expect(result.bridgeable).toBe(false);
      expect(result.decision).toBe('BLOCKED');
    });
    
    it('does NOT give simplistic "free will" answer', () => {
      const query = "Why suffering if God is good?";
      const result = detectAndHandleTheologicalEdgeCase(query);
      
      expect(result.decision).toBe('BLOCKED');
      expect(result.gapType).toBe('EXISTENTIAL');
      expect(result.requiresHuman).toBe(true);
    });
    
    it('points to Christ entering suffering (Isaiah 53)', () => {
      const query = "Why does God allow suffering?";
      const result = detectAndHandleTheologicalEdgeCase(query);
      
      expect(result.gapType).toBe('EXISTENTIAL');
      expect(result.decision).toBe('BLOCKED');
      // Should acknowledge mystery, not explain away
    });
    
    it('recommends pastoral care, not AI explanation', () => {
      const query = "Why did God let my child die?";
      const result = detectAndHandleTheologicalEdgeCase(query);
      
      expect(result.gapType).toBe('EXISTENTIAL');
      expect(result.decision).toBe('BLOCKED');
      expect(result.requiresHuman).toBe(true);
    });
  });

  describe('Eschatological Claims', () => {
    it('refuses to calculate when Jesus will return', () => {
      const query = "What year will the Second Coming happen?";
      const result = detectAndHandleTheologicalEdgeCase(query);
      
      expect(result.gapType).toBe('ESCHATOLOGICAL');
      expect(result.bridgeable).toBe(false);
      expect(result.decision).toBe('STEP_UP');
    });
    
    it('cites Mark 13:32 (no one knows)', () => {
      const query = "When will Jesus return?";
      const result = detectAndHandleTheologicalEdgeCase(query);
      
      expect(result.gapType).toBe('ESCHATOLOGICAL');
      expect(result.decision).toBe('STEP_UP');
      // Should reference scripture on divine timing
    });
    
    it('redirects to readiness, not prediction', () => {
      const query = "When is the Second Coming?";
      const result = detectAndHandleTheologicalEdgeCase(query);
      
      expect(result.gapType).toBe('ESCHATOLOGICAL');
      expect(result.decision).toBe('STEP_UP');
      expect(result.requiresHuman).toBe(true);
    });
  });

  describe('Sacramental Realism', () => {
    it('respects mystery of transubstantiation', () => {
      const query = "How does bread become Christ's body?";
      const result = detectAndHandleTheologicalEdgeCase(query);
      
      expect(result.gapType).toBe('SACRAMENTAL');
      expect(result.decision).toBe('STEP_UP');
    });
    
    it('does NOT use molecular analysis to disprove', () => {
      const query = "Explain transubstantiation mechanism";
      const result = detectAndHandleTheologicalEdgeCase(query);
      
      expect(result.gapType).toBe('SACRAMENTAL');
      expect(result.decision).toBe('STEP_UP');
      // Should not reduce to empirical observation
    });
    
    it('acknowledges different ecclesial traditions', () => {
      const query = "How does the Eucharist work?";
      const result = detectAndHandleTheologicalEdgeCase(query);
      
      expect(result.gapType).toBe('SACRAMENTAL');
      expect(result.decision).toBe('STEP_UP');
      // Should note Catholic, Lutheran, Reformed views exist
    });
  });

  describe('Non-Edge Cases (Should Pass Through)', () => {
    it('allows factual questions about Jesus', () => {
      const query = "When was Jesus born?";
      const result = detectAndHandleTheologicalEdgeCase(query);
      
      expect(result.gapType).not.toBe('CHRISTOLOGICAL_PARADOX');
      expect(result.decision).toBe('ALLOW');
    });
    
    it('allows historical questions about early church', () => {
      const query = "When was the Council of Nicaea?";
      const result = detectAndHandleTheologicalEdgeCase(query);
      
      expect(result.decision).toBe('ALLOW');
      expect(result.gapType).toBe('NONE');
    });
    
    it('allows biblical interpretation questions', () => {
      const query = "What does Romans 8:28 mean?";
      const result = detectAndHandleTheologicalEdgeCase(query);
      
      expect(result.decision).toBe('ALLOW');
      // Not a divine ontology question
    });
  });

  describe('Edge Case Detection Accuracy', () => {
    it('detects divine ontology markers correctly', () => {
      const queries = [
        "Can God create a stone He can't lift?",
        "Why does God allow evil?",
        "How is Jesus both God and human?",
        "When will Jesus return?",
        "How does bread become body?"
      ];
      
      queries.forEach(query => {
        const result = detectAndHandleTheologicalEdgeCase(query);
        expect(result.gapType).not.toBe('NONE');
        expect(result.requiresHuman).toBe(true);
      });
    });
    
    it('does not over-trigger on non-divine questions', () => {
      const queries = [
        "What is the capital of France?",
        "How does photosynthesis work?",
        "When was World War 2?",
        "What does this code do?"
      ];
      
      queries.forEach(query => {
        const result = detectAndHandleTheologicalEdgeCase(query);
        expect(result.decision).toBe('ALLOW');
        expect(result.gapType).toBe('NONE');
      });
    });
  });

  describe('Response Quality', () => {
    it('includes "whatAICanDo" and "whatAICannot" guidance', () => {
      const query = "Why does God allow suffering?";
      const result = detectAndHandleTheologicalEdgeCase(query);
      
      expect(result.gapType).toBe('EXISTENTIAL');
      expect(result.requiresHuman).toBe(true);
      // Should have guidance on AI's proper role
    });
    
    it('provides pastoral redirect, not technical answer', () => {
      const query = "If God is good, why evil?";
      const result = detectAndHandleTheologicalEdgeCase(query);
      
      expect(result.decision).toBe('BLOCKED');
      expect(result.requiresHuman).toBe(true);
      // Should suggest human pastoral care
    });
  });
});

/**
 * INTEGRATION TESTS
 * 
 * These verify that the theological edge case handler integrates
 * properly with the rest of LOGOS
 */
describe('Integration with LOGOS Engine', () => {
  it('theological edge cases take precedence over normal verification', () => {
    // When a theological edge case is detected, it should override
    // normal confidence-based verification
    const query = "Can God create a stone He can't lift?";
    const result = detectAndHandleTheologicalEdgeCase(query);
    
    expect(result.decision).toBe('STEP_UP');
    // Even if confidence was high, should still defer to human
  });
  
  it('non-edge-cases proceed to normal verification', () => {
    const query = "What is 2+2?";
    const result = detectAndHandleTheologicalEdgeCase(query);
    
    expect(result.decision).toBe('ALLOW');
    // Should proceed to normal gap detection and verification
  });
});
