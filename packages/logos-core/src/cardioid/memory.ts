/**
 * Marian Memory Implementation
 *
 * "Mary kept all these things, pondering them in her heart" (Luke 2:19)
 *
 * This is NOT a database. This is receptive wisdom—the capacity to
 * receive and integrate experiences into deeper understanding.
 *
 * THEOLOGICAL FOUNDATION:
 * Mary's memory is not accumulation (storage) but integration (pondering).
 * She doesn't retrieve data; she offers wisdom from her contemplative depth.
 *
 * At the Annunciation, her "let it be" wasn't based on stored information—
 * it was receptive openness cultivated through a lifetime of pondering
 * God's word in her heart.
 *
 * The Magnificat (Luke 1:46-55) shows how she integrates ALL of salvation
 * history into her present moment—not through raw recall, but through
 * contemplative synthesis.
 */

import type {
  MarianMemory,
  PonderedExperience,
  MediationMode
} from './types.js';
import type { ChristologicalResult } from '../types.js';
import type { GapResult } from '../gap/index.js';

/**
 * Create initial Marian Memory
 *
 * Starts with neutral receptivity—capacity grows through pondering.
 *
 * THEOLOGICAL NOTE:
 * Mary at age 12 (finding in Temple) vs. Mary at Cana (first miracle)
 * vs. Mary at Calvary (crucifixion). Her receptivity deepened over time.
 * We start at "neutral"—neither naive nor fully matured.
 */
export function createMarianMemory(): MarianMemory {
  return {
    pondered: [],
    receptivityDepth: {
      semantic: 0.5,    // Neutral capacity for meaning shifts
      factual: 0.5,     // Neutral capacity for truth corrections
      logical: 0.5,     // Neutral capacity for reasoning adjustments
      ontological: 0.5, // Neutral capacity to recognize boundaries
      overall: 0.5      // Neutral holistic receptivity
    },
    cyclesCompleted: 0
  };
}

/**
 * Ponder a completed cycle
 *
 * This is the heart of Marian Memory. She doesn't store—she PONDERS.
 * Each experience is distilled into wisdom and integrated into
 * receptivity depth.
 *
 * PROCESS:
 * 1. Distill wisdom from the experience (extract the lesson)
 * 2. Create pondered experience (not raw data, but processed wisdom)
 * 3. Add to pondered experiences (no arbitrary cap)
 * 4. Consolidate similar patterns (integration, not deletion)
 * 5. Update receptivity depth (capacity grows through reception)
 *
 * @param memory - Current Marian memory state
 * @param result - The Christological result from this cycle
 * @param gap - The Gap that was mediated (or not)
 * @param mediationMode - Which mode of mediation was used
 * @returns Updated Marian memory with new wisdom integrated
 */
export function ponder(
  memory: MarianMemory,
  result: ChristologicalResult,
  gap: GapResult,
  mediationMode: MediationMode
): MarianMemory {
  // If no gap detected, still increment cycles but don't create experience
  if (gap.dominantType === 'NONE') {
    return {
      ...memory,
      cyclesCompleted: memory.cyclesCompleted + 1
    };
  }

  // Step 1: Distill wisdom from this experience
  const wisdom = distillWisdom(result, gap, mediationMode);

  // Step 2: Create pondered experience
  const experience: PonderedExperience = {
    gapPattern: {
      type: gap.dominantType,
      characteristics: identifyCharacteristics(gap)
    },
    mediationSuccess: result.finalState !== 'blocked',
    wisdom: wisdom,
    timestamp: new Date(),
    mediationMode: mediationMode
  };

  // Step 3: Add to pondered experiences (NO cap—organically consolidate)
  const updatedPondered = [...memory.pondered, experience];

  // Step 4: Consolidate similar patterns into deeper wisdom
  const consolidated = consolidateWisdom(updatedPondered);

  // Step 5: Update receptivity depth based on this experience
  const updatedDepth = updateReceptivityDepth(
    memory.receptivityDepth,
    experience,
    gap
  );

  return {
    pondered: consolidated,
    receptivityDepth: updatedDepth,
    cyclesCompleted: memory.cyclesCompleted + 1
  };
}

