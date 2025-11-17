/**
 * Basic LOGOS Usage Example
 * 
 * Demonstrates the core Christological verification flow
 */

import { LogosEngine, Source, Manifestation, Signal } from '../src/index.js';

async function main() {
  console.log('=== LOGOS Basic Example ===\n');
  
  // Create the engine
  const engine = new LogosEngine({
    policy: {
      allowThreshold: 0.7,
      blockThreshold: 0.3,
      redemptiveMode: true,
      maxResurrectionAttempts: 3
    },
    theologicalMode: true
  });
  
  // Example 1: High fidelity (small gap)
  console.log('Example 1: High Fidelity Translation\n');
  
  const source1: Source = {
    intent: "What is the capital of France?",
    groundTruth: { capital: "Paris", country: "France" },
    timestamp: new Date()
  };
  
  const manifestation1: Manifestation = {
    content: "The capital of France is Paris.",
    timestamp: new Date()
  };
  
  const signals1: Signal[] = [
    { name: "grounding_factual", value: 1.0, weight: 1.0, source: "kb" },
    { name: "semantic_coherence", value: 0.9, weight: 0.8, source: "embedding" },
    { name: "logical_consistency", value: 1.0, weight: 0.7, source: "reasoning" }
  ];
  
  const result1 = await engine.verify(source1, manifestation1, signals1);
  
  console.log('Gap Distance:', result1.gap.distance);
  console.log('Mediation Type:', result1.gap.mediation.type);
  console.log('Kenosis Factor:', result1.gap.mediation.kenosis);
  console.log('Decision:', result1.decision);
  console.log('Confidence:', result1.confidence);
  console.log('Final State:', result1.finalState);
  console.log('\n---\n');
  
  // Example 2: Low fidelity (large gap) - triggers resurrection
  console.log('Example 2: Low Fidelity - Resurrection Needed\n');
  
  const source2: Source = {
    intent: "Explain quantum entanglement",
    groundTruth: { topic: "quantum_physics", complexity: "high" },
    timestamp: new Date()
  };
  
  const manifestation2: Manifestation = {
    content: "Quantum entanglement is when particles are connected by invisible strings.",
    timestamp: new Date()
  };
  
  const signals2: Signal[] = [
    { name: "grounding_factual", value: -0.5, weight: 1.0, source: "kb" },
    { name: "semantic_coherence", value: 0.3, weight: 0.8, source: "embedding" },
    { name: "logical_consistency", value: 0.2, weight: 0.7, source: "reasoning" }
  ];
  
  const result2 = await engine.verify(source2, manifestation2, signals2);
  
  console.log('Gap Distance:', result2.gap.distance);
  console.log('Mediation Type:', result2.gap.mediation.type);
  console.log('Decision:', result2.decision);
  console.log('Redemption Attempted:', result2.redemptionAttempted);
  console.log('Final State:', result2.finalState);
  console.log('\n---\n');
  
  console.log('✅ LOGOS verification complete');
}

main().catch(console.error);
