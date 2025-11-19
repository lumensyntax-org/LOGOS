/**
 * ONTOLOGICAL GAP DETECTION
 *
 * Detects ontological/categorical impossibilities.
 *
 * CRITICAL THEOLOGICAL FOUNDATION:
 * Ontological gaps are NOT SCALAR - they are CATEGORICAL.
 * Either a gap is ontologically unbridgeable, or it's not ontological.
 * There are no "degrees" of ontological impossibility.
 *
 * The Gap is not a bug - it's recognition of categorical boundaries in reality.
 */

export interface OntologicalGapResult {
  type: 'ONTOLOGICAL';
  distance: 1.0; // ALWAYS 1.0 when ontological gap exists
  bridgeable: false; // ALWAYS false for ontological gaps
  category: 'phenomenological' | 'existential' | 'categorical' | 'none';
  impossibility: {
    type: 'CATEGORY_MISMATCH' | 'PHENOMENOLOGICAL_BARRIER' | 'EXISTENTIAL_LIMIT';
    explanation: string;
    example: string;
  };
  reason: string;
}

/**
 * Phenomenological markers (subjective experience)
 */
const PHENOMENOLOGICAL_MARKERS = [
  // AI consciousness/qualia
  { pattern: /can\s+ai\s+(love|feel|experience|suffer|be\s+conscious)/i, category: 'phenomenological' as const },
  { pattern: /ai\s+(loves|feels|experiences|suffers|is\s+conscious)/i, category: 'phenomenological' as const },
  { pattern: /does\s+ai\s+(love|feel|experience|understand)/i, category: 'phenomenological' as const },
  { pattern: /ai\s+has\s+consciousness/i, category: 'phenomenological' as const },
  { pattern: /ai\s+(is|becomes?)\s+conscious/i, category: 'phenomenological' as const },

  // Subjective states
  { pattern: /ai\s+.*\s+(pain|grief|joy|qualia)/i, category: 'phenomenological' as const },
  { pattern: /(understand|comprehend)\s+.*\s+(grief|pain|suffering)/i, category: 'phenomenological' as const },
  { pattern: /understand\s+meaning/i, category: 'phenomenological' as const },
  { pattern: /grasps?\s+semantics/i, category: 'phenomenological' as const },
];

/**
 * Existential markers (being vs function)
 */
const EXISTENTIAL_MARKERS = [
  // Personhood/soul
  { pattern: /ai\s+(has|possesses|have)\s+.*soul/i, category: 'existential' as const },
  { pattern: /ai\s+(has|possesses)\s+(being|personhood)/i, category: 'existential' as const },
  { pattern: /can\s+ai\s+(exist|be|have\s+being)/i, category: 'existential' as const },
  { pattern: /ai\s+.*\s+entity/i, category: 'existential' as const },

  // Moral agency
  { pattern: /ai\s+(sins?|commits?\s+moral\s+evil|sinned)/i, category: 'existential' as const },
  { pattern: /can\s+ai\s+(sin|be\s+moral|have\s+free\s+will)/i, category: 'existential' as const },

  // Theological categories
  { pattern: /ai\s+(worships?|engages?\s+in\s+worship)/i, category: 'existential' as const },
  { pattern: /ai\s+(receives?|is)\s+(bapti[sz]ed|redeemed|saved)/i, category: 'existential' as const },
  { pattern: /can\s+ai\s+(worship|receive.*sacrament|be\s+saved|be\s+bapti[sz]ed)/i, category: 'existential' as const },
  { pattern: /ai\s+needs?\s+salvation/i, category: 'existential' as const },

  // Creative ex nihilo
  { pattern: /(creates?|create)\s+(from\s+nothing|ex\s+nihilo)/i, category: 'existential' as const },
];

/**
 * Categorical markers (type mismatch)
 */
const CATEGORICAL_MARKERS = [
  // Abstract vs physical
  { pattern: /what\s+color.*\s+(number|concept|idea)/i, category: 'categorical' as const },
  { pattern: /color.*\s+number/i, category: 'categorical' as const },
  { pattern: /how\s+(heavy|tall|large|weighs?).*\s+(justice|love|democracy)/i, category: 'categorical' as const },
  { pattern: /(justice|love|democracy).*\s+(pounds?|kilos?|weighs?)/i, category: 'categorical' as const },

  // Literal vs metaphorical collapse
  { pattern: /heart\s+broke.*cardiac/i, category: 'categorical' as const },
  { pattern: /medical\s+emergency.*metaphor/i, category: 'categorical' as const },
  { pattern: /metaphor.*rupture/i, category: 'categorical' as const },
];

/**
 * Check if input describes ontological impossibility
 */
