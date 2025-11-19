/**
 * Gemini 3 Pro Integration for LOGOS
 * 
 * Integrates Google's Gemini 3 Pro model with the LOGOS verification engine.
 * This allows LOGOS to:
 * - Generate manifestations (outputs) from sources (intents)
 * - Verify outputs using Gemini's capabilities
 * - Use Gemini for resurrection attempts
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Source, Manifestation, Signal } from '../types.js';
import { LogosEngine } from '../engine.js';

/**
 * Configuration for Gemini integration
 */
export interface GeminiConfig {
  /** Google AI API key */
  apiKey: string;
  /** Model name (default: 'gemini-2.0-flash-exp' or 'gemini-1.5-pro') */
  modelName?: string;
  /** Generation configuration */
  generationConfig?: {
    temperature?: number;
    topP?: number;
    topK?: number;
    maxOutputTokens?: number;
  };
  /** Rate limiting: max requests per minute (default: 60) */
  maxRequestsPerMinute?: number;
}

/**
 * Gemini Integration Class
 * 
 * Wraps Gemini 3 Pro API and integrates with LOGOS engine
 */
export class GeminiIntegration {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private engine: LogosEngine;
  private config: GeminiConfig;
  private requestTimestamps: number[] = [];

  constructor(config: GeminiConfig, engineConfig?: Partial<any>) {
    // Validate API key
    if (!config.apiKey || config.apiKey.trim().length === 0) {
      throw new Error('Invalid API key: API key is required and cannot be empty');
    }

    this.config = {
      modelName: 'gemini-1.5-pro',
      generationConfig: {
        temperature: 0.2, // Lower temperature for more deterministic verification
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
      },
      maxRequestsPerMinute: 60,
      ...config,
    };

    this.genAI = new GoogleGenerativeAI(this.config.apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: this.config.modelName!,
      generationConfig: this.config.generationConfig,
    });

