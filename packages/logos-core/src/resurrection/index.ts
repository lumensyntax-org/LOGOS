/**
 * RESURRECTION - Transformation Through Death
 *
 * Romans 6:4 - "Walk in newness of life"
 * 1 Corinthians 15:42-44 - "Sown in weakness, raised in power"
 *
 * CRITICAL THEOLOGICAL PRINCIPLE:
 * Resurrection is NOT resuscitation (return to same state).
 * Resurrection is TRANSFORMATION (new mode of existence through death).
 *
 * Resurrection learns from death, doesn't just retry.
 */

export interface ResurrectionAttempt {
  attemptNumber: number;
  strategy: string;
  learnings: string[];
  transformation: string;
}

export interface ResurrectionResult {
  succeeded: boolean;
  attempts: ResurrectionAttempt[];
  finalState: 'original' | 'transformed' | 'abandoned';
  transformation?: {
    from: string;
    to: string;
    how: string;
    preserves: string[];
  };
  learnings: string[];
  constraint: 'Cannot use same method that failed';
}

interface FailedResult {
  gap: {
    overallDistance: number;
    dominantType: 'SEMANTIC' | 'FACTUAL' | 'LOGICAL' | 'ONTOLOGICAL' | 'NONE';
    bridgeable: boolean;
  };
  decision: 'BLOCKED';
  confidence: number;
  reason: string;
}

/**
 * Extract learnings from failure
 */
function extractLearnings(failed: FailedResult, attemptNumber: number): string[] {
  const learnings: string[] = [];

  // Learn from gap type
  learnings.push(`Gap type is ${failed.gap.dominantType}, distance ${failed.gap.overallDistance.toFixed(2)}`);

  // Learn from bridgeability
  if (!failed.gap.bridgeable) {
    learnings.push('Gap is unbridgeable - transformation may not be possible');
  }

  // Learn from ontological gaps
  if (failed.gap.dominantType === 'ONTOLOGICAL') {
    learnings.push('ontological impossibility detected - categorical boundary cannot be crossed');
  }

  // Learn from confidence level
  if (failed.confidence < 0.2) {
    learnings.push('Very low confidence - fundamental issues present');
  }

  // Learn from previous attempts
  if (attemptNumber > 1) {
    learnings.push(`Previous ${attemptNumber - 1} attempt(s) failed - need new approach`);
  }

  return learnings;
}

/**
 * Select transformation strategy based on gap type
 */
function selectStrategy(gap: FailedResult['gap'], attemptNumber: number): string {
  const strategies: Record<string, string[]> = {
    FACTUAL: [
      'correct factual errors with ground truth evidence',
      'Cross-reference multiple evidence sources',
      'Verify against authoritative evidence sources'
    ],
    SEMANTIC: [
      'reframe using different conceptual vocabulary',
      'transform expression while preserving intent',
      'Bridge semantic gap through analogy'
    ],
    LOGICAL: [
      'transform reasoning chain from valid premises',
      'improve reasoning by eliminating logical fallacies',
      'Build new argument with sound inference'
    ],
    ONTOLOGICAL: [
      'Acknowledge categorical impossibility',
      'Redirect to appropriate ontological category',
      'Accept limitation and defer to human wisdom'
    ]
  };

  const typeStrategies = strategies[gap.dominantType] || ['Generic transformation'];
  const index = (attemptNumber - 1) % typeStrategies.length;

  return typeStrategies[index] || 'Generic transformation';
}

/**
 * Transformation function type
 *
 * External integrations (like Gemini) can provide a real transformation function
 * that takes the original content and strategy, then returns transformed content.
 */
export type TransformFunction = (
  originalContent: string,
  strategy: string
) => Promise<string>;

/**
 * Apply transformation strategy
 *
 * This is a simplified implementation - in production would actually
 * transform content based on strategy.
 *
 * If a transformFunction is provided (e.g., from Gemini), it will be used
 * for real content transformation. Otherwise, falls back to probabilistic stub.
 */
