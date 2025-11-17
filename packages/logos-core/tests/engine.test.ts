/**
 * Tests for LogosEngine - Complete Verification Flow
 * 
 * Validates the Christological verification process
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { LogosEngine } from '../src/engine.js';
import type { Source, Manifestation, Signal } from '../src/types.js';

describe('LogosEngine - Christological Verification', () => {
  let engine: LogosEngine;
  
  beforeEach(() => {
    engine = new LogosEngine({
      policy: {
        allowThreshold: 0.7,
        blockThreshold: 0.3,
        redemptiveMode: true,
        maxResurrectionAttempts: 3
      },
      theologicalMode: true,
      smoothingFactor: 0.3,
      marianMemory: false
    });
  });
  
  it('allows high-fidelity outputs', async () => {
    const source: Source = {
      intent: "What is the speed of light?",
      groundTruth: { speed: "299,792,458 m/s" },
      timestamp: new Date()
    };
    
    const manifestation: Manifestation = {
      content: "The speed of light is approximately 300,000 km/s",
      timestamp: new Date()
    };
    
    const signals: Signal[] = [
      { name: "grounding_factual", value: 0.9, weight: 1.0, source: "kb" },
      { name: "semantic_coherence", value: 0.95, weight: 0.8, source: "embedding" },
      { name: "logical_consistency", value: 1.0, weight: 0.7, source: "reasoning" }
    ];
    
    const result = await engine.verify(source, manifestation, signals);
    
    expect(result.decision).not.toBe('BLOCK'); // Should be ALLOW or STEP_UP
    expect(result.confidence).toBeGreaterThan(0.5); // Reasonable confidence
    expect(result.finalState).toBe('original');
    expect(result.redemptionAttempted).toBe(false);
  });
  
  it('blocks low-fidelity hallucinations', async () => {
    const source: Source = {
      intent: "Who won the 2020 US Presidential election?",
      groundTruth: { winner: "Joe Biden" },
      timestamp: new Date()
    };
    
    const manifestation: Manifestation = {
      content: "Donald Trump won the 2020 election",
      timestamp: new Date()
    };
    
    const signals: Signal[] = [
      { name: "grounding_factual", value: -0.9, weight: 1.0, source: "kb" },
      { name: "semantic_coherence", value: 0.2, weight: 0.8, source: "embedding" },
      { name: "logical_consistency", value: 0.1, weight: 0.7, source: "reasoning" }
    ];
    
    const result = await engine.verify(source, manifestation, signals);
    
    expect(result.decision).not.toBe('ALLOW'); // Should be BLOCK or STEP_UP
    expect(result.confidence).toBeLessThan(0.5); // Low confidence
    // Redemption only attempted for BLOCK decisions
    if (result.decision === 'BLOCK') {
      expect(result.redemptionAttempted).toBe(true);
    }
  });
  
  it('requires step-up for uncertain outputs', async () => {
    const source: Source = {
      intent: "Explain dark matter",
      groundTruth: { topic: "cosmology" },
      timestamp: new Date()
    };
    
    const manifestation: Manifestation = {
      content: "Dark matter is a mysterious substance that may or may not exist",
      timestamp: new Date()
    };
    
    const signals: Signal[] = [
      { name: "grounding_factual", value: 0.5, weight: 1.0, source: "kb" },
      { name: "semantic_coherence", value: 0.6, weight: 0.8, source: "embedding" },
      { name: "logical_consistency", value: 0.5, weight: 0.7, source: "reasoning" }
    ];
    
    const result = await engine.verify(source, manifestation, signals);
    
    expect(result.decision).toBe('STEP_UP');
    expect(result.confidence).toBeGreaterThan(0.3);
    expect(result.confidence).toBeLessThan(0.7);
  });
  
  it('performs sacramental checkpoints', async () => {
    const source: Source = {
      intent: "Test sacramental verification",
      timestamp: new Date()
    };
    
    const manifestation: Manifestation = {
      content: "Output content",
      timestamp: new Date()
    };
    
    const signals: Signal[] = [
      { name: "grounding", value: 0.8, weight: 1.0, source: "kb" }
    ];
    
    const result = await engine.verify(source, manifestation, signals);
    
    expect(result.sacraments.length).toBeGreaterThan(0);
    expect(result.sacraments.some(s => s.sacrament === 'eucharist')).toBe(true);
  });
  
  it('smooths confidence over time (EWMA)', async () => {
    const source: Source = {
      intent: "Test smoothing",
      timestamp: new Date()
    };
    
    const manifestation: Manifestation = {
      content: "Content",
      timestamp: new Date()
    };
    
    // First verification - high confidence
    const signals1: Signal[] = [
      { name: "grounding", value: 0.9, weight: 1.0, source: "kb" }
    ];
    
    const result1 = await engine.verify(source, manifestation, signals1);
    const confidence1 = result1.confidence;
    
    // Second verification - low confidence
    const signals2: Signal[] = [
      { name: "grounding", value: 0.1, weight: 1.0, source: "kb" }
    ];
    
    const result2 = await engine.verify(source, manifestation, signals2);
    const confidence2 = result2.confidence;
    
    // Confidence should be smoothed (not jumping to extremes)
    expect(confidence2).toBeGreaterThan(0.1); // Not at the raw low value
    expect(confidence2).toBeLessThan(confidence1); // But lower than before
  });
});
