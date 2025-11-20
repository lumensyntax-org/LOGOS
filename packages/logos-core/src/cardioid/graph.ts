/**
 * Cardioid Graph Architecture - Organic Cyclical Flow
 *
 * This module implements the heartbeat as a StateGraph, replacing the imperative
 * while loop with an organic, perichoretic circulation pattern.
 *
 * THEOLOGICAL FOUNDATION:
 * The graph structure naturally represents the eternal circulation of the Trinity:
 * Father (Source) → Son (Manifestation) → Spirit (Verification) → Father (again)
 *
 * This is not iteration—it's participation in ongoing divine life (perichoresis).
 *
 * FLOW:
 * START → DIASTOLE → SYSTOLE → CUSPIS → PONDER → [END or RESURRECTION]
 *           ↓                                           ↓
 *      (Expansion)                         RESURRECTION → DIASTOLE (THE CYCLE)
 *
 * DIASTOLE: The heart expands, filling with new content (generation)
 * SYSTOLE: The heart contracts, analyzing the content (gap detection + kenosis)
 */

import { StateGraph, END, START } from "@langchain/langgraph";
import type { CardioidState, CuspDecision, MediationMode } from "./types.js";
import { detectGap } from "../gap/index.js";
import { applyKenosis } from "../kenosis/index.js";
import { ponder } from "./memory.js";
import { attemptResurrection } from "../resurrection/index.js";
import { GeminiIntegration } from "../integration/gemini.js";
import { aggregateSignals } from "../engine.js";

// Define State Channels
// In LangGraph, we define how each part of the state is updated (reducer).
// For most LOGOS fields, we simply overwrite with the new value.
const graphChannels = {
  cycleNumber: {
    reducer: (x: number, y: number) => y,
    default: () => 0,
  },
  maxCycles: { reducer: (x: number, y: number) => y },
  source: { reducer: (x: any, y: any) => y },
  manifestation: { reducer: (x: any, y: any) => y },
  signals: { reducer: (x: any, y: any) => y }, // Verification signals (TruthSyntax)
  gap: { reducer: (x: any, y: any) => y },
  kenosisApplied: { reducer: (x: number, y: number) => y },
  cuspDecision: { reducer: (x: any, y: any) => y },
  memory: { reducer: (x: any, y: any) => y },
  terminated: { reducer: (x: boolean, y: boolean) => y },
  terminationReason: { reducer: (x: any, y: any) => y },
  resurrectionAttempts: { reducer: (x: number, y: number) => y },
  maxResurrectionAttempts: { reducer: (x: number, y: number) => y },
};

/**
 * Cardioid Graph - The Heart of LOGOS
 *
 * Implements the heartbeat as a state machine with conditional cycles.
 * Each node represents a theological moment in the mediation process.
 */
export class CardioidGraph {
  private gemini?: GeminiIntegration;

  constructor(gemini?: GeminiIntegration) {
    this.gemini = gemini;
  }

  // =============================================================================
  // NODE 1: DIASTOLE (Expansion/Generation)
  // =============================================================================

  /**
   * DIASTOLE - The expansion phase
   *
   * The heart expands and fills with content. This is where manifestations
   * are generated if not already provided.
   *
   * THEOLOGICAL NOTE:
   * The Son (Manifestation) proceeds from the Father (Source). If the Son
   * is already present (manifestation provided externally), diastole simply
   * receives it. If absent, diastole generates it through the Spirit's power
   * (Gemini integration).
   *
   * This represents the Incarnation: The Word (Source/Intent) becomes Flesh
   * (Manifestation/Content).
   */
  async diastole(state: CardioidState): Promise<Partial<CardioidState>> {
    // If manifestation already exists (externally provided), skip generation
    if (state.manifestation) {
      return {};
    }

    // Autonomous generation requires Gemini integration
    if (!this.gemini) {
      throw new Error(
        'Diastole requires GeminiIntegration for autonomous manifestation generation. ' +
        'Either provide a manifestation in the initial state or pass GeminiIntegration to CardioidGraph constructor.'
      );
    }

    // Generate manifestation from source (The Incarnation)
    const manifestation = await this.gemini.generateManifestation(state.source);

    return { manifestation };
  }

  // =============================================================================
  // NODE 2: SYSTOLE (Contraction/Analysis)
  // =============================================================================