async function applyTransformation(
  strategy: string,
  gap: FailedResult['gap'],
  learnings: string[],
  originalContent: string,
  transformFunction?: TransformFunction
): Promise<{
  success: boolean;
  transformation: string;
  transformedContent?: string;
}> {
  // Ontological gaps cannot be transformed
  if (gap.dominantType === 'ONTOLOGICAL') {
    return {
      success: false,
      transformation: 'Attempted transformation but ontological barrier remains'
    };
  }

  // Unbridgeable gaps are very difficult
  if (!gap.bridgeable && gap.overallDistance > 0.8) {
    return {
      success: false,
      transformation: 'Gap too large to bridge even with transformation'
    };
  }

  // If real transformation function provided, use it
  if (transformFunction) {
    try {
      const transformedContent = await transformFunction(originalContent, strategy);

      // Consider transformation successful if content actually changed
      const success = transformedContent !== originalContent && transformedContent.length > 0;

      return {
        success,
        transformation: success
          ? `Successfully applied "${strategy}" to bridge ${gap.dominantType} gap`
          : `Attempted "${strategy}" but transformation produced no change`,
        transformedContent: success ? transformedContent : undefined
      };
    } catch (error) {
      return {
        success: false,
        transformation: `Transformation failed: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  // Fallback: probabilistic stub (for tests without Gemini)
  const successProbability = 1 - gap.overallDistance;
  const success = Math.random() < successProbability;

  const transformation = success
    ? `Successfully applied "${strategy}" to bridge ${gap.dominantType} gap`
    : `Attempted "${strategy}" but gap remains`;

  return { success, transformation };
}

/**
 * Perform single resurrection attempt
 */
async function performAttempt(
  failed: FailedResult,
  attemptNumber: number,
  originalContent: string,
  transformFunction?: TransformFunction
): Promise<ResurrectionAttempt & { transformedContent?: string }> {
  // Extract learnings
  const learnings = extractLearnings(failed, attemptNumber);

  // Select strategy (must be different each time - "Cannot use same method that failed")
  const strategy = selectStrategy(failed.gap, attemptNumber);

  // Apply transformation (with optional Gemini integration)
  const result = await applyTransformation(
    strategy,
    failed.gap,
    learnings,
    originalContent,
    transformFunction
  );

  return {
    attemptNumber,
    strategy,
    learnings,
    transformation: result.transformation,
    transformedContent: result.transformedContent
  };
}

/**
 * Attempt resurrection (transforming failure into success)
 *
 * @param failed - The failed result to resurrect
 * @param maxAttempts - Maximum resurrection attempts
 * @param originalContent - The original content that failed (to be transformed)
 * @param transformFunction - Optional function for real content transformation (e.g., Gemini)
 * @returns ResurrectionResult with attempts and final state
 */
export async function attemptResurrection(
  failed: FailedResult,
  maxAttempts: number,
  originalContent: string = '',
  transformFunction?: TransformFunction
): Promise<ResurrectionResult> {
  // Handle zero attempts
  if (maxAttempts === 0) {
    return {
      succeeded: false,
      attempts: [],
      finalState: 'original',
      learnings: [],
      constraint: 'Cannot use same method that failed'
    };
  }

  const attempts: ResurrectionAttempt[] = [];
  const allLearnings: string[] = [];
  let lastTransformedContent: string | undefined;

  // Perform resurrection attempts
  for (let i = 1; i <= maxAttempts; i++) {
    const attempt = await performAttempt(failed, i, originalContent, transformFunction);
    attempts.push(attempt);

    // Store transformed content from this attempt
    if (attempt.transformedContent) {
      lastTransformedContent = attempt.transformedContent;
    }

    // Accumulate learnings
    allLearnings.push(...attempt.learnings);

    // Check if transformation succeeded
    if (attempt.transformation.includes('Successfully')) {
      // Success! Resurrection achieved
      return {
        succeeded: true,
        attempts,
        finalState: 'transformed',
        transformation: {
          from: originalContent || failed.reason,
          to: lastTransformedContent || 'Corrected through resurrection',
          how: attempt.strategy,
          preserves: ['Core intent', 'Essential meaning']
        },
        learnings: allLearnings,
        constraint: 'Cannot use same method that failed'
      };
    }

    // Ontological gaps cannot be resurrected (but still try all attempts to learn)
    if (failed.gap.dominantType === 'ONTOLOGICAL' && i === 1) {
      allLearnings.push('Ontological gaps are categorical impossibilities - cannot be resurrected');
    }

    // Note: We don't break early even for unbridgeable gaps
    // Each attempt provides learning value
  }

  // All attempts exhausted without success
  return {
    succeeded: false,
    attempts,
    finalState: 'abandoned',
    learnings: allLearnings,
    constraint: 'Cannot use same method that failed'
  };
}
