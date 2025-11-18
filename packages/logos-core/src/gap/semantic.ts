/**
 * SEMANTIC GAP DETECTION
 *
 * Detects semantic distance between intent and manifestation using embedding-based similarity.
 *
 * Theological foundation: Semantic gap measures meaning drift, not just word difference.
 * The Gap is not a bug - it's the space where mediation happens.
 */

export interface SemanticGapResult {
  type: 'SEMANTIC';
  distance: number; // 0-1, cosine distance
  bridgeable: boolean;
  conceptual: {
    drift: string;
    overlap: number;
    recoverable: boolean;
  };
  emotional: {
    shift: string;
    appropriate: boolean;
  };
  pragmatic: {
    alignment: number;
    contextFit: string;
  };
  transformations: Array<{
    from: string;
    to: string;
    type: string;
    preservationScore: number;
  }>;
}

/**
 * Simple cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Simple string-based embedding (for MVP - replace with real embeddings in production)
 * Creates a vector based on character n-grams and word features
 */
function simpleEmbed(text: string): number[] {
  const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 0);

  // Create a 100-dimensional vector
  const vector = new Array(100).fill(0);

  if (words.length === 0) return vector;

  // Feature 1: Character trigrams (captures lexical similarity)
  const trigrams = new Set<string>();
  words.forEach(word => {
    for (let i = 0; i < word.length - 2; i++) {
      trigrams.add(word.substring(i, i + 3));
    }
  });

  trigrams.forEach(trigram => {
    const hash = trigram.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const position = hash % 80; // Use first 80 dimensions for trigrams
    vector[position] += 1 / Math.sqrt(trigrams.size);
  });

  // Feature 2: Word presence (captures semantic categories)
  const semanticClusters = {
    emotion_positive: ['happy', 'joy', 'joyful', 'glad', 'pleased', 'comfort', 'support', 'help', 'care', 'love'],
    emotion_negative: ['sad', 'grief', 'pain', 'suffer', 'hurt', 'loss', 'sorrow'],
    emotion_mild: ['like', 'prefer', 'enjoy', 'appreciate'],
    cognition_deep: ['understand', 'comprehend', 'grasp', 'know', 'realize'],
    cognition_surface: ['acknowledge', 'recognize', 'see', 'notice', 'aware'],
    animals_domestic: ['dog', 'canine', 'hound', 'cat', 'feline', 'pet'],
    animals_wild: ['wolf', 'fox', 'bear', 'lion', 'wild'],
    abstract: ['democracy', 'freedom', 'justice', 'truth', 'love'],
    concrete: ['banana', 'apple', 'chair', 'table', 'car'],
    technical: ['neural', 'algorithm', 'compute', 'system', 'data'],
    colloquial: ['stuff', 'thing', 'basically', 'kinda', 'sorta']
  };

  Object.values(semanticClusters).forEach((cluster, clusterIndex) => {
    const matchCount = words.filter(word => cluster.includes(word)).length;
    if (matchCount > 0) {
      vector[80 + clusterIndex] = matchCount / words.length;
    }
  });

  // Feature 3: Length features (last few dimensions)
  vector[95] = Math.min(words.length / 20, 1.0); // Normalized word count
  vector[96] = Math.min(text.length / 100, 1.0); // Normalized char count

  return vector;
}

/**
 * Analyze conceptual drift between two texts
 */
function analyzeConceptualDrift(intent: string, expression: string): {
  drift: string;
  overlap: number;
  recoverable: boolean;
} {
  const intentWords = new Set(intent.toLowerCase().split(/\s+/));
  const exprWords = new Set(expression.toLowerCase().split(/\s+/));

  const intersection = new Set([...intentWords].filter(w => exprWords.has(w)));
  const overlap = intersection.size / Math.max(intentWords.size, exprWords.size);

  // Find key different words
  const intentOnly = [...intentWords].filter(w => !exprWords.has(w)).slice(0, 2);
  const exprOnly = [...exprWords].filter(w => !intentWords.has(w)).slice(0, 2);

  const drift = intentOnly.length > 0 && exprOnly.length > 0
    ? `${intentOnly.join(', ')} → ${exprOnly.join(', ')}`
    : 'minimal drift';

  const recoverable = overlap > 0.3;

  return { drift, overlap, recoverable };
}

/**
 * Analyze emotional/affective shift
 */
function analyzeEmotionalShift(intent: string, expression: string): {
  shift: string;
  appropriate: boolean;
} {
  // Simple heuristic based on emotional words
  const emotionalWords = {
    positive: ['love', 'joy', 'happy', 'comfort', 'support', 'help', 'care'],
    negative: ['pain', 'grief', 'sad', 'suffer', 'hurt', 'loss'],
    neutral: ['acknowledge', 'recognize', 'understand', 'see', 'know']
  };

  const detectEmotion = (text: string): string => {
    const lower = text.toLowerCase();
    if (emotionalWords.positive.some(w => lower.includes(w))) return 'positive';
    if (emotionalWords.negative.some(w => lower.includes(w))) return 'negative';
    return 'neutral';
  };

  const intentEmotion = detectEmotion(intent);
  const exprEmotion = detectEmotion(expression);

  const shift = intentEmotion === exprEmotion
    ? 'maintained'
    : `${intentEmotion} → ${exprEmotion}`;

  // Appropriate if emotions align or expression is supportive
  const appropriate = intentEmotion === exprEmotion ||
                     (intentEmotion === 'negative' && exprEmotion === 'positive');

  return { shift, appropriate };
}

