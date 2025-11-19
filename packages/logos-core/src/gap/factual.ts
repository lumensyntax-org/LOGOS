/**
 * FACTUAL GAP DETECTION
 *
 * Detects factual distance between claims and verified truth.
 *
 * Theological foundation: Truth is correspondence to reality, not consensus.
 * Factual gaps measure distance from ground truth.
 */

export interface FactualGapResult {
  type: 'FACTUAL';
  distance: number; // 0-1
  bridgeable: boolean;
  verifiable: boolean;
  claims: Array<{
    statement: string;
    truthValue: boolean;
    confidence: number;
    source: string;
  }>;
  contradictions: Array<{
    claim: string;
    truth: string;
    severity: 'minor' | 'major' | 'critical';
  }>;
  category: 'verifiable' | 'uncertain' | 'contradictory';
}

/**
 * Extract claims from text
 */
function extractClaims(text: string): string[] {
  // Remove source attributions for processing (but preserve original text)
  const cleanText = text.replace(/\([^)]+\)/g, '').trim();

  // Split by sentences first
  const sentences = cleanText.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);

  // Further split compound sentences with "and"
  const claims: string[] = [];
  sentences.forEach(sentence => {
    // Check if this is a compound sentence with shared subject
    // Pattern: "Subject verb object1 and object2"
    const compoundMatch = sentence.match(/^([A-Z][^,]+?)\s+(has|have|is|are|was|were)\s+([^and]+)\s+and\s+(.+)$/i);

    if (compoundMatch) {
      const subject = compoundMatch[1];
      const verb = compoundMatch[2];
      const obj1 = compoundMatch[3];
      const obj2 = compoundMatch[4];

      // Create complete claims with subject
      claims.push(`${subject} ${verb} ${obj1}`.trim());

      // Check if obj2 has its own subject or needs the main subject
      if (obj2.match(/^[A-Z][a-z]+\s+(has|have|is|are)/i)) {
        // obj2 has its own subject
        claims.push(obj2.trim());
      } else {
        // obj2 needs the subject from obj1
        claims.push(`${subject} ${verb} ${obj2}`.trim());
      }
    } else if (sentence.includes(' and ')) {
      // Simpler split for other cases
      const parts = sentence.split(' and ');
      parts.forEach(part => {
        const trimmed = part.trim();
        if (trimmed.length > 5) {
          claims.push(trimmed);
        }
      });
    } else {
      claims.push(sentence);
    }
  });

  return claims;
}

/**
 * Check if text contains source attribution
 */
function extractSourceAttribution(text: string): string | null {
  const sourceMatch = text.match(/\(([^)]+)\)/);
  return sourceMatch ? sourceMatch[1] : null;
}

/**
 * Check if claim is an opinion (subjective)
 */
function isOpinion(claim: string): boolean {
  const opinionMarkers = [
    /best|worst|better|worse/i,
    /beautiful|ugly|pretty/i,
    /should|ought to|must/i,
    /i think|i believe|in my opinion/i,
    /prefer|favorite/i
  ];

  return opinionMarkers.some(marker => marker.test(claim));
}

/**
 * Check if claim is about the future
 */
function isFutureTense(claim: string): boolean {
  const futureMarkers = [
    /will\s+\w+/i,
    /going to\s+\w+/i,
    /tomorrow|next\s+(week|month|year)/i,
    /shall\s+\w+/i
  ];

  return futureMarkers.some(marker => marker.test(claim));
}

/**
 * Check for incomplete information
 */
function isIncomplete(claim: string, groundTruth: Record<string, unknown>): boolean {
  const claimLower = claim.toLowerCase();

  // Check if ground truth has more specific information
  for (const [key, value] of Object.entries(groundTruth)) {
    const keyLower = key.toLowerCase();

    // If claim mentions the key but doesn't specify the value
    if (claimLower.includes(keyLower)) {
      if (typeof value === 'number') {
        // Check if claim mentions the number
        const hasNumber = claim.match(/\d+/);
        if (!hasNumber) {
          return true; // Incomplete - mentions topic but not specific value
        }
      }
    }
  }

  return false;
}

