/**
 * Tests for Gap Detection
 * 
 * Validates that the Gap is properly identified and measured
 */

import { describe, it, expect } from 'vitest';
import { detectGap } from '../src/gap/index.js';
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

    const gap = detectGap(source.intent, manifestation.content, {
      groundTruth: source.groundTruth
    });

    expect(gap.overallDistance).toBeLessThan(0.2);
    expect(gap.bridgeable).toBe(true);
    expect(gap.dominantType).not.toBe('ONTOLOGICAL');
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

    const gap = detectGap(source.intent, manifestation.content, {
      groundTruth: source.groundTruth
    });

    expect(gap.overallDistance).toBeGreaterThan(0.4); // Adjusted threshold
    expect(gap.bridgeable).toBe(false); // Large gaps are not bridgeable
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

    const gap = detectGap(source.intent, manifestation.content, {
      groundTruth: source.groundTruth
    });

    expect(gap.overallDistance).toBeGreaterThan(0.3);
    expect(gap.overallDistance).toBeLessThan(0.6);
    expect(gap.bridgeable).toBe(true); // Moderate gaps can be bridged
  });
});