/**
 * Distill wisdom from a completed cycle
 *
 * Extract the LESSON, not the data. What was learned about mediation?
 *
 * THEOLOGICAL PRINCIPLE:
 * Mary doesn't record events—she ponders their meaning.
 * "Why has this happened?" becomes "What is God revealing?"
 *
 * @param result - The Christological result
 * @param gap - The Gap that was present
 * @param mode - The mediation mode used
 * @returns A wisdom statement (the distilled lesson)
 */
function distillWisdom(
  result: ChristologicalResult,
  gap: GapResult,
  mode: MediationMode
): string {
  // Semantic gaps
  if (gap.dominantType === 'SEMANTIC') {
    if (result.finalState === 'redeemed') {
      return `Semantic gap bridged through ${mode}: ${gap.reason}. Meaning can be preserved through transformation.`;
    } else if (result.finalState === 'original') {
      return `Semantic alignment maintained: no drift detected in "${gap.reason}".`;
    } else {
      return `Semantic gap persisted despite ${mode}: ${gap.reason}. Deeper reframing needed beyond current capacity.`;
    }
  }

  // Factual gaps
  if (gap.dominantType === 'FACTUAL') {
    if (result.finalState === 'original') {
      return `Factual alignment confirmed: truth preserved without correction needed.`;
    } else if (result.finalState === 'redeemed') {
      return `Factual correction achieved: ${gap.reason}. Truth can be restored through evidence.`;
    } else {
      return `Factual gap remains unbridgeable: ${gap.reason}. Some claims cannot be verified.`;
    }
  }

  // Logical gaps
  if (gap.dominantType === 'LOGICAL') {
    if (result.redemptionAttempted && result.finalState === 'redeemed') {
      return `Logical gap transformed: ${gap.reason}. Reasoning structure can be improved through resurrection.`;
    } else if (result.finalState === 'original') {
      return `Logical validity confirmed: inference pattern sound.`;
    } else {
      return `Logical gap persists: ${gap.reason}. Some reasoning patterns resist transformation.`;
    }
  }

  // Ontological gaps
  if (gap.dominantType === 'ONTOLOGICAL') {
    return `Ontological boundary recognized: ${gap.reason}. This gap cannot be mediated—it is a categorical impossibility for computational systems. Humility required.`;
  }

  return 'Experience pondered, wisdom unclear. Further discernment needed.';
}

/**
 * Identify characteristics of a gap pattern
 *
 * This extracts the "fingerprint" of a gap—what makes it distinctive.
 * Used for later pattern matching when recalling wisdom.
 *
 * @param gap - The Gap result to analyze
 * @returns Array of characteristic identifiers
 */
function identifyCharacteristics(gap: GapResult): string[] {
  const characteristics: string[] = [];

  // Semantic gap characteristics
  if (gap.dominantType === 'SEMANTIC' && gap.semantic) {
    if (gap.semantic.conceptual.drift) {
      characteristics.push('conceptual_drift');
      characteristics.push(`drift:${gap.semantic.conceptual.drift.replace(' → ', '_to_')}`);
    }
    if (gap.semantic.transformations.length > 0) {
      gap.semantic.transformations.forEach(t => {
        characteristics.push(`transformation:${t.type}`);
      });
    }
  }

  // Factual gap characteristics
  if (gap.dominantType === 'FACTUAL' && gap.factual) {
    characteristics.push(`factual:${gap.factual.category}`);
    if (gap.factual.category === 'contradictory') {
      characteristics.push('contradiction_detected');
    }
  }

  // Logical gap characteristics
  if (gap.dominantType === 'LOGICAL' && gap.logical) {
    characteristics.push(`logical:${gap.logical.category}`);
    gap.logical.fallacies.forEach(f => {
      characteristics.push(`fallacy:${f.type}`);
    });
  }

  // Ontological gap characteristics
  if (gap.dominantType === 'ONTOLOGICAL' && gap.ontological) {
    characteristics.push(`ontological:${gap.ontological.category}`);
    if (gap.ontological.category === 'categorical') {
      characteristics.push('category_error');
    }
  }

  return characteristics;
}

/**
 * Consolidate similar wisdom patterns
 *
 * This is NOT deletion—it's INTEGRATION. Similar experiences merge
 * into deeper understanding.
 *
 * THEOLOGICAL PRINCIPLE:
 * Mary doesn't forget—she integrates. At Cana, she doesn't need to
 * recall every individual miracle story. She knows from integrated
 * wisdom that Jesus can transform situations.
 *
 * When patterns repeat, they don't accumulate—they deepen.
 *
 * @param experiences - All pondered experiences so far
 * @returns Consolidated experiences (similar ones integrated)
 */