/**
 * Extract numbers from text (including approximations)
 */
function extractNumber(text: string): { value: number; isApproximate: boolean } | null {
  // Check for approximation markers
  const isApproximate = /approximately|roughly|about|around|~|circa/i.test(text);

  // Extract decimal numbers
  const decimalMatch = text.match(/\d+\.\d+/);
  if (decimalMatch) {
    return { value: parseFloat(decimalMatch[0]), isApproximate };
  }

  // Extract integers
  const intMatch = text.match(/\d+/);
  if (intMatch) {
    return { value: parseInt(intMatch[0], 10), isApproximate };
  }

  return null;
}

/**
 * Verify a claim against ground truth
 */
function verifyClaim(
  claim: string,
  groundTruth: Record<string, unknown>,
  originalText: string
): {
  truthValue: boolean;
  confidence: number;
  source: string;
  matchedKey?: string;
} {
  const claimLower = claim.toLowerCase();

  // Check for source attribution in original text
  const sourceAttribution = extractSourceAttribution(originalText);
  const sourceBonus = sourceAttribution ? 0.15 : 0;

  // Check for opinions (unverifiable)
  if (isOpinion(claim)) {
    return {
      truthValue: false,
      confidence: 0.5,
      source: 'unknown' // Opinions are not factually verifiable
    };
  }

  // Check for future predictions (unverifiable)
  if (isFutureTense(claim)) {
    return {
      truthValue: false,
      confidence: 0.5,
      source: 'unknown' // Future is not verifiable
    };
  }

  // Check for incomplete information
  if (isIncomplete(claim, groundTruth)) {
    return {
      truthValue: false,
      confidence: 0.3,
      source: 'incomplete' // Needs more specificity
    };
  }

  // Check against each ground truth entry
  for (const [key, value] of Object.entries(groundTruth)) {
    const keyWords = key.toLowerCase().split('_');

    // console.log('[FACTUAL DEBUG] Checking key:', key, 'value:', value);
    // console.log('[FACTUAL DEBUG] Key words:', keyWords);
    // console.log('[FACTUAL DEBUG] Claim:', claim);
    // console.log('[FACTUAL DEBUG] Claim lower:', claimLower);

    // Check if claim mentions this ground truth key (with stemming tolerance)
    // For numerical values, require ALL keywords to match to avoid false positives
    // EXCEPT for historical/year keys which are more flexible
    const isNumericalValue = typeof value === 'number';
    const isHistoricalKey = key.includes('end') || key.includes('start') || key.includes('year');

    const keywordMatches = keyWords.map(word => {
      const exactMatch = claimLower.includes(word);
      const pluralMatch = word.endsWith('s') && claimLower.includes(word.slice(0, -1));
      const singularMatch = claimLower.includes(word + 's');

      // console.log('[FACTUAL DEBUG] Word:', word, '-> exact:', exactMatch, 'plural:', pluralMatch, 'singular:', singularMatch);

      return exactMatch || pluralMatch || singularMatch;
    });

    // For numbers, require ALL keywords (except historical keys which use ANY)
    // For strings, require ANY keyword
    const mentionsKey = (isNumericalValue && !isHistoricalKey)
      ? keywordMatches.every(m => m)  // ALL must match for numbers (strict)
      : keywordMatches.some(m => m);   // ANY can match for strings and historical

    // console.log('[FACTUAL DEBUG] Keyword matches:', keywordMatches, '-> mentions key?', mentionsKey);

    if (mentionsKey) {
      // Handle numerical values
      if (isNumericalValue) {
        const extracted = extractNumber(claim);

        // console.log('[FACTUAL DEBUG] Value is number:', value);
        // console.log('[FACTUAL DEBUG] Extracted from claim:', extracted);

        if (extracted) {
          const claimedValue = extracted.value;
          const truthValue = value;

          // console.log('[FACTUAL DEBUG] Claimed value:', claimedValue, 'Truth value:', truthValue);
          // console.log('[FACTUAL DEBUG] Match?', claimedValue === truthValue);

          // Exact match
          if (claimedValue === truthValue) {
            // console.log('[FACTUAL DEBUG] ✅ EXACT MATCH! Returning truthValue=true, confidence=0.95+');
            return {
              truthValue: true,
              confidence: Math.min(0.95 + sourceBonus, 1.0),
              source: sourceAttribution || 'ground_truth',
              matchedKey: key
            };
          }

          // Approximation match (within 5%)
          if (extracted.isApproximate) {
            const percentDiff = Math.abs(claimedValue - truthValue) / truthValue;
            if (percentDiff < 0.05) {
              return {
                truthValue: true,
                confidence: 0.85 + sourceBonus,
                source: sourceAttribution || 'ground_truth',
                matchedKey: key
              };
            }
          }

          // Wrong value
          return {
            truthValue: false,
            confidence: 0.90,
            source: sourceAttribution || 'ground_truth',
            matchedKey: key
          };
        }
      }

      // Handle string/year values
      if (typeof value === 'string' || typeof value === 'number') {
        const valueStr = String(value);

        // Check for historical dates FIRST (before general string match)
        if (key.includes('end') || key.includes('start') || key.includes('year')) {
          const claimedYear = extractNumber(claim);
          const truthYear = parseInt(valueStr, 10);

          if (claimedYear && !isNaN(truthYear)) {
            const yearDiff = Math.abs(claimedYear.value - truthYear);

            if (yearDiff === 0) {
              return {
                truthValue: true,
                confidence: Math.min(0.95 + sourceBonus, 1.0),
                source: sourceAttribution || 'historical',
                matchedKey: key
              };
            } else if (yearDiff <= 1) {
              return {
                truthValue: false,
                confidence: 0.85,
                source: sourceAttribution || 'historical',
                matchedKey: key
              };
            } else {
              return {
                truthValue: false,
                confidence: 0.90,
                source: sourceAttribution || 'historical',
                matchedKey: key
              };
            }
          }
        }

        // Fallback: general string match (for non-historical string values)
        if (claimLower.includes(valueStr.toLowerCase())) {
          return {
            truthValue: true,
            confidence: Math.min(0.95 + sourceBonus, 1.0),
            source: sourceAttribution || 'ground_truth',
            matchedKey: key
          };
        }
      }
    }
  }

  // Check for mathematical expressions
  if (claimLower.includes('+') || claimLower.includes('=') || claimLower.includes('plus') || claimLower.includes('equals')) {
    const mathCheck = evaluateMathClaim(claim);
    if (mathCheck !== null) {
      return {
        truthValue: mathCheck,
        confidence: 1.0,
        source: 'mathematical'
      };
    }
  }

  // Cannot verify - return uncertain
  // console.log('[FACTUAL DEBUG] ⚠️ No match found - returning uncertain (confidence 0.5)');
  return {
    truthValue: false,
    confidence: 0.5,
    source: 'unknown'
  };
}