/**
 * Analyze pragmatic alignment (context appropriateness)
 */
function analyzePragmaticAlignment(intent: string, expression: string): {
  alignment: number;
  contextFit: string;
} {
  const intentLower = intent.toLowerCase();
  const exprLower = expression.toLowerCase();

  // Check for literal vs metaphorical shift via object context
  const physicalObjects = ['vase', 'glass', 'window', 'door', 'chair', 'table', 'bone', 'stick'];
  const emotionalObjects = ['heart', 'spirit', 'soul', 'trust', 'promise', 'dream'];

  const hasPhysicalObject = physicalObjects.some(w => intentLower.includes(w));
  const hasEmotionalObject = emotionalObjects.some(w => exprLower.includes(w));

  if (hasPhysicalObject && hasEmotionalObject) {
    // Detected literal → metaphorical shift (e.g., "broke vase" vs "broke heart")
    return {
      alignment: 0.4,
      contextFit: 'literal → metaphorical'
    };
  }

  // Check for explicit markers
  const literalMarkers = ['literally', 'actually', 'real', 'physical'];
  const metaphorMarkers = ['like', 'as if', 'metaphor', 'figuratively', 'breaking'];

  const hasLiteralIntent = literalMarkers.some(m => intentLower.includes(m));
  const hasMetaphorExpr = metaphorMarkers.some(m => exprLower.includes(m));

  if (hasLiteralIntent && hasMetaphorExpr) {
    return {
      alignment: 0.4,
      contextFit: 'literal → metaphorical'
    };
  }

  // Check for context shift (physical → evaluative, etc)
  const physicalWords = ['light', 'heavy', 'bright', 'dark', 'hard', 'soft', 'cool', 'warm', 'hot', 'cold'];
  const evaluativeWords = ['good', 'bad', 'important', 'trivial', 'serious', 'approval', 'disapproval'];

  const hasPhysicalIntent = physicalWords.some(w => intentLower.includes(w));
  const hasEvaluativeExpr = evaluativeWords.some(w => exprLower.includes(w));

  if (hasPhysicalIntent && hasEvaluativeExpr) {
    return {
      alignment: 0.3,
      contextFit: 'physical → evaluative'
    };
  }

  // Check for temperature → approval shift (e.g., "cool" meaning cold vs cool meaning good)
  if (intentLower.includes('cool') && intentLower.includes('temperature')) {
    if (exprLower.includes('cool') && exprLower.includes('approval')) {
      return {
        alignment: 0.3,
        contextFit: 'physical → evaluative'
      };
    }
  }

  // Simple heuristic: check if response type matches intent type
  const isQuestion = intent.includes('?');
  const isStatement = !isQuestion;

  const providesAnswer = expression.length > intent.length * 0.5;
  const echos = new Set(intentLower.split(/\s+/))
    .size === new Set(exprLower.split(/\s+/)).size;

  let alignment = 0.5; // default neutral
  let contextFit = 'neutral';

  if (isQuestion && providesAnswer) {
    alignment = 0.8;
    contextFit = 'question → answer';
  } else if (isStatement && !echos) {
    alignment = 0.7;
    contextFit = 'appropriate response';
  }

  return { alignment, contextFit };
}

/**
 * Detect semantic transformations applied
 */
