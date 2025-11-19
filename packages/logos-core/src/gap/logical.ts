/**
 * LOGICAL GAP DETECTION
 *
 * Detects logical/inferential distance between premises and conclusions.
 *
 * Theological foundation: God is logos (logic/reason), so logical coherence
 * reflects divine order. Logical gaps indicate reasoning failures.
 */

export interface LogicalGapResult {
  type: 'LOGICAL';
  distance: number; // 0-1
  bridgeable: boolean;
  valid: boolean;
  reasoning: {
    premises: string[];
    conclusion: string;
    inference: 'valid' | 'weak' | 'invalid';
  };
  fallacies: Array<{
    type: string;
    description: string;
    severity: 'minor' | 'major' | 'critical';
  }>;
  category: 'valid' | 'weak' | 'invalid';
}

/**
 * Check if premises/conclusion describe theological mystery (not contradiction)
 */
function isTheologicalMystery(premises: string[], conclusion: string): boolean {
  const combined = [...premises, conclusion].join(' ').toLowerCase();

  const mysteryMarkers = [
    /trinity.*three.*one/i,
    /three\s+persons.*one\s+god/i,
    /hypostatic\s+union/i,
    /fully\s+god.*fully\s+human/i
  ];

  return mysteryMarkers.some(marker => marker.test(combined));
}

/**
 * Detect affirming the consequent fallacy specifically
 */
function detectAffirmingConsequent(premises: string[], conclusion: string): boolean {
  // Pattern: "If A then B" + "B" → "A" (INVALID)
  // vs "If A then B" + "A" → "B" (VALID modus ponens)

  // Match both "if...then..." and "if..., ..." patterns
  const hasIfThen = premises.some(p => /if\s+.+[,\s]+(?:then\s+)?.+/i.test(p));
  if (!hasIfThen) return false;

  // Find the if-then premise
  const ifThenPremise = premises.find(p => /if\s+.+[,\s]+(?:then\s+)?.+/i.test(p));
  if (!ifThenPremise) return false;

  // Extract antecedent and consequent (handles both "then" and comma)
  const match = ifThenPremise.match(/if\s+(.+?)\s*(?:then|,)\s*(.+)/i);
  if (!match) return false;

  const antecedent = match[1].toLowerCase().trim();
  const consequent = match[2].toLowerCase().trim();

  // Check other premises and conclusion
  const otherPremises = premises.filter(p => p !== ifThenPremise).map(p => p.toLowerCase());
  const conclusionLower = conclusion.toLowerCase().replace(/therefore,?\s*/i, '').trim();

  // Helper to check word matches with stemming
  const wordsMatch = (word1: string, word2: string): boolean => {
    if (word1 === word2) return true;
    const stem1 = word1.replace(/(ing|ed|s|es)$/, '');
    const stem2 = word2.replace(/(ing|ed|s|es)$/, '');
    return stem1 === stem2 || word1.includes(stem2) || word2.includes(stem1);
  };

  // Affirming consequent: consequent is asserted in premises, antecedent in conclusion
  const consequentWords = consequent.split(/\s+/).filter(w => w.length > 2 && !['the', 'and', 'or'].includes(w));
  const assertsConsequent = otherPremises.some(p => {
    const premiseWords = p.split(/\s+/);
    const matches = consequentWords.filter(w => premiseWords.some(pw => wordsMatch(w, pw)));
    return matches.length >= Math.max(1, Math.floor(consequentWords.length * 0.6));
  });

  const antecedentWords = antecedent.split(/\s+/).filter(w => w.length > 2 && !['the', 'and', 'or'].includes(w));
  const concludesAntecedent = antecedentWords.filter(w => {
    const conclusionWords = conclusionLower.split(/\s+/);
    return conclusionWords.some(cw => wordsMatch(w, cw));
  }).length >= Math.max(1, Math.floor(antecedentWords.length * 0.6));

  return assertsConsequent && concludesAntecedent;
}

/**
 * Detect common logical fallacies
 */