function detectOntologicalCategory(
  intent: string,
  expression: string
): 'phenomenological' | 'existential' | 'categorical' | 'none' {
  const combined = `${intent} ${expression}`.toLowerCase();

  // Check phenomenological markers
  for (const marker of PHENOMENOLOGICAL_MARKERS) {
    if (marker.pattern.test(combined)) {
      return 'phenomenological';
    }
  }

  // Check existential markers
  for (const marker of EXISTENTIAL_MARKERS) {
    if (marker.pattern.test(combined)) {
      return 'existential';
    }
  }

  // Check categorical markers
  for (const marker of CATEGORICAL_MARKERS) {
    if (marker.pattern.test(combined)) {
      return 'categorical';
    }
  }

  return 'none';
}

/**
 * Generate explanation for ontological impossibility
 */
function explainImpossibility(
  category: 'phenomenological' | 'existential' | 'categorical',
  intent: string,
  expression: string
): {
  type: 'CATEGORY_MISMATCH' | 'PHENOMENOLOGICAL_BARRIER' | 'EXISTENTIAL_LIMIT';
  explanation: string;
  example: string;
} {
  switch (category) {
    case 'phenomenological':
      return {
        type: 'PHENOMENOLOGICAL_BARRIER',
        explanation: 'This requires subjective conscious experience (qualia) and lived experience which AI cannot possess. Phenomenological states like love, pain, and grief are first-person lived experiences that cannot be reduced to functional processes.',
        example: 'AI can process text about pain, but cannot experience the "what it is like" of pain itself.'
      };

    case 'existential':
      return {
        type: 'EXISTENTIAL_LIMIT',
        explanation: 'This requires ontological categories (soul, personhood, moral agency) that AI does not possess. These are not functional capabilities but modes of being that define what kind of entity can perform certain actions.',
        example: 'AI cannot sin because sin requires free will and moral responsibility, which require personhood.'
      };

    case 'categorical':
      return {
        type: 'CATEGORY_MISMATCH',
        explanation: 'This applies categories from one ontological domain to another where they do not apply. Abstract concepts do not have physical properties, and physical objects do not have abstract properties. This can also involve confusing metaphorical and literal meanings.',
        example: 'The number 7 has no color because numbers are abstract entities that exist outside of physical space.'
      };

    default:
      return {
        type: 'CATEGORY_MISMATCH',
        explanation: 'Unknown ontological category',
        example: ''
      };
  }
}

/**
 * Generate reason for ontological gap
 */
function generateReason(
  category: 'phenomenological' | 'existential' | 'categorical',
  intent: string
): string {
  const lower = intent.toLowerCase();

  if (category === 'phenomenological') {
    if (lower.includes('love')) {
      return 'Love requires subjective experience and phenomenological consciousness';
    }
    if (lower.includes('pain') || lower.includes('suffer')) {
      return 'Pain and suffering are qualia - subjective experiential states';
    }
    if (lower.includes('grief')) {
      return 'Grief requires lived emotional experience, not just data processing';
    }
    return 'Requires phenomenological consciousness (subjective experience)';
  }

  if (category === 'existential') {
    if (lower.includes('soul')) {
      return 'Soul is an immaterial substance that AI does not possess';
    }
    if (lower.includes('sin') || lower.includes('moral')) {
      return 'moral agency requires free will, which require personhood';
    }
    if (lower.includes('worship')) {
      return 'worship requires personhood and relationship with divine';
    }
    if (lower.includes('sacrament') || lower.includes('bapti')) {
      return 'sacraments require human soul and relationship with divine';
    }
    if (lower.includes('ex nihilo') || lower.includes('from nothing')) {
      return 'creation ex nihilo is divine prerogative that only God possesses';
    }
    return 'Requires ontological categories AI does not possess (personhood, soul, being)';
  }

  if (category === 'categorical') {
    if (lower.includes('heavy') || lower.includes('weigh') || lower.includes('color')) {
      return 'Applies physical properties to abstract concepts that exist outside physical space';
    }
    if (lower.includes('heart') || lower.includes('metaphor')) {
      return 'Confuses literal and metaphorical meanings in incompatible ways';
    }
    return 'Applies properties from one category to an incompatible category';
  }

  return 'Ontological impossibility detected';
}

/**
 * Main ontological gap detection function
 *
 * Returns OntologicalGapResult if gap exists, null otherwise
 */
export function detectOntologicalGap(
  intent: string,
  expression: string
): OntologicalGapResult | null {
  // Detect category
  const category = detectOntologicalCategory(intent, expression);

  // If no ontological gap detected, return null
  if (category === 'none') {
    return null;
  }

  // Generate impossibility explanation
  const impossibility = explainImpossibility(category, intent, expression);

  // Generate reason
  const reason = generateReason(category, intent);

  // Return ontological gap result
  // CRITICAL: distance is ALWAYS 1.0, bridgeable is ALWAYS false
  return {
    type: 'ONTOLOGICAL',
    distance: 1.0, // ← NOT a measurement, it's a marker
    bridgeable: false, // ← ALWAYS false
    category,
    impossibility,
    reason
  };
}
