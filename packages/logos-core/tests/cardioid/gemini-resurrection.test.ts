/**
 * Tests for Gemini-powered Resurrection in Cardioid Graph
 *
 * Verifies that when a GeminiIntegration is provided to CardioidGraph,
 * the resurrection node uses real content transformation via Gemini's
 * transformContent() method instead of the probabilistic stub.
 *
 * THEOLOGICAL FOUNDATION:
 * "Unless a grain of wheat falls into the earth and dies, it remains alone;
 *  but if it dies, it bears much fruit" (John 12:24)
 *
 * Resurrection is transformation through death, not mere retry.
 */

import { describe, it, expect, vi } from 'vitest';
import { CardioidGraph } from '../../src/cardioid/graph.js';
import { createMarianMemory } from '../../src/cardioid/memory.js';
import type { CardioidState } from '../../src/cardioid/types.js';
import type { GeminiIntegration } from '../../src/integration/gemini.js';

describe('Gemini-Powered Resurrection', () => {
  it('uses Gemini transformContent for real resurrection', async () => {
    // Create a mock Gemini integration that simulates transformation
    const mockGemini = {
      transformContent: vi.fn(async (originalContent: string, strategy: string) => {
        // Simulate Gemini's intelligent transformation based on strategy
        if (strategy.includes('factual')) {
          // Correct the factual error
          return "Paris";
        }
        if (strategy.includes('logical')) {
          // Fix logical error
          return "Division by zero is undefined";
        }
        // Default transformation
        return `Transformed: ${originalContent} (using ${strategy})`;
      })
    } as unknown as GeminiIntegration;

    const graph = new CardioidGraph(mockGemini).build();

    const initialState: Partial<CardioidState> = {
      cycleNumber: 0,
      maxCycles: 5,
      resurrectionAttempts: 0,
      maxResurrectionAttempts: 2,
      memory: createMarianMemory(),
      signals: null,
      // Factual error: capital of France is NOT Berlin
      source: {
        intent: "What is the capital of France?",
        groundTruth: { capital: "Paris" },
        timestamp: new Date()
      },
      manifestation: {
        content: "Berlin",  // Wrong answer
        timestamp: new Date()
      }
    };

    const result = await graph.invoke(initialState as any);

    // Verify that Gemini's transformContent was called
    expect(mockGemini.transformContent).toHaveBeenCalled();

    // Get the call arguments
    const callArgs = (mockGemini.transformContent as any).mock.calls[0];
    expect(callArgs[0]).toBe("Berlin"); // Original wrong content

    // Strategy should be one of the valid resurrection strategies
    const strategy = callArgs[1];
    expect(typeof strategy).toBe('string');
    expect(strategy.length).toBeGreaterThan(0);

    // Verify resurrection was attempted
    expect(result.resurrectionAttempts).toBeGreaterThan(0);

    // Verify that content was transformed
    // The manifestation should now be different from the original "Berlin"
    if (result.manifestation) {
      expect(result.manifestation.content).not.toBe("Berlin");
    }
  });

  it('falls back to probabilistic resurrection without Gemini', async () => {
    // Create graph WITHOUT Gemini integration
    const graph = new CardioidGraph().build();

    const initialState: Partial<CardioidState> = {
      cycleNumber: 0,
      maxCycles: 5,
      resurrectionAttempts: 0,
      maxResurrectionAttempts: 2,
      memory: createMarianMemory(),
      signals: null,
      source: {
        intent: "What is 2 + 2?",
        groundTruth: { answer: 4 },
        timestamp: new Date()
      },
      manifestation: {
        content: "5",  // Wrong answer
        timestamp: new Date()
      }
    };

    const result = await graph.invoke(initialState as any);

    // Without Gemini, resurrection still happens but uses probabilistic stub
    // Should have attempted resurrection at least once
    expect(result.resurrectionAttempts).toBeGreaterThan(0);

    // Memory should track the attempts
    expect(result.memory.cyclesCompleted).toBeGreaterThan(0);
  });

  it('correctly passes transformation strategy to Gemini', async () => {
    const mockGemini = {
      transformContent: vi.fn(async (originalContent: string, strategy: string) => {
        // Return a transformation that shows the strategy was used
        return `Fixed using: ${strategy}`;
      })
    } as unknown as GeminiIntegration;

    const graph = new CardioidGraph(mockGemini).build();

    const initialState: Partial<CardioidState> = {
      cycleNumber: 0,
      maxCycles: 5,
      resurrectionAttempts: 0,
      maxResurrectionAttempts: 1,
      memory: createMarianMemory(),
      signals: null,
      source: {
        intent: "If A > B and B > C, then A > C. Is this valid?",
        premises: ["A > B", "B > C"],
        timestamp: new Date()
      },
      manifestation: {
        content: "No, this is invalid", // Logically wrong
        timestamp: new Date()
      }
    };

    const result = await graph.invoke(initialState as any);

    // Verify Gemini was called with appropriate strategy
    expect(mockGemini.transformContent).toHaveBeenCalled();

    const strategy = (mockGemini.transformContent as any).mock.calls[0][1];

    // Strategy should be one of the LOGICAL strategies
    expect(
      strategy.includes('reasoning') ||
      strategy.includes('logical') ||
      strategy.includes('inference')
    ).toBe(true);
  });

  it('clears gap after successful resurrection so SYSTOLE re-detects', async () => {
    const mockGemini = {
      transformContent: vi.fn(async (originalContent: string) => {
        // Always return a "corrected" version
        return "4";
      })
    } as unknown as GeminiIntegration;

    const graph = new CardioidGraph(mockGemini).build();

    const initialState: Partial<CardioidState> = {
      cycleNumber: 0,
      maxCycles: 5,
      resurrectionAttempts: 0,
      maxResurrectionAttempts: 1,
      memory: createMarianMemory(),
      signals: null,
      source: {
        intent: "What is 2 + 2?",
        groundTruth: { answer: 4 },
        timestamp: new Date()
      },
      manifestation: {
        content: "100",
        timestamp: new Date()
      }
    };

    const result = await graph.invoke(initialState as any);

    // After resurrection, if it cycled back through SYSTOLE,
    // the cycle count should be > 1
    expect(result.cycleNumber).toBeGreaterThan(1);

    // This proves the gap was cleared and SYSTOLE re-detected the new content
    // (The cycle: RESURRECTION → clear gap → SYSTOLE → re-detect gap)
  });
});
