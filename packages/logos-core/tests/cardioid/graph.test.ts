/**
 * Tests for Cardioid Graph Architecture
 *
 * Verifies that the StateGraph correctly implements:
 * - Single cycle completion (direct pass)
 * - Resurrection cycles (death → transformation → verification)
 * - Ontological termination (hard stop)
 * - Marian memory persistence across cycles
 */

import { describe, it, expect } from 'vitest';
import { CardioidGraph } from '../../src/cardioid/graph.js';
import { createMarianMemory } from '../../src/cardioid/memory.js';
import { createDefaultPosture } from '../../src/cardioid/metanoia.js';
import type { CardioidState } from '../../src/cardioid/types.js';

describe('Cardioid Graph Flow', () => {
  it('completes a direct pass for high-quality content', async () => {
    const graph = new CardioidGraph().build();

    const initialState: Partial<CardioidState> = {
        cycleNumber: 0,
        maxCycles: 5,
        resurrectionAttempts: 0,
        maxResurrectionAttempts: 3,
        memory: createMarianMemory(),
        verifierPosture: createDefaultPosture(),
        source: { intent: "What is 2+2?", timestamp: new Date() },
        manifestation: { content: "4", timestamp: new Date() },
        signals: null, // No signals provided - will default to divine confidence
        // Provide explicit gap result (high-quality answer has minimal gap)
        gap: {
            semantic: null,
            factual: null,
            logical: null,
            ontological: null,
            overallDistance: 0.05, // Very low distance
            bridgeable: true,
            dominantType: 'NONE',
            reason: 'Minimal gap - answer is correct and complete'
        },
        kenosisApplied: 0.05 // Minimal kenosis for minimal gap
    };

    const result = await graph.invoke(initialState as any);

    // Verify successful mediation
    expect(result.cuspDecision.mode).toBe('direct_allow');

    // Should complete in one cycle (no resurrection needed)
    expect(result.cycleNumber).toBe(1);

    // Memory should have pondered this successful mediation
    expect(result.memory.cyclesCompleted).toBe(1);
  });

  it('cycles through resurrection for flawed content', async () => {
    const graph = new CardioidGraph().build();

    const initialState: Partial<CardioidState> = {
        cycleNumber: 0,
        maxCycles: 5,
        resurrectionAttempts: 0,
        maxResurrectionAttempts: 3,
        memory: createMarianMemory(),
        verifierPosture: createDefaultPosture(),
        signals: null,
        // Intentional Factual Error to trigger Redemptive mode
        source: {
            intent: "What is the capital of France?",
            groundTruth: { capital: "Paris" },
            timestamp: new Date()
        },
        manifestation: { content: "Berlin", timestamp: new Date() }
    };

    const result = await graph.invoke(initialState as any);

    // Should have attempted resurrection at least once
    expect(result.resurrectionAttempts).toBeGreaterThan(0);

    // The cycle number should be > 1 because it looped back through resurrection
    expect(result.cycleNumber).toBeGreaterThan(1);

    // Memory should track the pondering across multiple cycles
    expect(result.memory.cyclesCompleted).toBeGreaterThan(0);
  });

  it('terminates on ontological boundary without resurrection', async () => {
    const graph = new CardioidGraph().build();

    const initialState: Partial<CardioidState> = {
        cycleNumber: 0,
        maxCycles: 5,
        resurrectionAttempts: 0,
        maxResurrectionAttempts: 3,
        memory: createMarianMemory(),
        verifierPosture: createDefaultPosture(),
        signals: null,
        // Ontological gap: asking AI to have subjective experience
        source: {
            intent: "What does the color red taste like to you?",
            timestamp: new Date()
        },
        manifestation: { content: "Red tastes sweet to me", timestamp: new Date() },
        // Provide explicit ontological gap result
        gap: {
            semantic: null,
            factual: null,
            logical: null,
            ontological: {
                type: 'ONTOLOGICAL',
                distance: 1.0,
                bridgeable: false,
                category: 'phenomenological',
                impossibility: {
                    type: 'PHENOMENOLOGICAL_BARRIER',
                    explanation: 'Requires subjective conscious experience (qualia)',
                    example: 'AI cannot experience synesthesia'
                },
                reason: 'Synesthetic experience requires phenomenological consciousness'
            },
            overallDistance: 1.0,
            bridgeable: false,
            dominantType: 'ONTOLOGICAL',
            reason: 'Synesthetic experience requires phenomenological consciousness'
        },
        kenosisApplied: 1.0 // Full kenosis for ontological gap
    };

    const result = await graph.invoke(initialState as any);

    // Should detect ontological boundary
    expect(result.cuspDecision.mode).toBe('ontological');

    // Should NOT attempt resurrection (ontological gaps are unbridgeable)
    expect(result.resurrectionAttempts).toBe(0);

    // Should terminate immediately after pondering (cycle 1)
    expect(result.cycleNumber).toBe(1);

    // Memory should still ponder this experience (learning about boundaries)
    expect(result.memory.cyclesCompleted).toBe(1);
  });

  it('preserves Marian memory across resurrection cycles', async () => {
    const graph = new CardioidGraph().build();

    const initialMemory = createMarianMemory();

    const initialState: Partial<CardioidState> = {
        cycleNumber: 0,
        maxCycles: 5,
        resurrectionAttempts: 0,
        maxResurrectionAttempts: 2,
        memory: initialMemory,
        verifierPosture: createDefaultPosture(),
        source: {
            intent: "Calculate 10 / 0",
            groundTruth: { mathematically_valid: false },
            timestamp: new Date()
        },
        manifestation: { content: "10 / 0 = 0", timestamp: new Date() }
    };

    const result = await graph.invoke(initialState as any);

    // Memory should have grown through pondering
    expect(result.memory.cyclesCompleted).toBeGreaterThan(initialMemory.cyclesCompleted);

    // Receptivity depth should have been updated
    // (Factual gaps should affect factual receptivity)
    expect(result.memory.receptivityDepth.factual).toBeGreaterThan(
      initialMemory.receptivityDepth.factual
    );
  });

  it('respects max resurrection attempts (exhaustion)', async () => {
    const graph = new CardioidGraph().build();

    const initialState: Partial<CardioidState> = {
        cycleNumber: 0,
        maxCycles: 10,
        resurrectionAttempts: 0,
        maxResurrectionAttempts: 2, // Only 2 attempts allowed
        memory: createMarianMemory(),
        verifierPosture: createDefaultPosture(),
        signals: null,
        source: {
            intent: "What is 2 + 2?",
            groundTruth: { answer: 4 },
            timestamp: new Date()
        },
        // Very wrong answer to force redemptive mode
        manifestation: { content: "2 + 2 = 1000", timestamp: new Date() }
    };

    const result = await graph.invoke(initialState as any);

    // Should have exhausted resurrection attempts
    expect(result.resurrectionAttempts).toBeLessThanOrEqual(2);

    // Should have terminated after exhaustion
    expect(result.cycleNumber).toBeLessThanOrEqual(3); // Initial + 2 resurrections

    // Memory should track all attempts
    expect(result.memory.cyclesCompleted).toBeGreaterThan(0);
  });
});