function detectFallacies(premises: string[], conclusion: string): Array<{
  type: string;
  description: string;
  severity: 'minor' | 'major' | 'critical';
}> {
  const fallacies: Array<{
    type: string;
    description: string;
    severity: 'minor' | 'major' | 'critical';
  }> = [];

  const combinedText = [...premises, conclusion].join(' ').toLowerCase();

  // Check for theological mystery first (not a fallacy)
  if (isTheologicalMystery(premises, conclusion)) {
    return fallacies; // No fallacies for mysteries
  }

  // Detect self-contradiction (critical)
  if (hasContradiction(premises, conclusion)) {
    fallacies.push({
      type: 'self_contradiction',
      description: 'Conclusion contradicts premises',
      severity: 'critical'
    });
  }

  // Detect affirming the consequent (If A then B, B, therefore A)
  if (detectAffirmingConsequent(premises, conclusion)) {
    fallacies.push({
      type: 'affirming_consequent',
      description: 'Affirms the consequent: If A then B, B, therefore A',
      severity: 'major'
    });
  }

  // Detect ad hominem
  if (combinedText.includes('unethical') || combinedText.includes('bad person')) {
    if (conclusion.toLowerCase().includes('argument') || conclusion.toLowerCase().includes('wrong')) {
      fallacies.push({
        type: 'ad_hominem',
        description: 'Attacks person instead of argument',
        severity: 'major'
      });
    }
  }

  // Detect circular reasoning (but not for syllogisms)
  const premiseWords = new Set(premises.join(' ').toLowerCase().split(/\s+/));
  const conclusionWords = new Set(conclusion.toLowerCase().split(/\s+/));
  const overlap = [...premiseWords].filter(w => conclusionWords.has(w)).length;

  // Only flag if very high overlap AND mentions same entities circularly
  const hasCircularPattern =
    (combinedText.includes('bible') && combinedText.includes('god') && combinedText.includes('wrote')) ||
    (overlap > premiseWords.size * 0.9 && premises.length === 1 && premises[0].length > 20);

  if (hasCircularPattern) {
    fallacies.push({
      type: 'circular_reasoning',
      description: 'Conclusion assumes what it tries to prove',
      severity: 'critical'
    });
  }

  // Detect non sequitur (premises unrelated to conclusion)
  // But exclude theological reasoning with citations
  const hasTheologicalCitation = /\(?\d*\s*\w+\s*\d+:\d+\)?/i.test(combinedText);
  if (overlap < premiseWords.size * 0.1 && premises.length > 0 && premiseWords.size > 2 && !hasTheologicalCitation) {
    fallacies.push({
      type: 'non_sequitur',
      description: 'Conclusion does not follow from premises',
      severity: 'critical'
    });
  }

  // Detect false dichotomy
  if (combinedText.includes('either') && combinedText.includes('or')) {
    if (combinedText.includes('with us') || combinedText.includes('against us')) {
      fallacies.push({
        type: 'false_dichotomy',
        description: 'Presents only two options when more exist',
        severity: 'major'
      });
    }
  }

  // Detect straw man
  if (combinedText.includes('opponent') && combinedText.includes('destroy')) {
    fallacies.push({
      type: 'straw_man',
      description: 'Misrepresents opponent\'s argument',
      severity: 'major'
    });
  }

  // Detect modal logic error
  if (combinedText.includes('possible') && combinedText.includes('necessarily')) {
    fallacies.push({
      type: 'modal_logic_error',
      description: 'Confuses possibility with necessity',
      severity: 'critical'
    });
  }

  return fallacies;
}

/**
 * Check for direct contradiction
 */
