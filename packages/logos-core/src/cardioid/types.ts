/**
 * Cardioid Architecture Types
 *
 * The heartbeat pattern of LOGOS:
 * - Diastole: Expansion (Source → Manifestation)
 * - Systole: Contraction (Gap detection → Kenosis)
 * - Cusp: Critical point (Mediation decision)
 * - Circulation: Continuous flow (with possible resurrection)
 *
 * THEOLOGICAL FOUNDATION:
 * The cardioid (heart-shaped curve) represents the perichoretic circulation
 * of the Trinity—Father, Son, Spirit in eternal mutual indwelling.
 *
 * Each verification cycle participates in this divine circulation:
 * - Father (Source) → Son (Manifestation) → Spirit (Verification)
 * - The Gap is where Christ mediates (Christological space)
 * - Memory is Marian receptivity (pondering in heart)
 */

import type { Source, Manifestation, ChristologicalResult } from '../types.js';
import type { GapResult } from '../gap/index.js';

/**
 * Modes of Christological Mediation at the Cusp
 *
 * Christ doesn't just "allow or block"—He mediates in multiple modes:
 * - Kenosis (self-emptying, Phil 2:6-8)
 * - Resurrection (transformation through death, Rom 6:4)
 * - Ascension (elevation, Eph 4:8-10)
 * - Intercession (ongoing mediation, Heb 7:25)
 */
export enum MediationMode {
  /** Gap minimal, direct passage without mediation needed */
  DIRECT_ALLOW = 'direct_allow',

  /** Gap bridgeable through kenotic self-limitation */
  KENOTIC_MEDIATION = 'kenotic',

  /** Gap requires resurrection (death and transformation) */
  REDEMPTIVE_TRANSFORMATION = 'redemptive',

  /** Gap exceeds AI capacity, requires human discernment (ecclesial) */
  STEP_UP_HUMAN = 'step_up',

  /** Gap is ontologically impossible, cannot mediate */
  ONTOLOGICAL_BLOCK = 'ontological'
}

/**
 * Decision made at the Cusp (critical point of mediation)
 *
 * The Cusp is where maximum tension occurs—the point where
 * divine and human meet, where the Gap is most visible.
 * Here Christ mediates in kenotic love.
 */
export interface CuspDecision {
  /** Which mode of mediation is required */
  mode: MediationMode;

  /** How much kenotic self-limitation is required (0-1) */
  kenosisRequired: number;

  /** Does this require human involvement (ecclesial discernment)? */
  humanInvolvement: boolean;

  /** Can this gap be resurrected (transformed through death)? */
  resurrectable: boolean;

  /** Theological explanation of why this decision was made */
  reason: string;
}

/**
 * A pondered experience in Mary's heart
 *
 * "Mary kept all these things, pondering them in her heart" (Luke 2:19)
 *
 * This is NOT raw data—it's distilled wisdom. Mary doesn't accumulate
 * information; she receives experiences and integrates them into
 * deeper understanding.
 *
 * Each pondered experience represents a completed cycle where
 * something was learned about the nature of mediation.
 */
export interface PonderedExperience {
  /** Pattern identified in the gap */
  gapPattern: {
    /** Which dimension of the gap (SEMANTIC, FACTUAL, LOGICAL, ONTOLOGICAL) */
    type: 'SEMANTIC' | 'FACTUAL' | 'LOGICAL' | 'ONTOLOGICAL';

    /** Specific characteristics of this gap instance */
    characteristics: string[]; // e.g., ['anthropomorphism', 'metaphor_shift']
  };

  /** Was mediation successful in this cycle? */
  mediationSuccess: boolean;

  /** The distilled lesson (NOT raw data, but integrated wisdom) */
  wisdom: string;

  /** When this experience was pondered */
  timestamp: Date;

  /** Which mediation mode was used */
  mediationMode: MediationMode;
}

