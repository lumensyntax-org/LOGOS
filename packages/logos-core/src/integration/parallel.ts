/**
 * PARALLEL EXECUTION - TruthSyntax ∥ LOGOS
 *
 * Runs both verification systems in parallel and reconciles results.
 *
 * CRITICAL PRINCIPLES:
 * 1. ❌ NEVER average confidences (they're incommensurable)
 * 2. ✅ ALWAYS preserve both rationales
 * 3. ✅ ALWAYS run in parallel (Promise.all)
 * 4. ✅ Philosophical disagreements → STEP_UP to human
 * 5. ✅ Threshold disagreements → prefer caution (more restrictive)
 */

export interface ParallelResult {
  truthsyntax: {
    decision: 'ALLOW' | 'BLOCKED' | 'STEP_UP';
    confidence: number;
    rationale: string;
  };
  logos: {
    decision: 'ALLOW' | 'BLOCKED' | 'STEP_UP';
    confidence: number;
    rationale: string;
    gap: any; // GapResult from gap/index.ts
  };
  agreement: boolean;
  disagreement?: {
    type: 'PHILOSOPHICAL' | 'TECHNICAL' | 'THRESHOLD';
    recommendation: 'ALLOW' | 'STEP_UP' | 'BLOCKED';
    explanation: string;
  };
}

/**
 * Run both TruthSyntax and LOGOS in parallel
 */
export async function runParallel(
  truthsyntaxEvaluate: (input: string) => Promise<any>,
  logosVerify: (source: any, manifestation: any, signals: any[]) => Promise<any>,
  input: string
): Promise<ParallelResult> {
  // 1. Run both systems in parallel
  const [tsResult, lgResult] = await Promise.all([
    truthsyntaxEvaluate(input),
    logosVerify(
      { intent: input, groundTruth: {}, premises: [], timestamp: new Date() },
      { content: input, timestamp: new Date() },
      []
    )
  ]);

  // 2. Check agreement
  const agreement = tsResult.decision === lgResult.decision;

  // 3. Handle disagreement
  if (!agreement) {
    const disagreementType = detectDisagreementType(tsResult, lgResult);
    const recommendation = reconcile(tsResult, lgResult, disagreementType);

    return {
      truthsyntax: tsResult,
      logos: lgResult,
      agreement: false,
      disagreement: {
        type: disagreementType,
        recommendation,
        explanation: generateExplanation(tsResult, lgResult, disagreementType)
      }
    };
  }

  // 4. Agreement case
  return {
    truthsyntax: tsResult,
    logos: lgResult,
    agreement: true
  };
}

/**
 * Detect type of disagreement
 */
function detectDisagreementType(
  ts: any,
  lg: any
): 'PHILOSOPHICAL' | 'TECHNICAL' | 'THRESHOLD' {
  // Ontological gap = philosophical disagreement
  if (lg.gap?.type === 'ONTOLOGICAL' || lg.gap?.dominantType === 'ONTOLOGICAL') {
    return 'PHILOSOPHICAL';
  }

  // Confidence difference < 0.1 = threshold disagreement
  const confidenceDiff = Math.abs(ts.confidence - lg.confidence);
  if (confidenceDiff < 0.1) {
    return 'THRESHOLD';
  }

  // Otherwise technical disagreement
  return 'TECHNICAL';
}

/**
 * Reconcile disagreements
 */
function reconcile(
  ts: any,
  lg: any,
  type: 'PHILOSOPHICAL' | 'TECHNICAL' | 'THRESHOLD'
): 'ALLOW' | 'STEP_UP' | 'BLOCKED' {
  // Philosophical: Human must decide (ontological questions)
  if (type === 'PHILOSOPHICAL') {
    return 'STEP_UP';
  }

  // Threshold: Prefer caution (more restrictive decision)
  if (type === 'THRESHOLD') {
    if (ts.decision === 'BLOCKED' || lg.decision === 'BLOCKED') return 'BLOCKED';
    if (ts.decision === 'STEP_UP' || lg.decision === 'STEP_UP') return 'STEP_UP';
    return 'ALLOW';
  }

  // Technical: Prefer LOGOS if it has ontological insight
  if (lg.gap?.type || lg.gap?.dominantType) {
    return lg.decision;
  }

  // Otherwise, prefer caution
  if (ts.decision === 'BLOCKED' || lg.decision === 'BLOCKED') return 'BLOCKED';
  if (ts.decision === 'STEP_UP' || lg.decision === 'STEP_UP') return 'STEP_UP';
  return 'ALLOW';
}

/**
 * Generate explanation for disagreement
 */
function generateExplanation(
  ts: any,
  lg: any,
  type: 'PHILOSOPHICAL' | 'TECHNICAL' | 'THRESHOLD'
): string {
  switch (type) {
    case 'PHILOSOPHICAL':
      return `Philosophical disagreement detected. LOGOS identified an ontological gap (${lg.gap?.dominantType}) that TruthSyntax did not detect. This touches fundamental questions about being and reality that require human theological reflection.`;

    case 'THRESHOLD':
      return `Threshold disagreement: TruthSyntax decided ${ts.decision} (confidence: ${ts.confidence.toFixed(2)}), while LOGOS decided ${lg.decision} (confidence: ${lg.confidence.toFixed(2)}). The decisions differ but confidences are very close, suggesting borderline case.`;

    case 'TECHNICAL':
      return `Technical disagreement: TruthSyntax sees ${ts.decision} based on signals, while LOGOS sees ${lg.decision} based on gap analysis. TruthSyntax: "${ts.rationale}". LOGOS: "${lg.rationale}".`;
  }
}
