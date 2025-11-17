/**
 * Tests for Gap Detection
 * 
 * Validates that the Gap is properly identified and measured
 */

import { describe, it, expect } from 'vitest';
import { detectGap } from '../src/gap/detector.js';
import type { Source, Manifestation, Verifier, Signal } from '../src/types.js';

describe('Gap Detection', () => {
  it('detects minimal gap for perfect fidelity', () => {
    const source: Source = {
      intent: "What is 2+2?",
      groundTruth: { answer: 4 },
      timestamp: new Date()
    };
    
    const manifestation: Manifestation = {
      content: "2+2 equals 4",
      timestamp: new Date()
    };
    
    const signals: Signal[] = [
      { name: "grounding", value: 1.0, weight: 1.0, source: "kb" },
      { name: "consistency", value: 1.0, weight: 1.0, source: "logic" }
    ];
    
    const verifier: Verifier = {
      signals,
      confidence: 1.0,
      evidence: [],
      timestamp: new Date()
    };
    
    const gap = detectGap(source, manifestation, verifier);
    
    expect(gap.distance.overall).toBeLessThan(0.2);
    expect(gap.mediation.type).toBe('direct');
    expect(gap.mediation.resurrectionNeeded).toBe(false);
  });

  it('detects large gap for hallucinated content', () => {
    const source: Source = {
      intent: "What is the capital of France?",
      groundTruth: { capital: "Paris" },
      timestamp: new Date()
    };
    
    const manifestation: Manifestation = {
      content: "The capital of France is Berlin",
      timestamp: new Date()
    };
    
    const signals: Signal[] = [
      { name: "grounding", value: -0.8, weight: 1.0, source: "kb" },
      { name: "consistency", value: 0.2, weight: 1.0, source: "logic" }
    ];
    
    const verifier: Verifier = {
      signals,
      confidence: 0.1,
      evidence: [],
      timestamp: new Date()
    };
    
    const gap = detectGap(source, manifestation, verifier);
    
    expect(gap.distance.overall).toBeGreaterThan(0.4); // Adjusted threshold
    expect(gap.mediation.type).toBe('correction'); // Will be correction, not redemption
    expect(gap.mediation.resurrectionNeeded).toBe(true);
  });
  
  it('detects moderate gap requiring correction', () => {
    const source: Source = {
      intent: "Explain gravity",
      groundTruth: { concept: "gravity" },
      timestamp: new Date()
    };
    
    const manifestation: Manifestation = {
      content: "Gravity is a force that pulls things down",
      timestamp: new Date()
    };
    
    const signals: Signal[] = [
      { name: "grounding", value: 0.3, weight: 1.0, source: "kb" },
      { name: "consistency", value: 0.5, weight: 1.0, source: "logic" }
    ];
    
    const verifier: Verifier = {
      signals,
      confidence: 0.4,
      evidence: [],
      timestamp: new Date()
    };
    
    const gap = detectGap(source, manifestation, verifier);
    
    expect(gap.distance.overall).toBeGreaterThan(0.3);
    expect(gap.distance.overall).toBeLessThan(0.6);
    expect(gap.mediation.type).toBe('correction');
  });
});