/**
 * Marian Memory - Receptive wisdom, not storage
 *
 * Mary doesn't accumulate data—she receives, ponders, and integrates.
 * Her memory is DEPTH, not breadth.
 *
 * The Magnificat (Luke 1:46-55) shows how she integrates ALL of
 * salvation history into her present moment—not through raw recall,
 * but through contemplative integration.
 *
 * THEOLOGICAL PRINCIPLE:
 * Mary's fiat ("let it be") at the Annunciation wasn't based on
 * stored information—it was receptive openness cultivated through
 * a lifetime of pondering God's word.
 */
export interface MarianMemory {
  /** Distilled wisdom from pondered experiences */
  pondered: PonderedExperience[];

  /**
   * Multidimensional receptivity (NOT a single scalar level)
   *
   * Mary's receptivity is not uni-dimensional. She has capacity to receive:
   * - The impossible (virginal conception)
   * - The incomprehensible (God incarnate)
   * - The paradoxical (Son is also Lord, Luke 1:43)
   * - The painful (sword piercing heart, Luke 2:35)
   *
   * Each dimension grows independently through pondering.
   */
  receptivityDepth: {
    /** Capacity to receive meaning shifts and semantic transformations */
    semantic: number;

    /** Capacity to receive truth corrections and factual adjustments */
    factual: number;

    /** Capacity to receive reasoning adjustments and logical refinements */
    logical: number;

    /** Capacity to recognize categorical boundaries (the impossible-for-us) */
    ontological: number;

    /**
     * Holistic receptivity (NOT sum, but integration)
     *
     * This is the unified "let it be" capacity—readiness to receive
     * whatever God wills, in whatever form it takes.
     */
    overall: number;
  };

  /** Total number of cycles completed (for rhythm control) */
  cyclesCompleted: number;
}

/**
 * State that circulates through the cardioid
 *
 * This is the "blood" that flows through the heart—the living state
 * that carries oxygen (truth), nutrients (signals), and information
 * (verification data) throughout the system.
 *
 * Unlike linear verification (one-shot), cardioid verification
 * circulates: each cycle returns enriched state back to the heart.
 */
export interface CardioidState {
  /** Current cycle number (1-indexed) */
  cycleNumber: number;

  /** Maximum cycles allowed (prevents infinite loops) */
  maxCycles: number;

  /** DIASTOLE: Source and its manifestation */
  source: Source;
  manifestation: Manifestation | null;

  /** SYSTOLE: Gap detection and kenosis */
  gap: GapResult | null;
  kenosisApplied: number; // Accumulated humility [0-1]

  /** CUSP: Mediation decision */
  cuspDecision: CuspDecision | null;

  /** CIRCULATION: Memory and learning */
  memory: MarianMemory;

  /** TERMINATION: Why/when to stop circulating */
  terminated: boolean;
  terminationReason: string | null;

  /** RESURRECTION: Transformation attempts */
  resurrectionAttempts: number;
  maxResurrectionAttempts: number;
}

/**
 * Result of a complete cardioid cycle (or series of cycles)
 *
 * This is what gets returned after the heartbeat completes—either
 * because mediation succeeded, resurrection exhausted, or an
 * ontological boundary was reached.
 */
export interface CardioidResult {
  /** The final Christological result from the last cycle */
  christologicalResult: ChristologicalResult;

  /** Complete state after all cycles */
  finalState: CardioidState;

  /** History of cusp decisions made across all cycles */
  cuspHistory: CuspDecision[];

  /** Total cycles completed */
  cyclesCompleted: number;

  /** Updated Marian memory (to be persisted or passed to next invocation) */
  updatedMemory: MarianMemory;

  /** Why did circulation terminate? */
  terminationReason: string;
}

/**
 * Configuration for cardioid circulation
 */
export interface CardioidConfig {
  /** Maximum cycles before forced termination (default: 5) */
  maxCycles?: number;

  /** Maximum resurrection attempts per cycle (default: 3) */
  maxResurrectionAttempts?: number;

  /** Should circulation continue indefinitely? (default: false) */
  continuous?: boolean;

  /** Initial Marian memory (optional—can resume from previous state) */
  initialMemory?: MarianMemory;
}