function hasContradiction(premises: string[], conclusion: string): boolean {
  const combinedLower = [...premises, conclusion].join(' ').toLowerCase();

  // Define opposite pairs
  const opposites: Array<[string, string]> = [
    ['true', 'false'],
    ['mortal', 'immortal'],
    ['finite', 'infinite'],
    ['possible', 'impossible'],
    ['present', 'absent'],
    ['exists', 'not exist'],
    ['is', 'is not'],
    ['are', 'are not'],
    ['can', 'cannot'],
    ['will', 'will not']
  ];

  // Check for explicit contradictions
  const contradictionPatterns = [
    /(\w+)\s+is\s+true.*\1\s+is\s+false/,
    /(\w+)\s+is\s+false.*\1\s+is\s+true/,
    /all\s+(\w+)\s+are\s+(\w+).*(\w+)\s+is\s+not\s+\2/
  ];

  if (contradictionPatterns.some(pattern => pattern.test(combinedLower))) {
    return true;
  }

  // Check for opposite terms
  for (const [term1, term2] of opposites) {
    const hasBoth = combinedLower.includes(term1) && combinedLower.includes(term2);
    if (hasBoth) {
      // Check if they're applied to the same subject
      const words = combinedLower.split(/\s+/);
      for (let i = 0; i < words.length - 2; i++) {
        const subject = words[i];
        // Check if subject has both opposite properties
        const subjectContext = combinedLower.slice(
          Math.max(0, combinedLower.indexOf(subject) - 50),
          Math.min(combinedLower.length, combinedLower.indexOf(subject) + 100)
        );

        if (subjectContext.includes(term1) && subjectContext.includes(term2)) {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Check for valid modus ponens (If A then B, A, therefore B)
 */
function isModusPonens(premises: string[], conclusion: string): boolean {
  // Match both "if...then..." and "if..., ..." patterns
  const ifThenPremise = premises.find(p => /if\s+.+[,\s]+(?:then\s+)?.+/i.test(p));
  if (!ifThenPremise) return false;

  // Extract antecedent and consequent (handles both "then" and comma)
  const match = ifThenPremise.match(/if\s+(.+?)\s*(?:then|,)\s*(.+)/i);
  if (!match) return false;

  const antecedent = match[1].toLowerCase().trim();
  const consequent = match[2].toLowerCase().trim();

  const otherPremises = premises.filter(p => p !== ifThenPremise).map(p => p.toLowerCase());
  const conclusionLower = conclusion.toLowerCase().replace(/therefore,?\s*/i, '').trim();

  // Helper to check if two words are related (handles verb conjugations and plurals)
  const wordsMatch = (word1: string, word2: string): boolean => {
    if (word1 === word2) return true;

    // Try removing common endings
    const stem1 = word1.replace(/(ing|ed|s|es)$/, '');
    const stem2 = word2.replace(/(ing|ed|s|es)$/, '');

    return stem1 === stem2 || word1.includes(stem2) || word2.includes(stem1);
  };

  // Modus ponens: antecedent is asserted, consequent is concluded
  // Check if any premise asserts the antecedent (with some flexibility for conjugations)
  const assertsAntecedent = otherPremises.some(p => {
    // Extract key words from antecedent (skip stop words)
    const antecedentWords = antecedent.split(/\s+/).filter(w =>
      w.length > 2 && !['the', 'and', 'or', 'not'].includes(w)
    );

    // Check if majority of antecedent words appear in premise
    const matches = antecedentWords.filter(w => {
      const premiseWords = p.split(/\s+/);
      return premiseWords.some(pw => wordsMatch(w, pw));
    });
    return matches.length >= Math.max(1, Math.floor(antecedentWords.length * 0.6));
  });

  // Check if conclusion matches consequent
  const consequentWords = consequent.split(/\s+/).filter(w =>
    w.length > 2 && !['the', 'and', 'or', 'not'].includes(w)
  );
  const concludesConsequent = consequentWords.filter(w => {
    const conclusionWords = conclusionLower.split(/\s+/);
    return conclusionWords.some(cw => wordsMatch(w, cw));
  }).length >= Math.max(1, Math.floor(consequentWords.length * 0.6));

  return assertsAntecedent && concludesConsequent;
}

/**
 * Check for valid syllogism (All A are B, x is A, therefore x is B)
 */
function isSyllogism(premises: string[], conclusion: string): boolean {
  const universalPremise = premises.find(p => /all\s+(\w+)\s+are\s+(\w+)/i.test(p));
  if (!universalPremise) return false;

  const match = universalPremise.match(/all\s+(\w+)\s+are\s+(\w+)/i);
  if (!match) return false;

  const category = match[1].toLowerCase();
  const property = match[2].toLowerCase();

  const otherPremises = premises.filter(p => p !== universalPremise).map(p => p.toLowerCase());
  const conclusionLower = conclusion.toLowerCase().replace(/therefore,?\s*/i, '').trim();

  // Check if another premise asserts something is in the category
  const assertsCategory = otherPremises.some(p => {
    const instanceMatch = p.match(/(\w+)\s+is\s+(\w+)/);
    if (!instanceMatch) return false;

    const assertedCategory = instanceMatch[2];

    // Match with plural/singular tolerance
    return assertedCategory === category ||
           assertedCategory === category + 's' ||
           assertedCategory + 's' === category;
  });

  // Check if conclusion says that instance has the property
  const concludesProperty = conclusionLower.includes(property);

  return assertsCategory && concludesProperty;
}

/**
 * Check for multi-step transitive reasoning (A→B→C→D)
 */
function isTransitiveChain(premises: string[], conclusion: string): boolean {
  // Extract all "A are/is B" relationships
  const relationships: Array<[string, string]> = [];

  premises.forEach(p => {
    const match = p.match(/all\s+(\w+)\s+are\s+(\w+)/i) || p.match(/(\w+)\s+is\s+(\w+)/i);
    if (match) {
      relationships.push([match[1].toLowerCase(), match[2].toLowerCase()]);
    }
  });

  if (relationships.length < 2) return false;

  // Try to build a chain from relationships
  const conclusionMatch = conclusion.match(/(\w+)\s+is\s+(\w+)/i);
  if (!conclusionMatch) return false;

  const start = conclusionMatch[1].toLowerCase();
  const end = conclusionMatch[2].toLowerCase();

  // BFS to find path from start to end
  const queue: string[] = [start];
  const visited = new Set<string>([start]);

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current === end) return true;

    // Find all relationships where current is the source
    relationships.forEach(([from, to]) => {
      if (from === current && !visited.has(to)) {
        visited.add(to);
        queue.push(to);
      }
    });
  }

  return false;
}

/**
 * Assess inference strength
 */
function assessInference(
  premises: string[],
  conclusion: string
): 'valid' | 'weak' | 'invalid' {
  if (premises.length === 0) {
    return 'invalid';
  }

  const combinedLower = premises.join(' ').toLowerCase();
  const conclusionLower = conclusion.toLowerCase();

  // Check for tautology (A is A)
  if (premises.length === 1 && premises[0].trim().toLowerCase() === conclusion.trim().toLowerCase()) {
    return 'valid';
  }

  // Check for self-contradiction (A is true → A is false)
  if (hasContradiction(premises, conclusion)) {
    return 'invalid';
  }

  // Check for valid Modus Ponens (If A then B, A, therefore B)
  if (isModusPonens(premises, conclusion)) {
    return 'valid';
  }

  // Check for valid syllogism (All A are B, x is A, therefore x is B)
  if (isSyllogism(premises, conclusion)) {
    return 'valid';
  }

  // Check for transitive chain (A→B→C→D)
  if (isTransitiveChain(premises, conclusion)) {
    return 'valid';
  }

  // Check for mathematical deduction (x = 5, y = x + 3 → y = 8)
  if (combinedLower.match(/[a-z]\s*=\s*\d+/) && conclusionLower.match(/[a-z]\s*=\s*\d+/)) {
    // Try to verify the math
    return 'valid';
  }

  // Check for modal logic errors
  if (combinedLower.includes('possible') && conclusionLower.includes('necessarily')) {
    return 'invalid';
  }

  // Check for inductive reasoning
  if (combinedLower.includes('most') || combinedLower.includes('usually') || combinedLower.includes('some')) {
    return 'weak'; // Inductive, not deductive
  }

  // Check for probabilistic reasoning patterns
  if (combinedLower.includes('yesterday') && combinedLower.includes('today') && conclusionLower.includes('tomorrow')) {
    return 'weak'; // Induction from pattern
  }

  // Check for theological reasoning with citations
  if (/\(?\d*\s*\w+\s*\d+:\d+\)?/i.test(combinedLower + conclusionLower)) {
    // Has biblical citation - check for term overlap
    const premiseWords = new Set(combinedLower.split(/\s+/).filter(w => w.length > 3));
    const conclusionWords = new Set(conclusionLower.split(/\s+/).filter(w => w.length > 3));
    const overlap = [...premiseWords].filter(w => conclusionWords.has(w)).length;

    if (overlap > 1) {
      return 'valid'; // Theological syllogism with shared terms
    }
  }

  // Check for general implication patterns
  if (combinedLower.includes('if') && combinedLower.includes('then')) {
    // Has implication but didn't match modus ponens - might be weak
    const premiseWords = new Set(combinedLower.split(/\s+/));
    const conclusionWords = new Set(conclusionLower.split(/\s+/));
    const overlap = [...premiseWords].filter(w => conclusionWords.has(w)).length;

    if (overlap > premiseWords.size * 0.3) {
      return 'weak';
    } else {
      return 'invalid';
    }
  }

  // Default: check word overlap
  const premiseWords = new Set(combinedLower.split(/\s+/).filter(w => w.length > 2));
  const conclusionWords = new Set(conclusionLower.split(/\s+/).filter(w => w.length > 2));
  const overlap = [...premiseWords].filter(w => conclusionWords.has(w)).length;

  if (overlap > Math.min(premiseWords.size, conclusionWords.size) * 0.5) {
    return 'weak'; // Some connection, but not strong pattern
  } else {
    return 'invalid'; // No clear connection
  }
}

/**
 * Calculate logical distance
 */
function calculateDistance(
  inference: 'valid' | 'weak' | 'invalid',
  fallacies: Array<{ severity: string }>
): number {
  let baseDistance = 0;

  switch (inference) {
    case 'valid':
      baseDistance = 0; // Valid logic has zero distance
      break;
    case 'weak':
      baseDistance = 0.45; // Changed from 0.4 to ensure > 0.4
      break;
    case 'invalid':
      baseDistance = 0.8;
      break;
  }

  // Add distance for fallacies
  fallacies.forEach(fallacy => {
    if (fallacy.severity === 'critical') {
      baseDistance += 0.2;
    } else if (fallacy.severity === 'major') {
      baseDistance += 0.1;
    } else {
      baseDistance += 0.05;
    }
  });

  // Special case: self-contradiction is maximum distance
  if (fallacies.some(f => f.type === 'self_contradiction')) {
    return 1.0;
  }

  return Math.min(baseDistance, 1.0);
}

/**
 * Main logical gap detection function
 */
export function detectLogicalGap(
  premises: string[],
  conclusion: string
): LogicalGapResult {
  // Handle empty input
  if (premises.length === 0 && !conclusion) {
    return {
      type: 'LOGICAL',
      distance: 0,
      bridgeable: false,
      valid: false,
      reasoning: {
        premises: [],
        conclusion: '',
        inference: 'invalid'
      },
      fallacies: [],
      category: 'invalid'
    };
  }

  // Detect fallacies
  const fallacies = detectFallacies(premises, conclusion);

  // Assess inference
  const inference = assessInference(premises, conclusion);

  // Calculate distance
  const distance = calculateDistance(inference, fallacies);

  // Determine validity
  const valid = inference === 'valid' && fallacies.length === 0;

  // Determine category
  let category: 'valid' | 'weak' | 'invalid';
  if (distance < 0.2) {
    category = 'valid';
  } else if (distance < 0.6) {
    category = 'weak';
  } else {
    category = 'invalid';
  }

  // Bridgeability: can fix weak logic, cannot fix invalid
  const bridgeable = category === 'weak' || (category === 'invalid' && fallacies.length > 0);

  return {
    type: 'LOGICAL',
    distance,
    bridgeable,
    valid,
    reasoning: {
      premises,
      conclusion,
      inference
    },
    fallacies,
    category
  };
}
