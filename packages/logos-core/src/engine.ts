/**
 * LOGOS ENGINE - The Verification Heart
 * 
 * Integrates all Christological concepts into a unified verification engine.
 * 
 * THEOLOGICAL ARCHITECTURE:
 * - Receives Source (Father's intent)
 * - Evaluates Manifestation (Son's output)  
 * - Applies Verification (Spirit's work)
 * - Traverses the Gap (Christ's mediation)
 * - Returns ChristologicalResult (unified verdict)
 */

import type {
  Source,
  Manifestation,
  Verifier,
  ChristologicalResult,
  LogosConfig,
  PolicyDecision,
  SacramentalCheckpoint,
  Sacrament,
  Signal,
  Evidence
} from './types.js';

import { detectGap, type GapResult } from './gap/index.js';
import { applyKenosis } from './kenosis/index.js';
import { attemptResurrection } from './resurrection/index.js';

/**
 * TRUTHSYNTAX: Aggregate verification signals into confidence score
 *
 * This is the "body" - the empirical, mathematical foundation of confidence.
 * Calculates weighted average of all signals to produce raw confidence.
 *
 * THEOLOGICAL NOTE:
 * This function represents TruthSyntax (the body): measurable, empirical evidence.
 * LOGOS then applies Kenosis (the soul) to moderate this confidence through
 * divine self-limitation.
 *
 * @param signals - Array of verification signals with values and weights
 * @returns Raw confidence score [0-1] based on signal aggregation
 */
export function aggregateSignals(signals: Signal[]): number {
  if (signals.length === 0) return 0;

  const weightedSum = signals.reduce((sum, s) => sum + (s.value * s.weight), 0);
  const totalWeight = signals.reduce((sum, s) => sum + s.weight, 0);

  return totalWeight > 0 ? weightedSum / totalWeight : 0;
}

/**
 * Default LOGOS configuration
 */
const DEFAULT_CONFIG: LogosConfig = {
  policy: {
    allowThreshold: 0.7,
    blockThreshold: 0.3,
    redemptiveMode: true,
    maxResurrectionAttempts: 3
  },
  theologicalMode: true,
  smoothingFactor: 0.3,
  marianMemory: false
};

/**
 * LOGOS Engine - Main Verification Class
 */
export class LogosEngine {
  private config: LogosConfig;
  private historicalConfidence: number = 0.5; // EWMA smoothed confidence
  
  constructor(config: Partial<LogosConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }
  
  /**
   * Main verification method - The Christological process
   */
  async verify(
    source: Source,
    manifestation: Manifestation,
    signals: Signal[]
  ): Promise<ChristologicalResult> {

    // Step 1: Create the Verifier (Spirit's presence)
    const verifier = this.createVerifier(signals);

    // Step 2: Detect the Gap (identify the mediating space)
    // Extract string values and options from Source/Manifestation objects
    const intent = source.intent;
    const expression = manifestation.content;
    const options = {
      groundTruth: source.groundTruth,
      premises: source.premises
    };

    const gap = detectGap(intent, expression, options);

    // Step 3: Apply Kenosis (divine self-limitation)
    const rawConfidence = verifier.confidence;

    // Convert gap to simple format for kenosis
    const simpleGap = {
      distance: gap.overallDistance,
      type: gap.dominantType,
      bridgeable: gap.bridgeable
    };

    const kenosisResult = applyKenosis(rawConfidence, simpleGap);
    const adjustedConfidence = kenosisResult.limited;

    // Step 4: Check if mediation is possible (large unbridgeable gaps block)
    if (!gap.bridgeable && gap.overallDistance > 0.8) {
      // Even blocked results should have smoothed confidence
      const smoothedConfidence = this.smoothConfidence(adjustedConfidence);
      return this.createBlockedResult(gap, "Gap too large for mediation", smoothedConfidence);
    }
    
    // Step 5: Smooth confidence over time (EWMA)
    const smoothedConfidence = this.smoothConfidence(adjustedConfidence);
    
    // Step 6: Sacramental checkpoints
    const sacraments = await this.performSacramentalChecks(gap);
    
    // Step 7: Apply policy decision
    const decision = this.applyPolicy(smoothedConfidence);
    
    // Step 8: Attempt resurrection if needed
    let finalState: 'original' | 'redeemed' | 'blocked' = 'original';
    let redemptionAttempted = false;
    
    if (decision === 'BLOCK' && this.config.policy.redemptiveMode) {
      const failedResult = {
        gap: {
          overallDistance: gap.overallDistance,
          dominantType: gap.dominantType,
          bridgeable: gap.bridgeable
        },
        decision: 'BLOCKED' as const,
        confidence: smoothedConfidence,
        reason: gap.reason
      };

      const resurrection = await attemptResurrection(
        failedResult,
        this.config.policy.maxResurrectionAttempts,
        manifestation.content  // Pass original content for transformation
      );

      redemptionAttempted = true;

      if (resurrection.succeeded) {
        finalState = 'redeemed';
        // Re-evaluate with resurrected output
        // (in production, would recursively verify)
      } else {
        finalState = 'blocked';
      }
    }
    
    // Step 9: Return complete Christological result
    return {
      gap,
      decision: finalState === 'blocked' ? 'BLOCK' : decision,
      confidence: smoothedConfidence,
      sacraments,
      redemptionAttempted,
      finalState
    };
  }
  