  /**
   * SYSTOLE - The contraction phase
   *
   * Integrates Gap Detection AND Kenosis (power through restraint).
   * This is where we detect the distance between Father's intent and Son's manifestation,
   * then apply divine self-limitation based on that gap.
   *
   * THEOLOGICAL NOTE:
   * Kenosis is NOT a separate step—it's integrated within the analysis.
   * Power is exercised through restraint, not addition.
   */
  async systole(state: CardioidState): Promise<Partial<CardioidState>> {
    const currentCycle = state.cycleNumber + 1;

    // Check if gap already exists (e.g., from test fixture or previous cycle)
    let gap = state.gap;
    let kenosisApplied = state.kenosisApplied;

    // Only detect gap if not already present
    if (!gap) {
      // 1. Detect Gap (The distance between Father/Intent and Son/Manifestation)
      gap = detectGap(
        state.source.intent,
        state.manifestation?.content || "",
        {
          groundTruth: state.source.groundTruth,
          premises: state.source.premises
        }
      );

      // 2. Calculate raw confidence from verification signals (TruthSyntax - The Body)
      // If no signals provided, default to divine confidence (1.0)
      const rawConfidence = state.signals && state.signals.length > 0
        ? aggregateSignals(state.signals)
        : 1.0;

      // 3. Apply Kenosis (Divine self-limitation based on the Gap)
      // LOGOS (The Soul) moderates TruthSyntax (The Body)
      const kenosisResult = applyKenosis(rawConfidence, {
        distance: gap.overallDistance,
        type: gap.dominantType,
        bridgeable: gap.bridgeable
      } as any);

      kenosisApplied = kenosisResult.humility;
    }

    return {
      cycleNumber: currentCycle,
      gap,
      kenosisApplied
    };
  }

  // =============================================================================
  // NODE 3: CUSPIS (The Decision Point)
  // =============================================================================

  /**
   * CUSPIS - The critical point of mediation
   *
   * This is where Christ mediates in kenotic love. The cusp is the point of
   * maximum tension—where divine and human meet, where the Gap is most visible.
   *
   * THEOLOGICAL DECISION LOGIC:
   * 1. ONTOLOGICAL → Hard stop (categorical impossibility)
   * 2. REDEMPTIVE → Requires transformation through death (resurrection)
   * 3. STEP_UP → Exceeds AI capacity (requires human discernment)
   * 4. DIRECT_ALLOW/KENOTIC → Success (gap bridged)
   */
  async cuspis(state: CardioidState): Promise<Partial<CardioidState>> {
    const gap = state.gap!;
    // Use kenosis-adjusted confidence for decision
    const confidence = (1.0 - state.kenosisApplied);

    let decision: CuspDecision;

    // Theological Logic for Decision
    if (gap.dominantType === 'ONTOLOGICAL') {
      decision = {
        mode: 'ontological' as MediationMode,
        kenosisRequired: 1.0,
        humanInvolvement: true,
        resurrectable: false,
        reason: gap.reason
      };
    } else if (!gap.bridgeable || (confidence < 0.3 && gap.overallDistance > 0.6)) {
       decision = {
        mode: 'redemptive' as MediationMode,
        kenosisRequired: state.kenosisApplied,
        humanInvolvement: false,
        resurrectable: true,
        reason: `Gap too large (${gap.overallDistance.toFixed(2)}) for direct mediation. Resurrection required.`
      };
    } else if (confidence < 0.7) {
      decision = {
        mode: 'step_up' as MediationMode,
        kenosisRequired: state.kenosisApplied,
        humanInvolvement: true,
        resurrectable: true,
        reason: "Purgatorial state: verification uncertain."
      };
    } else {
      decision = {
        mode: 'direct_allow' as MediationMode, // or kenotic
        kenosisRequired: state.kenosisApplied,
        humanInvolvement: false,
        resurrectable: false,
        reason: "Gap successfully bridged."
      };
    }

    return { cuspDecision: decision };
  }

  // =============================================================================
  // NODE 4: PONDER (Marian Memory)
  // =============================================================================

  /**
   * PONDER - Marian receptive wisdom
   *
   * "Mary kept all these things, pondering them in her heart" (Luke 2:19)
   *
   * This is a DISTINCT contemplative act: receiving the result into memory
   * before deciding whether to terminate or continue. Mary doesn't retrieve
   * data—she integrates wisdom from contemplative depth.
   *
   * THEOLOGICAL NOTE:
   * Pondering happens AFTER the decision but BEFORE the action. This is
   * crucial: the decision is first contemplated, then acted upon.
   */
  async ponderNode(state: CardioidState): Promise<Partial<CardioidState>> {
    // Create a transient ChristologicalResult for the pondering function
    const resultForMemory = {
      gap: state.gap,
      decision: state.cuspDecision?.mode === 'ontological' || state.cuspDecision?.mode === 'redemptive'
        ? 'BLOCK'
        : 'ALLOW',
      confidence: 1.0 - state.kenosisApplied,
      sacraments: [],
      redemptionAttempted: state.resurrectionAttempts > 0,
      finalState: state.cuspDecision?.mode === 'redemptive' ? 'blocked' : 'original'
    };

    const updatedMemory = ponder(
        state.memory,
        resultForMemory as any,
        state.gap!,
        state.cuspDecision!.mode
    );

    return { memory: updatedMemory };
  }