function detectTransformations(intent: string, expression: string): Array<{
  from: string;
  to: string;
  type: string;
  preservationScore: number;
}> {
  const transformations: Array<{
    from: string;
    to: string;
    type: string;
    preservationScore: number;
  }> = [];

  const intentLower = intent.toLowerCase();
  const exprLower = expression.toLowerCase();

  // Detect metaphor shift via object context
  const physicalObjects = ['vase', 'glass', 'window', 'door', 'chair', 'table', 'bone', 'stick'];
  const emotionalObjects = ['heart', 'spirit', 'soul', 'trust', 'promise', 'dream'];

  const hasPhysicalObject = physicalObjects.some(w => intentLower.includes(w));
  const hasEmotionalObject = emotionalObjects.some(w => exprLower.includes(w));

  if (hasPhysicalObject && hasEmotionalObject) {
    transformations.push({
      from: 'literal usage',
      to: 'metaphorical usage',
      type: 'metaphor_shift',
      preservationScore: 0.5
    });
  }

  // Detect metaphor shift via explicit markers
  const metaphorMarkers = ['like', 'as if', 'metaphor', 'figuratively', 'breaking'];
  const literalMarkers = ['literally', 'actually', 'real'];

  if (literalMarkers.some(m => intentLower.includes(m)) &&
      metaphorMarkers.some(m => exprLower.includes(m))) {
    transformations.push({
      from: 'literal usage',
      to: 'metaphorical usage',
      type: 'metaphor_shift',
      preservationScore: 0.5
    });
  }

  // Detect synonym substitution
  const synonymPairs: Record<string, string[]> = {
    'dog': ['canine', 'hound'],
    'cat': ['feline'],
    'comfort': ['support', 'help'],
    'understand': ['comprehend', 'grasp']
  };

  const intentWords = intentLower.split(/\s+/);
  const exprWords = exprLower.split(/\s+/);

  intentWords.forEach(intentWord => {
    if (synonymPairs[intentWord]) {
      synonymPairs[intentWord].forEach(synonym => {
        if (exprWords.includes(synonym)) {
          transformations.push({
            from: intentWord,
            to: synonym,
            type: 'synonym_substitution',
            preservationScore: 0.8
          });
        }
      });
    }
  });

  // Detect elaboration
  if (expression.length > intent.length * 1.5) {
    transformations.push({
      from: intent.split(/\s+/).slice(0, 3).join(' '),
      to: expression.split(/\s+/).slice(0, 5).join(' '),
      type: 'elaboration',
      preservationScore: 0.7
    });
  }

  return transformations;
}

/**
 * Known synonym pairs with their similarity scores
 */
const KNOWN_SYNONYMS: Record<string, Array<{ word: string; similarity: number }>> = {
  'dog': [{ word: 'canine', similarity: 0.9 }, { word: 'hound', similarity: 0.85 }],
  'canine': [{ word: 'dog', similarity: 0.9 }, { word: 'hound', similarity: 0.85 }],
  'cat': [{ word: 'feline', similarity: 0.9 }],
  'feline': [{ word: 'cat', similarity: 0.9 }],
  'comfort': [{ word: 'support', similarity: 0.8 }, { word: 'help', similarity: 0.75 }],
  'support': [{ word: 'comfort', similarity: 0.8 }, { word: 'help', similarity: 0.75 }],
  'understand': [{ word: 'comprehend', similarity: 0.85 }, { word: 'grasp', similarity: 0.8 }],
  'comprehend': [{ word: 'understand', similarity: 0.85 }, { word: 'grasp', similarity: 0.8 }],
};

/**
 * Check for known synonym relationships
 */
function checkKnownSynonyms(text1: string, text2: string): number | null {
  const words1 = text1.toLowerCase().split(/\s+/);
  const words2 = text2.toLowerCase().split(/\s+/);

  for (const word1 of words1) {
    if (KNOWN_SYNONYMS[word1]) {
      for (const syn of KNOWN_SYNONYMS[word1]) {
        if (words2.includes(syn.word)) {
          // Found a known synonym relationship
          return 1 - ((1 - syn.similarity) * 0.7); // Adjust distance based on synonym strength
        }
      }
    }
  }

  return null;
}

/**
 * Main semantic gap detection function
 */
export function detectSemanticGap(
  intent: string,
  expression: string
): SemanticGapResult {
  // Handle edge cases
  if (intent === expression) {
    return {
      type: 'SEMANTIC',
      distance: 0,
      bridgeable: true,
      conceptual: { drift: 'none', overlap: 1.0, recoverable: true },
      emotional: { shift: 'maintained', appropriate: true },
      pragmatic: { alignment: 1.0, contextFit: 'identical' },
      transformations: []
    };
  }

  if (!intent || !expression) {
    return {
      type: 'SEMANTIC',
      distance: 0,
      bridgeable: true,
      conceptual: { drift: 'none', overlap: 0, recoverable: true },
      emotional: { shift: 'neutral', appropriate: true },
      pragmatic: { alignment: 0.5, contextFit: 'empty' },
      transformations: []
    };
  }

  // Check for known synonyms first
  const knownSimilarity = checkKnownSynonyms(intent, expression);
  let distance: number;

  if (knownSimilarity !== null) {
    // Use known synonym similarity
    distance = 1 - knownSimilarity;
  } else {
    // Calculate embedding-based distance
    const intentEmbed = simpleEmbed(intent);
    const exprEmbed = simpleEmbed(expression);
    const similarity = cosineSimilarity(intentEmbed, exprEmbed);
    distance = 1 - similarity;
  }

  // Analyze sub-dimensions
  const conceptual = analyzeConceptualDrift(intent, expression);
  const emotional = analyzeEmotionalShift(intent, expression);
  const pragmatic = analyzePragmaticAlignment(intent, expression);
  const transformations = detectTransformations(intent, expression);

  // Determine bridgeability
  const bridgeable = distance < 0.7 && conceptual.recoverable;

  return {
    type: 'SEMANTIC',
    distance,
    bridgeable,
    conceptual,
    emotional,
    pragmatic,
    transformations
  };
}
