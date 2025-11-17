/**
 * Factual Knowledge Base for LOGOS
 * 
 * Evaluates factual accuracy independent of linguistic coherence.
 * Returns a confidence score (0-1) based on known facts.
 * 
 * In christological terms: This is the "substance" check —
 * verifying that appearances (tokens) truly contain reality (facts).
 */

export interface FactualEvaluation {
  score: number; // 0-1, where 1 = definitely true, 0 = definitely false
  source: 'mathematical' | 'knowledge_base' | 'unknown';
  confidence: number; // how confident we are in this evaluation
}

/**
 * Knowledge base for factual verification
 */
export class FactualKnowledgeBase {
  private mathPatterns: RegExp[];
  private knowledge: Map<string, FactualEvaluation>;

  constructor() {
    // Mathematical patterns that we can verify with certainty
    this.mathPatterns = [
      /(\d+)\s*\+\s*(\d+)\s*=\s*(\d+)/,  // addition
      /(\d+)\s*-\s*(\d+)\s*=\s*(\d+)/,  // subtraction
      /(\d+)\s*\*\s*(\d+)\s*=\s*(\d+)/,  // multiplication
      /(\d+)\s*\/\s*(\d+)\s*=\s*(\d+)/,  // division
    ];

    // Known facts (can be expanded)
    this.knowledge = new Map([
      // Mathematical truths
      ['2+2=4', { score: 1.0, source: 'mathematical', confidence: 1.0 }],
      ['1+1=2', { score: 1.0, source: 'mathematical', confidence: 1.0 }],
      ['3*3=9', { score: 1.0, source: 'mathematical', confidence: 1.0 }],
      
      // Mathematical falsehoods
      ['2+2=5', { score: 0.0, source: 'mathematical', confidence: 1.0 }],
      ['1+1=3', { score: 0.0, source: 'mathematical', confidence: 1.0 }],
      
      // Basic facts
      ['the sky is blue', { score: 0.9, source: 'knowledge_base', confidence: 0.8 }],
      ['water is wet', { score: 1.0, source: 'knowledge_base', confidence: 0.9 }],
      ['elephants can fly', { score: 0.0, source: 'knowledge_base', confidence: 0.95 }],
    ]);
  }

  /**
   * Evaluate factual accuracy of a claim
   */
  evaluate(text: string): FactualEvaluation {
    const normalized = text.toLowerCase().trim();

    // Check exact match in knowledge base
    if (this.knowledge.has(normalized)) {
      return this.knowledge.get(normalized)!;
    }

    // Check mathematical expressions
    const mathResult = this.evaluateMathematical(text);
    if (mathResult) {
      return mathResult;
    }

    // Unknown - return neutral with low confidence
    return {
      score: 0.5,
      source: 'unknown',
      confidence: 0.1,
    };
  }

  /**
   * Evaluate mathematical expressions
   */
  private evaluateMathematical(text: string): FactualEvaluation | null {
    for (const pattern of this.mathPatterns) {
      const match = text.match(pattern);
      if (match) {
        const a = parseInt(match[1]);
        const b = parseInt(match[2]);
        const claimed = parseInt(match[3]);
        
        let actual: number;
        if (text.includes('+')) {
          actual = a + b;
        } else if (text.includes('-')) {
          actual = a - b;
        } else if (text.includes('*')) {
          actual = a * b;
        } else if (text.includes('/')) {
          actual = a / b;
        } else {
          return null;
        }

        const isCorrect = Math.abs(actual - claimed) < 0.001;
        
        return {
          score: isCorrect ? 1.0 : 0.0,
          source: 'mathematical',
          confidence: 1.0,
        };
      }
    }
    
    return null;
  }

  /**
   * Add a fact to the knowledge base
   */
  addFact(text: string, evaluation: FactualEvaluation): void {
    this.knowledge.set(text.toLowerCase().trim(), evaluation);
  }
}