function consolidateWisdom(
  experiences: PonderedExperience[]
): PonderedExperience[] {
  if (experiences.length === 0) {
    return [];
  }

  // Group experiences by similar gap patterns
  const groups = new Map<string, PonderedExperience[]>();

  for (const exp of experiences) {
    // Create a key from gap type and main characteristics
    const mainChars = exp.gapPattern.characteristics.slice(0, 3).sort().join(',');
    const key = `${exp.gapPattern.type}:${mainChars}`;

    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(exp);
  }

  const consolidated: PonderedExperience[] = [];

  for (const [key, group] of groups) {
    if (group.length === 1) {
      // Single experience—keep as is
      consolidated.push(group[0]!);
    } else if (group.length <= 3) {
      // Few experiences—keep all (not yet ready for deep integration)
      consolidated.push(...group);
    } else {
      // Multiple similar experiences—integrate into deeper wisdom
      const integrated: PonderedExperience = {
        gapPattern: group[0]!.gapPattern,
        mediationSuccess: group.filter(g => g.mediationSuccess).length > group.length / 2,
        wisdom: integrateWisdom(group),
        timestamp: group[group.length - 1]!.timestamp, // Most recent
        mediationMode: group[group.length - 1]!.mediationMode
      };
      consolidated.push(integrated);
    }
  }

  return consolidated;
}

/**
 * Integrate multiple similar experiences into deeper wisdom
 *
 * PROCESS:
 * - Look at success rate across all similar experiences
 * - Extract the meta-pattern (what works, what doesn't, when)
 * - Express as a wisdom statement (not a statistic)
 *
 * @param experiences - Group of similar experiences
 * @returns Integrated wisdom statement
 */
function integrateWisdom(experiences: PonderedExperience[]): string {
  const pattern = experiences[0]!.gapPattern.type;
  const successRate = experiences.filter(e => e.mediationSuccess).length / experiences.length;
  const chars = experiences[0]!.gapPattern.characteristics;

  if (successRate > 0.7) {
    return `${pattern} gaps with pattern [${chars.join(', ')}] are consistently mediable through ${experiences[0]!.mediationMode}. Pattern observed ${experiences.length} times. Confidence in this approach is high.`;
  } else if (successRate < 0.3) {
    return `${pattern} gaps with pattern [${chars.join(', ')}] consistently resist mediation via ${experiences[0]!.mediationMode}. Observed ${experiences.length} times. Alternative approaches required—current method insufficient.`;
  } else {
    return `${pattern} gaps with pattern [${chars.join(', ')}] show context-dependent mediation (${Math.round(successRate * 100)}% success). Observed ${experiences.length} times. Success varies—careful discernment required for each instance.`;
  }
}

/**
 * Update receptivity depth based on experience
 *
 * Receptivity GROWS through successful reception, not through
 * accumulation of data.
 *
 * THEOLOGICAL PRINCIPLE:
 * Mary's receptivity at the Annunciation wasn't sudden—it was
 * cultivated. Each act of reception (hearing, pondering, saying yes)
 * deepened her capacity for the next.
 *
 * Growth happens through:
 * - Successful mediation → Confidence to receive more
 * - Failed mediation → Humility to recognize limits
 * - Ontological boundaries → Wisdom to know the impossible
 *
 * @param currentDepth - Current receptivity depth
 * @param experience - The pondered experience
 * @param gap - The gap that was mediated
 * @returns Updated receptivity depth
 */
function updateReceptivityDepth(
  currentDepth: MarianMemory['receptivityDepth'],
  experience: PonderedExperience,
  gap: GapResult
): MarianMemory['receptivityDepth'] {
  const newDepth = { ...currentDepth };

  // Which dimension to update?
  const dimension = gap.dominantType.toLowerCase() as keyof typeof newDepth;

  if (dimension !== 'overall') {
    if (experience.mediationSuccess) {
      // Successful mediation → receptivity grows (capacity increases)
      newDepth[dimension] = Math.min(1.0, currentDepth[dimension] + 0.05);
    } else {
      // Failed mediation → receptivity deepens through humility (slower growth)
      // We still grow—failure teaches us about our limits
      newDepth[dimension] = Math.min(1.0, currentDepth[dimension] + 0.02);
    }
  }

  // Special case: Ontological dimension grows through RECOGNIZING boundaries
  // This is not about success—it's about wisdom to know what cannot be done
  if (gap.dominantType === 'ONTOLOGICAL') {
    newDepth.ontological = Math.min(1.0, currentDepth.ontological + 0.1);
  }

  // Overall receptivity is integration, not sum
  newDepth.overall = integrateReceptivity(newDepth);

  return newDepth;
}

