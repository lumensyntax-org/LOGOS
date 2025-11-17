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

import { detectGap } from './gap/detector.js';
import { applyKenosis, kenosisPermitsMediation } from './gap/kenosis.js';
import { attemptResurrection } from './gap/resurrection.js';

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
    const gap = detectGap(source, manifestation, verifier);
    
    // Step 3: Apply Kenosis (divine self-limitation)
    const rawConfidence = verifier.confidence;
    const adjustedConfidence = applyKenosis(rawConfidence, gap.distance);
    
    // Step 4: Check if mediation is possible
    if (!kenosisPermitsMediation(gap.mediation)) {
      return this.createBlockedResult(gap, "Gap too large for mediation");
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
      const resurrection = await attemptResurrection(
        gap, 
        this.config.policy.maxResurrectionAttempts
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
    // Calculate base confidence from signals
    const weightedSum = signals.reduce((sum, s) => sum + (s.value * s.weight), 0);
    const totalWeight = signals.reduce((sum, s) => sum + s.weight, 0);
    const rawScore = totalWeight > 0 ? weightedSum / totalWeight : 0;
    
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
    gap: any
  ): Promise<SacramentalCheckpoint[]> {
    const checkpoints: SacramentalCheckpoint[] = [];
    
    // Eucharist - continuous integrity check (always performed)
    checkpoints.push({
      sacrament: 'eucharist',
      required: true,
      passed: gap.distance.overall < 0.5,
      timestamp: new Date(),
      evidence: []
    });
    
    // Reconciliation - error correction (if gap is large)
    if (gap.mediation.type === 'correction' || gap.mediation.type === 'redemption') {
      checkpoints.push({
        sacrament: 'reconciliation',
        required: true,
        passed: gap.mediation.resurrectionNeeded,
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
    reason: string
  ): ChristologicalResult {
    return {
      gap,
      decision: 'BLOCK',
      confidence: 0,
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