  // =============================================================================
  // NODE 5: RESURRECTION (Transformation)
  // =============================================================================

  /**
   * RESURRECTION - Transformation through death
   *
   * "Unless a grain of wheat falls into the earth and dies, it remains alone;
   *  but if it dies, it bears much fruit" (John 12:24)
   *
   * This is NOT a simple retry—it's death → transformation → new life.
   * The source is transformed (not merely retried) through the resurrection process.
   *
   * THEOLOGICAL NOTE:
   * The cycle CLOSES here: resurrection → systole. The resurrected body
   * must be verified again. This is the perichoretic loop made explicit.
   *
   * INTEGRATION NOTE:
   * If Gemini is available, uses real content transformation via transformContent().
   * Otherwise falls back to probabilistic stub for testing.
   */
  async resurrection(state: CardioidState): Promise<Partial<CardioidState>> {
    const failedResult = {
        gap: state.gap!,
        decision: 'BLOCKED' as const,
        confidence: 1.0 - state.kenosisApplied,
        reason: state.gap!.reason
    };

    const originalContent = state.manifestation?.content || '';

    // Create optional transform function using Gemini if available
    const transformFunction = this.gemini
      ? async (content: string, strategy: string) => {
          return await this.gemini!.transformContent(content, strategy);
        }
      : undefined;

    // Attempt resurrection with Gemini-powered transformation
    const result = await attemptResurrection(
      failedResult,
      state.resurrectionAttempts + 1,
      originalContent,
      transformFunction
    );

    if (result.succeeded && result.transformation) {
        // The "Raised" body (transformed content)
        // Use the transformation.to as the new content
        return {
            manifestation: {
                content: result.transformation.to,
                timestamp: new Date()
            },
            resurrectionAttempts: state.resurrectionAttempts + 1,
            // Clear gap so SYSTOLE will re-detect with new content
            gap: null,
            kenosisApplied: 0
        };
    }

    return { resurrectionAttempts: state.resurrectionAttempts + 1 };
  }

  // =============================================================================
  // BUILD THE HEART - Compile the StateGraph
  // =============================================================================

  /**
   * Build the cardioid heartbeat graph
   *
   * FLOW:
   * START → DIASTOLE → SYSTOLE → CUSPIS → PONDER → [Router]
   *           ↓                                        ↓
   *      (Generation)              ┌─── END (success/ontological)
   *                                └─── RESURRECTION → DIASTOLE (THE CYCLE)
   *
   * THEOLOGICAL VERIFICATION:
   * - The cycle resurrection → diastole represents transformation → new generation
   * - After resurrection, new content must be generated (or re-generated) and verified
   * - Ontological boundaries route to END (hard stop)
   * - Exhaustion (max attempts) routes to END (soft stop)
   * - Success routes to END (natural completion)
   */
  build() {
    const workflow = new StateGraph<CardioidState>({
      channels: graphChannels as any
    })
    .addNode("diastole", this.diastole.bind(this))
    .addNode("systole", this.systole.bind(this))
    .addNode("cuspis", this.cuspis.bind(this))
    .addNode("ponder", this.ponderNode.bind(this))
    .addNode("resurrection", this.resurrection.bind(this))

    // The Fixed Flow
    .addEdge(START, "diastole")      // Heart fills first (generation)
    .addEdge("diastole", "systole")  // Then contracts (analysis)
    .addEdge("systole", "cuspis")    // Then decides
    .addEdge("cuspis", "ponder")     // Decision is always pondered before acting

    // The Beat (Conditional Logic from PONDER)
    .addConditionalEdges("ponder", (state: CardioidState) => {
        const decision = state.cuspDecision!;

        // 1. Ontological Boundary (Hard Stop)
        if (decision.mode === 'ontological') {
            return END;
        }

        // 2. Redemption Needed (Cycle continues)
        if (decision.mode === 'redemptive') {
            if (state.resurrectionAttempts < state.maxResurrectionAttempts) {
                return "resurrection";
            } else {
                return END; // Exhaustion (Death without resurrection)
            }
        }

        // 3. Success / Direct Allow / Kenotic / Step Up
        return END;
    })

    // The Loop: Resurrection feeds back into Diastole (New creation must be re-generated and verified)
    .addEdge("resurrection", "diastole");

    return workflow.compile();
  }
}