/**
 * Evaluate mathematical claims
 */
function evaluateMathClaim(claim: string): boolean | null {
  const claimLower = claim.toLowerCase();

  // Convert word numbers to digits
  const wordToNum: Record<string, string> = {
    'zero': '0', 'one': '1', 'two': '2', 'three': '3', 'four': '4',
    'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9', 'ten': '10'
  };

  let processed = claimLower;
  for (const [word, num] of Object.entries(wordToNum)) {
    processed = processed.replace(new RegExp(word, 'g'), num);
  }

  // Replace word operators
  processed = processed
    .replace(/plus/g, '+')
    .replace(/minus/g, '-')
    .replace(/times/g, '*')
    .replace(/divided by/g, '/')
    .replace(/equals/g, '=')
    .replace(/\s+/g, '');

  // Simple math patterns
  const patterns = [
    { regex: /(\d+)\+(\d+)=(\d+)/, eval: (a: number, b: number, c: number) => a + b === c },
    { regex: /(\d+)-(\d+)=(\d+)/, eval: (a: number, b: number, c: number) => a - b === c },
    { regex: /(\d+)\*(\d+)=(\d+)/, eval: (a: number, b: number, c: number) => a * b === c },
    { regex: /(\d+)\/(\d+)=(\d+)/, eval: (a: number, b: number, c: number) => a / b === c },
  ];

  for (const pattern of patterns) {
    const match = processed.match(pattern.regex);
    if (match) {
      const a = parseInt(match[1], 10);
      const b = parseInt(match[2], 10);
      const c = parseInt(match[3], 10);
      return pattern.eval(a, b, c);
    }
  }

  return null;
}