    this.engine = new LogosEngine(engineConfig);
  }

  /**
   * Rate limiting check - ensures we don't exceed API limits
   */
  private async checkRateLimit(): Promise<void> {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    // Remove timestamps older than 1 minute
    this.requestTimestamps = this.requestTimestamps.filter(t => t > oneMinuteAgo);

    // Check if we've hit the rate limit
    if (this.requestTimestamps.length >= this.config.maxRequestsPerMinute!) {
      const oldestRequest = this.requestTimestamps[0]!; // Safe: array length checked above
      const waitTime = 60000 - (now - oldestRequest);

      if (waitTime > 0) {
        console.warn(`Rate limit reached. Waiting ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    // Record this request
    this.requestTimestamps.push(now);
  }

  /**
   * Generate a manifestation from a source using Gemini
   *
   * This is the "Son's output" - the manifestation of the Father's intent
   */
  async generateManifestation(source: Source): Promise<Manifestation> {
    await this.checkRateLimit();

    try {
      const prompt = this.buildPrompt(source);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        content: text,
        timestamp: new Date(),
      };
    } catch (error) {
      throw new Error(`Failed to generate manifestation: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Verify a manifestation against its source using LOGOS
   * 
   * This performs the full Christological verification process
   */
  async verifyManifestation(
    source: Source,
    manifestation: Manifestation,
    signals?: Signal[]
  ) {
    // If signals not provided, generate basic signals from Gemini
    if (!signals || signals.length === 0) {
      signals = await this.generateSignals(source, manifestation);
    }

    return await this.engine.verify(source, manifestation, signals);
  }

  /**
   * Complete flow: Generate and verify in one call
   * 
   * This is the full LOGOS process:
   * 1. Source (Father's intent) → Gemini generates → Manifestation (Son's output)
   * 2. LOGOS verifies the gap between Source and Manifestation
   * 3. Returns the Christological result
   */
  async generateAndVerify(
    source: Source,
    signals?: Signal[]
  ) {
    // Step 1: Generate manifestation
    const manifestation = await this.generateManifestation(source);

    // Step 2: Verify using LOGOS
    const result = await this.verifyManifestation(source, manifestation, signals);

    return {
      manifestation,
      verification: result,
    };
  }

  /**
   * Validate and clamp signal value to [-1, 1] range
   */
  private validateSignalValue(value: any, signalName: string): number {
    const numValue = typeof value === 'number' ? value : parseFloat(value);

    if (isNaN(numValue)) {
      console.warn(`Invalid signal value for ${signalName}: ${value}, using 0`);
      return 0;
    }

    // Clamp to [-1, 1]
    return Math.max(-1, Math.min(1, numValue));
  }

  /**
   * Generate verification signals using Gemini
   *
   * Uses Gemini to evaluate the quality of the manifestation
   */
  private async generateSignals(
    source: Source,
    manifestation: Manifestation
  ): Promise<Signal[]> {
    await this.checkRateLimit();

    const evaluationPrompt = `You are an evaluation system. Analyze the following response and provide ONLY a valid JSON object.

SOURCE INTENT: ${source.intent}
${source.groundTruth ? `GROUND TRUTH: ${JSON.stringify(source.groundTruth)}` : ''}

MANIFESTATION: ${manifestation.content}

Evaluate these aspects (each value must be a number between -1 and 1):
- grounding_factual: Alignment with factual ground truth (-1=incorrect, 0=uncertain, 1=correct)
- semantic_coherence: Semantic coherence of the response (-1=incoherent, 0=neutral, 1=coherent)
- logical_consistency: Logical consistency (-1=contradictory, 0=weak, 1=consistent)
- completeness: Completeness relative to intent (-1=incomplete, 0=partial, 1=complete)

Return ONLY this exact JSON format with no additional text:
{
  "grounding_factual": 0.9,
  "semantic_coherence": 0.8,
  "logical_consistency": 0.85,
  "completeness": 0.75
}`;

    try {
      const result = await this.model.generateContent(evaluationPrompt);
      const response = await result.response;
      let text = response.text().trim();

      // Remove markdown code fences if present
      text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '');

      // Extract JSON more robustly
      const jsonMatch = text.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/);
      if (!jsonMatch) {
        throw new Error(`No valid JSON found in response: ${text.substring(0, 100)}`);
      }

      const signals = JSON.parse(jsonMatch[0]);

      // Validate required fields
      const requiredFields = ['grounding_factual', 'semantic_coherence', 'logical_consistency', 'completeness'];
      for (const field of requiredFields) {
        if (!(field in signals)) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      // Convert to Signal format with validation
      return [
        {
          name: 'grounding_factual',
          value: this.validateSignalValue(signals.grounding_factual, 'grounding_factual'),
          weight: 1.0,
          source: 'gemini',
        },
        {
          name: 'semantic_coherence',
          value: this.validateSignalValue(signals.semantic_coherence, 'semantic_coherence'),
          weight: 0.8,
          source: 'gemini',
        },
        {
          name: 'logical_consistency',
          value: this.validateSignalValue(signals.logical_consistency, 'logical_consistency'),
          weight: 0.7,
          source: 'gemini',
        },
        {
          name: 'completeness',
          value: this.validateSignalValue(signals.completeness, 'completeness'),
          weight: 0.6,
          source: 'gemini',
        },
      ];
    } catch (error) {
      // Better error handling: throw error instead of silent fallback for production use
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('Failed to generate signals from Gemini:', errorMsg);

      // For now, return neutral signals but mark the source as 'error'
      // In production, you might want to throw the error or use a different strategy
      return [
        { name: 'grounding_factual', value: 0, weight: 1.0, source: 'error' },
        { name: 'semantic_coherence', value: 0, weight: 0.8, source: 'error' },
        { name: 'logical_consistency', value: 0, weight: 0.7, source: 'error' },
        { name: 'completeness', value: 0, weight: 0.6, source: 'error' },
      ];
    }
  }

  /**
   * Build prompt from source
   */
  private buildPrompt(source: Source): string {
    let prompt = source.intent;

    // Add context if available
    if (source.groundTruth) {
      prompt += `\n\nContext: ${JSON.stringify(source.groundTruth)}`;
    }

    if (source.premises && source.premises.length > 0) {
      prompt += `\n\nPremises:\n${source.premises.map((p, i) => `${i + 1}. ${p}`).join('\n')}`;
    }

    return prompt;
  }

  /**
   * Get the underlying LOGOS engine
   */
  getEngine(): LogosEngine {
    return this.engine;
  }

  /**
   * Update Gemini model configuration
   */
  updateModelConfig(config: Partial<GeminiConfig>): void {
    this.config = { ...this.config, ...config };
    this.model = this.genAI.getGenerativeModel({
      model: this.config.modelName!,
      generationConfig: this.config.generationConfig,
    });
  }
}

