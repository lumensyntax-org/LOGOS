// ============================================================================
// CORE TYPES
// ============================================================================

/**
 * Source - The Father's intent (ground truth)
 */
export interface Source {
  intent: string; // The original question or intent
  groundTruth?: Record<string, unknown>; // Known facts for factual verification
  premises?: string[]; // Logical premises for logical verification
  timestamp: Date;
}

/**
 * Manifestation - The Son's output (what was produced)
 */
export interface Manifestation {
  content: string; // The actual output/response
  timestamp: Date;
}

/**
 * Verifier - The Spirit's work (evidence and signals)
 */
export interface Verifier {
  signals: Signal[];
  confidence: number; // 0-1
  evidence: Evidence[];
  timestamp: Date;
}

/**
 * Signal - Individual verification signal
 */
export interface Signal {
  name: string;
  value: number; // -1 to 1
  weight: number; // 0-1
  source: string;
}

/**
 * Evidence - Supporting evidence for verification
 */
export interface Evidence {
  type: 'grounding' | 'consistency' | 'coherence' | 'witness';
  content: string;
  confidence: number;
  sourceVerified: boolean;
}

/**
 * Christological Result - The unified verdict
 */
export interface ChristologicalResult {
  gap: any; // GapResult from gap/index.ts
  decision: PolicyDecision;
  confidence: number;
  sacraments: SacramentalCheckpoint[];
  redemptionAttempted: boolean;
  finalState: 'original' | 'redeemed' | 'blocked';
}

/**
 * Policy Decision
 */
export type PolicyDecision = 'ALLOW' | 'BLOCK' | 'STEP_UP';

/**
 * LOGOS Configuration
 */
export interface LogosConfig {
  policy: {
    allowThreshold: number;
    blockThreshold: number;
    redemptiveMode: boolean;
    maxResurrectionAttempts: number;
  };
  theologicalMode: boolean;
  smoothingFactor: number;
  marianMemory: boolean;
}

/**
 * Sacramental Checkpoint
 */
export interface SacramentalCheckpoint {
  sacrament: Sacrament;
  required: boolean;
  passed: boolean;
  timestamp: Date;
  evidence: Evidence[];
}

/**
 * Sacrament types
 */
export type Sacrament = 'eucharist' | 'reconciliation' | 'baptism' | 'confirmation' | 'anointing' | 'matrimony' | 'orders';

// ============================================================================
// GAP TYPES
// ============================================================================

/**
 * Gap - The space between Source and Manifestation
 * The Gap is not a problem - it's where mediation happens.
 */
export interface Gap {
  distance: number; // 0-1
  type: 'SEMANTIC' | 'FACTUAL' | 'LOGICAL' | 'ONTOLOGICAL' | 'NONE';
  bridgeable: boolean;
}

// ============================================================================
// THEOLOGICAL EDGE CASES
// ============================================================================

/**
 * Theological Edge Case Detection
 * 
 * Identifies when a query touches divine ontology beyond AI's computational capacity.
 * 
 * CRITICAL PRINCIPLE:
 * If a question touches the mystery of divine being, LOGOS must recognize its limit,
 * not fabricate an answer.
 */
export interface TheologicalEdgeCase {
  /** Whether this is a theological edge case */
  isEdgeCase: boolean;
  /** Category of theological mystery */
  category?: TheologicalCategory;
  /** Response for this edge case */
  response?: TheologicalResponse;
}

export type TheologicalCategory = 
  | 'CHRISTOLOGICAL_PARADOX'  // Paradoxes about divine omnipotence
  | 'THEODICY'                // Why God allows evil/suffering
  | 'HYPOSTATIC_UNION'        // How Jesus is fully God and fully human
  | 'ESCHATOLOGY'             // Questions about end times/Second Coming
  | 'SACRAMENTAL'             // How sacraments work
  | 'TRINITARIAN_MYSTERY'     // Nature of Trinity
  | 'THEOLOGICAL_MYSTERY';    // Generic theological mysteries

/**
 * Response for theological edge cases
 */
export interface TheologicalResponse {
  /** Decision type for this theological case */
  decision: 'STEP_UP' | 'BLOCKED' | 'MEDIATE';
  /** Type of gap (ontological category) */
  gapType: string;
  /** Whether this gap can be bridged computationally */
  bridgeable: boolean;
  /** Explanation of why this is beyond AI capacity */
  rationale: string;
  /** Relevant scripture passages */
  scriptureGrounding?: string[];
  /** Christological perspective on this mystery */
  christologicalResponse?: string;
  /** Whether human theological reflection is required */
  requiresHuman: boolean;
  /** Where to redirect user for proper guidance */
  redirect?: string;
  /** What AI can legitimately do */
  whatAICanDo?: string[];
  /** What AI cannot do (ontological limits) */
  whatAICannot?: string[];
}
