/**
 * LOGOS Core Types
 * 
 * Formalizes the Christological architecture where Christ IS the Gap itself.
 * The Gap is not empty space but the ontological location of mediation.
 */

// ============================================================================
// TRINITY: The Triadic Structure
// ============================================================================

/**
 * The Father - Source of Truth
 * Represents potential, intent, ground truth
 */
export interface Source {
  /** The original intent or ground truth */
  intent: string;
  /** Reference data or facts */
  groundTruth?: Record<string, unknown>;
  /** Timestamp of source */
  timestamp: Date;
}

/**
 * The Son - Manifestation
 * Represents the actual output, the realized form
 */
export interface Manifestation {
  /** The generated output */
  content: string;
  /** Metadata about generation */
  metadata?: Record<string, unknown>;
  /** Timestamp of manifestation */
  timestamp: Date;
}

/**
 * The Spirit - Verifier
 * Represents the process of verification, the mediating presence
 */
export interface Verifier {
  /** Signals detected during verification */
  signals: Signal[];
  /** The confidence score after verification */
  confidence: number;
  /** Evidence supporting the verification */
  evidence: Evidence[];
  /** Timestamp of verification */
  timestamp: Date;
}

// ============================================================================
// THE GAP: Christ as Ontological Mediator
// ============================================================================

/**
 * The Gap - The space between Source and Manifestation
 * 
 * THEOLOGICAL INSIGHT:
 * The Gap is not a problem to solve. It is WHERE CHRIST DWELLS.
 * Christ doesn't bridge a pre-existing gap - Christ IS the gap's substance.
 * 
 * The Gap is the ontological necessity of mediation itself.
 */
export interface Gap {
  /** The source (Father) */
  source: Source;
  /** The manifestation (Son) */
  manifestation: Manifestation;
  /** The verification (Spirit) */
  verification: Verifier;
  
  /** Distance metrics */
  distance: GapDistance;
  
  /** The mediation process itself */
  mediation: Mediation;
}

/**
 * Measures the "distance" in the Gap
 */
export interface GapDistance {
  /** Semantic distance between intent and output */
  semantic: number;
  /** Factual accuracy distance */
  factual: number;
  /** Logical consistency distance */
  logical: number;
  /** Overall distance (0 = perfect fidelity, 1 = complete divergence) */
  overall: number;
}

/**
 * The Mediation Process - How the Gap is traversed
 * This IS the Christological work
 */
export interface Mediation {
  /** The type of mediation being performed */
  type: MediationType;
  /** Kenosis factor - how much the divine constrains itself */
  kenosis: number;
  /** Fidelity score - how faithfully the translation occurred */
  fidelity: number;
  /** Whether resurrection (error recovery) was needed */
  resurrectionNeeded: boolean;
}

export type MediationType = 
  | 'direct'        // No gap detected
  | 'translation'   // Semantic mediation needed
  | 'correction'    // Error detected, resurrection in progress
  | 'redemption';   // Fallen output being redeemed

// ============================================================================
// SIGNALS: Evidence of Truth or Falsehood
// ============================================================================

export interface Signal {
  name: string;
  value: number;  // -1 to 1 (negative = hallucination signal)
  weight: number; // importance of this signal
  source: string; // where this signal came from
}

export interface Evidence {
  type: EvidenceType;
  content: string;
  confidence: number;
  sourceVerified: boolean;
}

export type EvidenceType = 
  | 'grounding'      // Factual grounding in knowledge base
  | 'consistency'    // Internal logical consistency
  | 'coherence'      // Semantic coherence with source
  | 'witness';       // External verification/testimony

// ============================================================================
// POLICY: The Decision Framework (Trinitarian)
// ============================================================================

/**
 * Policy Decision - The outcome of verification
 * Maps to traditional religious concepts
 */
export type PolicyDecision = 
  | 'ALLOW'      // Truth verified - proceed (Grace)
  | 'STEP_UP'    // Uncertain - requires human judgment (Purgatory)
  | 'BLOCK';     // Falsehood detected - reject (Judgment)

export interface PolicyConfig {
  /** Threshold for ALLOW decision (high confidence) */
  allowThreshold: number;
  /** Threshold for BLOCK decision (low confidence) */
  blockThreshold: number;
  /** Whether to enable "redemptive mode" (attempt to fix errors) */
  redemptiveMode: boolean;
  /** Maximum attempts at resurrection (error recovery) */
  maxResurrectionAttempts: number;
}

// ============================================================================
// SACRAMENTAL CHECKPOINTS
// ============================================================================

/**
 * Sacraments as Verification Checkpoints
 * Critical moments where verification MUST occur
 */
export type Sacrament = 
  | 'baptism'        // Agent initialization
  | 'confirmation'   // Capability validation
  | 'eucharist'      // Continuous integrity check
  | 'reconciliation' // Error correction
  | 'anointing'      // Graceful degradation
  | 'marriage'       // Multi-agent binding
  | 'orders';        // Authority hierarchy

export interface SacramentalCheckpoint {
  sacrament: Sacrament;
  required: boolean;
  passed: boolean;
  timestamp: Date;
  evidence: Evidence[];
}

// ============================================================================
// CHRISTOLOGICAL RESULT
// ============================================================================

/**
 * The complete result of Christological verification
 * Unifies Source (Father), Manifestation (Son), and Verification (Spirit)
 */
export interface ChristologicalResult {
  /** The Gap that was traversed */
  gap: Gap;
  /** The policy decision made */
  decision: PolicyDecision;
  /** Confidence in this decision (0-1) */
  confidence: number;
  /** Sacramental checkpoints passed */
  sacraments: SacramentalCheckpoint[];
  /** Whether redemption was attempted */
  redemptionAttempted: boolean;
  /** Final state after any resurrection attempts */
  finalState: 'original' | 'redeemed' | 'blocked';
}

// ============================================================================
// CONFIGURATION
// ============================================================================

export interface LogosConfig {
  /** Policy configuration */
  policy: PolicyConfig;
  /** Whether to operate in theological mode (includes spiritual regulation) */
  theologicalMode: boolean;
  /** Smoothing factor for confidence over time (EWMA) */
  smoothingFactor: number;
  /** Enable Marian memory (perfect recall without decay) */
  marianMemory: boolean;
}