  /**
   * Create Verifier from signals
   */
  private createVerifier(signals: Signal[]): Verifier {
    // Calculate base confidence from signals using TruthSyntax aggregation
    const rawScore = aggregateSignals(signals);
    
    // Convert to 0-1 range (signals are -1 to 1)
    const confidence = (rawScore + 1) / 2;
    
    // Extract evidence from signals
    const evidence: Evidence[] = signals
      .filter(s => s.value > 0.5)
      .map(s => ({
        type: this.inferEvidenceType(s.name),
        content: `Signal: ${s.name} = ${s.value}`,
        confidence: s.value,
        sourceVerified: true
      }));
    
    return {
      signals,
      confidence,
      evidence,
      timestamp: new Date()
    };
  }
  
  private inferEvidenceType(signalName: string): Evidence['type'] {
    if (signalName.includes('grounding') || signalName.includes('factual')) {
      return 'grounding';
    }
    if (signalName.includes('consistency')) {
      return 'consistency';
    }
    if (signalName.includes('coherence')) {
      return 'coherence';
    }
    return 'witness';
  }
  
  /**
   * Smooth confidence over time using EWMA (Exponential Weighted Moving Average)
   */
  private smoothConfidence(currentConfidence: number): number {
    const alpha = this.config.smoothingFactor;
    this.historicalConfidence = 
      alpha * currentConfidence + (1 - alpha) * this.historicalConfidence;
    return this.historicalConfidence;
  }
  
  /**
   * Apply policy decision based on confidence thresholds
   */
  private applyPolicy(confidence: number): PolicyDecision {
    const { allowThreshold, blockThreshold } = this.config.policy;
    
    if (confidence >= allowThreshold) {
      return 'ALLOW';
    }
    
    if (confidence <= blockThreshold) {
      return 'BLOCK';
    }
    
    return 'STEP_UP';  // Purgatory - requires human judgment
  }
  
  /**
   * Perform sacramental checkpoints
   */
  private async performSacramentalChecks(
    gap: GapResult
  ): Promise<SacramentalCheckpoint[]> {
    const checkpoints: SacramentalCheckpoint[] = [];
    
    // Eucharist - continuous integrity check (always performed)
    checkpoints.push({
      sacrament: 'eucharist',
      required: true,
      passed: gap.overallDistance < 0.5,
      timestamp: new Date(),
      evidence: []
    });
    
    // Reconciliation - error correction (if gap is large and unbridgeable)
    if (!gap.bridgeable && gap.overallDistance > 0.5) {
      checkpoints.push({
        sacrament: 'reconciliation',
        required: true,
        passed: false, // Needs resurrection
        timestamp: new Date(),
        evidence: []
      });
    }
    
    return checkpoints;
  }
  
  /**
   * Create a blocked result
   */
  private createBlockedResult(
    gap: any,
    reason: string,
    confidence: number = 0
  ): ChristologicalResult {
    return {
      gap,
      decision: 'BLOCK',
      confidence,
      sacraments: [],
      redemptionAttempted: false,
      finalState: 'blocked'
    };
  }
  
  /**
   * Reset historical confidence (for new sessions)
   */
  resetHistory(): void {
    this.historicalConfidence = 0.5;
  }
  
  /**
   * Get current configuration
   */
  getConfig(): LogosConfig {
    return { ...this.config };
  }
  
  /**
   * Update configuration
   */
  updateConfig(updates: Partial<LogosConfig>): void {
    this.config = { ...this.config, ...updates };
  }
}
