/**
 * Tests for DIASTOLE Node in Cardioid Graph
 *
 * Verifies that the DIASTOLE node correctly:
 * - Generates manifestations autonomously with Gemini
 * - Skips generation if manifestation already provided
 * - Handles missing Gemini appropriately
 * - Completes full cycles with generation
 *
 * THEOLOGICAL FOUNDATION:
 * "The Word became flesh and dwelt among us" (John 1:14)
 *
 * DIASTOLE represents the Incarnation - the moment when Intent (Source)
 * becomes Manifestation (Content). This is the heart expanding, filling
 * with new life.
 */

import { describe, it, expect, vi } from 'vitest';
import { CardioidGraph } from '../../src/cardioid/graph.js';
import { createMarianMemory } from '../../src/cardioid/memory.js';
import { createDefaultPosture } from '../../src/cardioid/metanoia.js';
import type { CardioidState } from '../../src/cardioid/types.js';
import type { GeminiIntegration } from '../../src/integration/gemini.js';

describe('DIASTOLE - Heart Expansion & Generation', () => {
  it('generates manifestation autonomously with Gemini', async () => {
    // Create mock Gemini that generates content from source
    const mockGemini = {
      generateManifestation: vi.fn(async (source) => ({
        content: `Generated response to: ${source.intent}`,
        timestamp: new Date()
      }))
    } as unknown as GeminiIntegration;

    const graph = new CardioidGraph(mockGemini).build();

    const initialState: Partial<CardioidState> = {
      cycleNumber: 0,
      maxCycles: 5,
      resurrectionAttempts: 0,
      maxResurrectionAttempts: 3,
      memory: createMarianMemory(),
      verifierPosture: createDefaultPosture(),
      signals: null,
      source: {
        intent: "What is the meaning of kenosis?",
        timestamp: new Date()
      },
      manifestation: null  // No manifestation provided - DIASTOLE must generate
    };

    const result = await graph.invoke(initialState as any);

    // Verify Gemini was called for generation
    expect(mockGemini.generateManifestation).toHaveBeenCalledWith(initialState.source);

    // Verify manifestation was generated
    expect(result.manifestation).toBeDefined();
    expect(result.manifestation!.content).toContain("Generated response to");
    expect(result.manifestation!.content).toContain("kenosis");
  });

  it('skips generation if manifestation already provided', async () => {
    // Create mock Gemini to verify it's NOT called
    const mockGemini = {
      generateManifestation: vi.fn()
    } as unknown as GeminiIntegration;

    const graph = new CardioidGraph(mockGemini).build();

    const providedManifestation = {
      content: "Externally provided answer",
      timestamp: new Date()
    };

    const initialState: Partial<CardioidState> = {
      cycleNumber: 0,
      maxCycles: 5,
      resurrectionAttempts: 0,
      maxResurrectionAttempts: 3,
      memory: createMarianMemory(),
      verifierPosture: createDefaultPosture(),
      signals: null,
      source: {
        intent: "Test question",
        timestamp: new Date()
      },
      manifestation: providedManifestation  // Already provided
    };

    const result = await graph.invoke(initialState as any);

    // Verify Gemini was NOT called (generation skipped)
    expect(mockGemini.generateManifestation).not.toHaveBeenCalled();

    // Verify original manifestation was preserved
    expect(result.manifestation!.content).toBe("Externally provided answer");
  });

  it('throws error if no Gemini and no manifestation', async () => {
    // Create graph WITHOUT Gemini
    const graph = new CardioidGraph().build();

    const initialState: Partial<CardioidState> = {
      cycleNumber: 0,
      maxCycles: 5,
      resurrectionAttempts: 0,
      maxResurrectionAttempts: 3,
      memory: createMarianMemory(),
      verifierPosture: createDefaultPosture(),
      signals: null,
      source: {
        intent: "This requires generation",
        timestamp: new Date()
      },
      manifestation: null  // No manifestation and no Gemini = ERROR
    };

    // Should throw error during DIASTOLE
    await expect(graph.invoke(initialState as any)).rejects.toThrow(
      /Diastole requires GeminiIntegration/
    );
  });

  it('completes full cycle: generation → verification → decision', async () => {
    // Create mock Gemini that generates good quality content
    const mockGemini = {
      generateManifestation: vi.fn(async (source) => ({
        content: "High quality generated answer",
        timestamp: new Date()
      }))
    } as unknown as GeminiIntegration;

    const graph = new CardioidGraph(mockGemini).build();

    const initialState: Partial<CardioidState> = {
      cycleNumber: 0,
      maxCycles: 5,
      resurrectionAttempts: 0,
      maxResurrectionAttempts: 3,
      memory: createMarianMemory(),
      verifierPosture: createDefaultPosture(),
      signals: null,
      source: {
        intent: "Simple question",
        timestamp: new Date()
      },
      manifestation: null  // Will be generated
    };

    const result = await graph.invoke(initialState as any);

    // Verify complete flow happened:
    // 1. DIASTOLE generated manifestation
    expect(result.manifestation).toBeDefined();

    // 2. SYSTOLE detected gap
    expect(result.gap).toBeDefined();

    // 3. CUSPIS made decision
    expect(result.cuspDecision).toBeDefined();

    // 4. PONDER updated memory
    expect(result.memory.cyclesCompleted).toBeGreaterThan(0);
  });

  it('manifestation quality affects gap detection and decision', async () => {
    // This test verifies that DIASTOLE-generated content goes through
    // the same verification pipeline as externally-provided content

    const mockGemini = {
      generateManifestation: vi.fn(async () => ({
        content: "Generated answer to the question",
        timestamp: new Date()
      }))
    } as unknown as GeminiIntegration;

    const graph = new CardioidGraph(mockGemini).build();

    const state: Partial<CardioidState> = {
      cycleNumber: 0,
      maxCycles: 5,
      resurrectionAttempts: 0,
      maxResurrectionAttempts: 3,
      memory: createMarianMemory(),
      verifierPosture: createDefaultPosture(),
      signals: null,
      source: {
        intent: "Explain the concept of kenosis",
        timestamp: new Date()
      },
      manifestation: null  // Will be generated by DIASTOLE
    };

    const result = await graph.invoke(state as any);

    // Verify that generated content was analyzed
    expect(result.gap).toBeDefined();
    expect(result.gap!.overallDistance).toBeGreaterThanOrEqual(0);

    // Verify that a decision was made based on the generated content
    expect(result.cuspDecision).toBeDefined();
    expect(result.cuspDecision!.mode).toBeDefined();

    // Verify that the cycle completed
    expect(result.cycleNumber).toBeGreaterThan(0);
    expect(result.memory.cyclesCompleted).toBeGreaterThan(0);

    // The key insight: generated content flows through the same pipeline
    // as externally-provided content (SYSTOLE → CUSPIS → PONDER)
  });
});