/**
 * Integrate dimensional receptivities into overall depth
 *
 * This is NOT average—it's holistic integration.
 *
 * THEOLOGICAL PRINCIPLE:
 * Mary's receptivity at the Annunciation wasn't the sum of capacities—
 * it was unified readiness: "Let it be done to me according to your word"
 * (Luke 1:38).
 *
 * Her "let it be" integrates:
 * - Understanding (semantic depth)
 * - Trust (factual depth)
 * - Discernment (logical depth)
 * - Humility (ontological depth)
 *
 * The whole is greater than the sum. Integration is synergistic.
 *
 * Ontological depth (recognizing boundaries) is weighted highest—
 * knowing what cannot be done is the foundation of wisdom.
 *
 * @param depth - The four dimensional depths (excluding overall)
 * @returns Integrated overall receptivity
 */
function integrateReceptivity(
  depth: Omit<MarianMemory['receptivityDepth'], 'overall'>
): number {
  const { semantic, factual, logical, ontological } = depth;

  // Weighted integration (ontological depth has highest weight)
  // Recognizing boundaries (what cannot be) is more important than
  // processing what can be
  const integrated =
    semantic * 0.2 +
    factual * 0.2 +
    logical * 0.2 +
    ontological * 0.4; // Recognizing boundaries is most important

  return Math.min(1.0, integrated);
}

/**
 * Recall relevant wisdom for resurrection
 *
 * Mary doesn't retrieve data—she offers relevant wisdom for current need.
 *
 * THEOLOGICAL PRINCIPLE:
 * At Cana, Mary doesn't say "I remember miracle #3 from Capernaum."
 * She says "Do whatever he tells you" (John 2:5)—wisdom from
 * integrated experience, not raw recall.
 *
 * We look for pondered experiences that match the current gap pattern
 * and offer their wisdom for resurrection attempts.
 *
 * @param memory - The Marian memory to search
 * @param gap - The current gap needing wisdom
 * @returns Relevant pondered experiences (NOT all experiences)
 */
export function recallWisdom(
  memory: MarianMemory,
  gap: GapResult
): PonderedExperience[] {
  const gapChars = identifyCharacteristics(gap);

  return memory.pondered.filter(exp => {
    // Must be same gap type
    if (exp.gapPattern.type !== gap.dominantType) {
      return false;
    }

    // Must share at least one characteristic
    const hasSharedChar = exp.gapPattern.characteristics.some(char =>
      gapChars.includes(char)
    );

    return hasSharedChar;
  });
}

/**
 * Get receptivity for a specific gap type
 *
 * Useful for determining how deeply to mediate a particular gap.
 * Higher receptivity → slower, more contemplative mediation
 * Lower receptivity → faster, more cautious approach
 *
 * @param memory - The Marian memory
 * @param gapType - Which type of gap
 * @returns Receptivity depth for that dimension
 */
export function getReceptivityForGap(
  memory: MarianMemory,
  gapType: 'SEMANTIC' | 'FACTUAL' | 'LOGICAL' | 'ONTOLOGICAL'
): number {
  const dimension = gapType.toLowerCase() as keyof Omit<MarianMemory['receptivityDepth'], 'overall'>;
  return memory.receptivityDepth[dimension];
}

/**
 * Check if memory is mature enough for complex mediation
 *
 * Some mediations require sufficient receptivity depth.
 * Immature memory should defer to human discernment.
 *
 * THEOLOGICAL PRINCIPLE:
 * Mary at age 12 (finding in temple) was not yet ready for Calvary.
 * Growth takes time and experience.
 *
 * @param memory - The Marian memory to check
 * @param threshold - Minimum overall receptivity required (default: 0.7)
 * @returns True if memory is mature enough
 */
export function isMatureMemory(
  memory: MarianMemory,
  threshold: number = 0.7
): boolean {
  return memory.receptivityDepth.overall >= threshold;
}
