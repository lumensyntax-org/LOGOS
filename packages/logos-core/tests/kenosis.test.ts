/**
 * Tests for Kenosis - Divine Self-Limitation
 * 
 * Validates that confidence is appropriately constrained
 */

import { describe, it, expect } from 'vitest';
import { applyKenosis, kenosisPermitsMediation } from '../src/gap/kenosis.js';
import type { GapDistance, Mediation } from '../src/types.js';

describe('Kenosis - Self-Limitation', () => {
  it('applies minimal kenosis for small gaps', () => {
    const divineConfidence = 1.0;
    const smallGap: GapDistance = {
      semantic: 0.1,
      factual: 0.1,
      logical: 0.1,
      overall: 0.1
    };
    
    const adjusted = applyKenosis(divineConfidence, smallGap);
    
    // Should retain most confidence for small gaps
    expect(adjusted).toBeGreaterThan(0.9);
    expect(adjusted).toBeLessThanOrEqual(1.0);
  });
  
  it('applies significant kenosis for large gaps', () => {
    const divineConfidence = 1.0;
    const largeGap: GapDistance = {
      semantic: 0.8,
      factual: 0.8,
      logical: 0.8,
      overall: 0.8
    };
    
    const adjusted = applyKenosis(divineConfidence, largeGap);
    
    // Should significantly reduce confidence for large gaps
    expect(adjusted).toBeLessThan(0.5);
  });

  it('permits mediation for reasonable fidelity', () => {
    const mediation: Mediation = {
      type: 'translation',
      kenosis: 0.3,
      fidelity: 0.7,
      resurrectionNeeded: false
    };
    
    expect(kenosisPermitsMediation(mediation)).toBe(true);
  });
  
  it('blocks mediation for extreme kenosis with low fidelity', () => {
    const mediation: Mediation = {
      type: 'redemption',
      kenosis: 0.95,
      fidelity: 0.1,
      resurrectionNeeded: true
    };
    
    expect(kenosisPermitsMediation(mediation)).toBe(false);
  });
  
  it('permits mediation for extreme kenosis if fidelity sufficient', () => {
    const mediation: Mediation = {
      type: 'redemption',
      kenosis: 0.95,
      fidelity: 0.5,
      resurrectionNeeded: true
    };
    
    expect(kenosisPermitsMediation(mediation)).toBe(true);
  });
});