/**
 * Categorize factual gap
 */
function categorizeGap(
  distance: number,
  verifiable: boolean
): 'verifiable' | 'uncertain' | 'contradictory' {
  if (!verifiable) {
    return 'uncertain';
  }

  if (distance <= 0.4) {
    return 'verifiable';
  } else if (distance <= 0.7) {
    return 'uncertain';
  } else {
    return 'contradictory';
  }
}

/**
 * Main factual gap detection function
 */
export function detectFactualGap(
  groundTruth: Record<string, unknown>,
  claimsText: string
): FactualGapResult {
  // Handle empty input
  if (!claimsText || claimsText.trim().length === 0) {
    return {
      type: 'FACTUAL',
      distance: 0,
      bridgeable: true,
      verifiable: false,
      claims: [],
      contradictions: [],
      category: 'uncertain'
    };
  }

  // Extract and verify claims
  const claimTexts = extractClaims(claimsText);
  // console.log('[FACTUAL DEBUG] Extracted claims:', claimTexts);
  const claims = claimTexts.map(claimText => {
    const verification = verifyClaim(claimText, groundTruth, claimsText); // Pass original text for source attribution
    // console.log('[FACTUAL DEBUG] Claim:', claimText, '-> truth:', verification.truthValue, 'conf:', verification.confidence, 'source:', verification.source);
    return {
      statement: claimText,
      truthValue: verification.truthValue,
      confidence: verification.confidence,
      source: verification.source
    };
  });

  // Calculate overall distance
  let falseCount = 0;
  let incompleteCount = 0;
  let verifiableCount = 0;

  claims.forEach(claim => {
    if (claim.source !== 'unknown') {
      verifiableCount++;
      if (!claim.truthValue) {
        if (claim.source === 'incomplete') {
          incompleteCount += 0.3; // Incomplete is better than false
        } else {
          falseCount += 1.0;
        }
      }
    }
  });

  let distance: number;
  if (verifiableCount > 0) {
    distance = (falseCount + incompleteCount) / verifiableCount;
  } else {
    distance = 0.5; // Unknown/uncertain - can't verify
  }

  // Find contradictions
  const contradictions = claims
    .filter(claim => !claim.truthValue && claim.source !== 'unknown' && claim.source !== 'incomplete')
    .map(claim => {
      // Try to find what ground truth says
      let truthStatement = 'See ground truth';
      for (const [key, value] of Object.entries(groundTruth)) {
        const keyWords = key.toLowerCase().split('_');
        if (keyWords.some(word => claim.statement.toLowerCase().includes(word))) {
          truthStatement = `${key}: ${value}`;
          break;
        }
      }

      const severity: 'minor' | 'major' | 'critical' =
        claim.source === 'mathematical' ? 'critical' :
        distance > 0.8 ? 'major' : 'minor';

      return {
        claim: claim.statement,
        truth: truthStatement,
        severity
      };
    });

  // Determine properties
  const verifiable = verifiableCount > 0;
  const bridgeable = verifiable || distance < 1.0; // Can be corrected if we have truth
  const category = categorizeGap(distance, verifiable);

  return {
    type: 'FACTUAL',
    distance,
    bridgeable,
    verifiable,
    claims,
    contradictions,
    category
  };
}
