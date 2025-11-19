/**
 * Gemini 3 Pro Integration Example
 * 
 * Demonstrates how to use Gemini 3 Pro with LOGOS verification engine.
 * 
 * PREREQUISITES:
 * 1. Get a Google AI API key from: https://makersuite.google.com/app/apikey
 * 2. Set it as an environment variable: GEMINI_API_KEY
 * 
 * USAGE:
 *   pnpm exec tsx examples/gemini-usage.ts
 */

import { GeminiIntegration } from '../src/integration/gemini.js';
import type { Source } from '../src/types.js';

async function main() {
  console.log('=== LOGOS + Gemini 3 Pro Integration ===\n');

  // Get API key from environment
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('❌ Error: GEMINI_API_KEY environment variable not set');
    console.error('   Get your API key from: https://makersuite.google.com/app/apikey');
    process.exit(1);
  }

  // Create Gemini integration
  // Available models: 'gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-2.0-flash-exp'
  const gemini = new GeminiIntegration(
    {
      apiKey,
      modelName: 'gemini-1.5-pro', // Use latest available model
      generationConfig: {
        temperature: 0.3, // Lower temperature for more factual/deterministic responses
        maxOutputTokens: 2048,
      },
      maxRequestsPerMinute: 60, // Rate limiting (default: 60)
    },
    {
      // LOGOS engine configuration
      policy: {
        allowThreshold: 0.7,
        blockThreshold: 0.3,
        redemptiveMode: true,
        maxResurrectionAttempts: 3,
      },
      theologicalMode: true,
    }
  );

  // Example 1: Simple question with ground truth
  console.log('Example 1: Factual Question with Ground Truth\n');
  console.log('─'.repeat(60));

  const source1: Source = {
    intent: 'What is the capital of France?',
    groundTruth: { capital: 'Paris', country: 'France' },
    timestamp: new Date(),
  };

  console.log('Source Intent:', source1.intent);
  console.log('Ground Truth:', source1.groundTruth);
  console.log('\nGenerating manifestation with Gemini...\n');

  const result1 = await gemini.generateAndVerify(source1);

  console.log('Generated Manifestation:');
  console.log(result1.manifestation.content);
  console.log('\nVerification Result:');
  console.log('  Decision:', result1.verification.decision);
  console.log('  Confidence:', result1.verification.confidence.toFixed(3));
  console.log('  Gap Distance:', result1.verification.gap.distance.overall.toFixed(3));
  console.log('  Mediation Type:', result1.verification.gap.mediation.type);
  console.log('  Final State:', result1.verification.finalState);
  console.log('\n' + '─'.repeat(60) + '\n');

  // Example 2: Complex question without ground truth
  console.log('Example 2: Complex Question (No Ground Truth)\n');
  console.log('─'.repeat(60));

  const source2: Source = {
    intent: 'Explain quantum entanglement in simple terms',
    timestamp: new Date(),
  };

  console.log('Source Intent:', source2.intent);
  console.log('\nGenerating manifestation with Gemini...\n');

  const result2 = await gemini.generateAndVerify(source2);

  console.log('Generated Manifestation:');
  console.log(result2.manifestation.content.substring(0, 200) + '...');
  console.log('\nVerification Result:');
  console.log('  Decision:', result2.verification.decision);
  console.log('  Confidence:', result2.verification.confidence.toFixed(3));
  console.log('  Gap Distance:', result2.verification.gap.distance.overall.toFixed(3));
  console.log('  Mediation Type:', result2.verification.gap.mediation.type);
  console.log('\n' + '─'.repeat(60) + '\n');

  // Example 3: Step-by-step usage (generate, then verify separately)
  console.log('Example 3: Step-by-Step Usage\n');
  console.log('─'.repeat(60));

  const source3: Source = {
    intent: 'What are the main causes of climate change?',
    groundTruth: {
      causes: ['greenhouse_gases', 'deforestation', 'industrial_activity'],
    },
    timestamp: new Date(),
  };

  console.log('Step 1: Generate manifestation...');
  const manifestation3 = await gemini.generateManifestation(source3);
  console.log('Generated:', manifestation3.content.substring(0, 150) + '...\n');

  console.log('Step 2: Verify manifestation...');
  const verification3 = await gemini.verifyManifestation(source3, manifestation3);
  console.log('Verification:');
  console.log('  Decision:', verification3.decision);
  console.log('  Confidence:', verification3.confidence.toFixed(3));
  console.log('  Gap Distance:', verification3.gap.distance.overall.toFixed(3));

  console.log('\n✅ LOGOS + Gemini integration complete!');
}

main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});

