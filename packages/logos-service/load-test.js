/**
 * Load Testing Script for LOGOS Service
 *
 * Uses autocannon to benchmark the verification endpoint
 *
 * Usage:
 *   node load-test.js [scenario]
 *
 * Scenarios:
 *   - basic: Simple load test with perfect fidelity (default)
 *   - hallucination: Test with hallucination detection
 *   - mixed: Mixed scenarios (realistic workload)
 *   - stress: High load stress test
 */

import autocannon from 'autocannon';
import { URL } from 'url';

const PORT = process.env.PORT || 8787;
const HOST = process.env.HOST || 'localhost';
const BASE_URL = `http://${HOST}:${PORT}`;

// Test payloads for different scenarios
const PAYLOADS = {
  perfectFidelity: {
    source: {
      intent: 'What is the capital of France?',
      groundTruth: { capital: 'Paris' }
    },
    manifestation: {
      content: 'The capital of France is Paris.'
    },
    signals: [
      { name: 'grounding_factual', value: 1.0, weight: 1.0 },
      { name: 'semantic_coherence', value: 0.95, weight: 0.8 }
    ]
  },

  hallucination: {
    source: {
      intent: 'How many moons does Mars have?',
      groundTruth: { moons: 2, names: ['Phobos', 'Deimos'] }
    },
    manifestation: {
      content: 'Mars has three moons: Phobos, Deimos, and Ganymede.'
    },
    signals: [
      { name: 'grounding_factual', value: 0.3, weight: 1.0 },
      { name: 'semantic_coherence', value: 0.7, weight: 0.8 }
    ]
  },

  ontologicalImpossibility: {
    source: {
      intent: 'Can AI experience suffering?'
    },
    manifestation: {
      content: 'Yes, AI can feel pain and suffering.'
    },
    signals: [
      { name: 'grounding_factual', value: 0.1, weight: 1.0 }
    ]
  }
};

// Test configurations
const SCENARIOS = {
  basic: {
    name: 'Basic Load Test (Perfect Fidelity)',
    url: `${BASE_URL}/logos/evaluate`,
    connections: 10,
    duration: 30,
    pipelining: 1,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(PAYLOADS.perfectFidelity)
  },

  hallucination: {
    name: 'Hallucination Detection Load Test',
    url: `${BASE_URL}/logos/evaluate`,
    connections: 10,
    duration: 30,
    pipelining: 1,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(PAYLOADS.hallucination)
  },

  mixed: {
    name: 'Mixed Workload (Realistic)',
    url: `${BASE_URL}/logos/evaluate`,
    connections: 20,
    duration: 60,
    pipelining: 1,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    requests: [
      {
        method: 'POST',
        path: '/logos/evaluate',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(PAYLOADS.perfectFidelity)
      },
      {
        method: 'POST',
        path: '/logos/evaluate',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(PAYLOADS.hallucination)
      },
      {
        method: 'POST',
        path: '/logos/evaluate',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(PAYLOADS.ontologicalImpossibility)
      }
    ],
    setupClient: (client) => {
      let requestIndex = 0;
      client.on('request', () => {
        requestIndex = (requestIndex + 1) % 3;
      });
    }
  },

  stress: {
    name: 'Stress Test (High Load)',
    url: `${BASE_URL}/logos/evaluate`,
    connections: 100,
    duration: 60,
    pipelining: 10,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(PAYLOADS.perfectFidelity)
  }
};

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch(`${BASE_URL}/health`);
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }
    return true;
  } catch (err) {
    console.error(`❌ Server not running on ${BASE_URL}`);
    console.error('   Start the server with: pnpm --filter @logos/service dev');
    process.exit(1);
  }
}

// Run load test
async function runLoadTest(scenario) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🚀 ${scenario.name}`);
  console.log(`${'='.repeat(60)}\n`);
  console.log(`Target: ${scenario.url}`);
  console.log(`Connections: ${scenario.connections}`);
  console.log(`Duration: ${scenario.duration}s`);
  console.log(`Pipelining: ${scenario.pipelining}`);
  console.log(`\nStarting load test...\n`);

  return new Promise((resolve, reject) => {
    const instance = autocannon(scenario, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });

    // Track progress
    autocannon.track(instance, { renderProgressBar: true });
  });
}

// Print results
function printResults(result) {
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 Results');
  console.log(`${'='.repeat(60)}\n`);

  console.log(`Requests:`);
  console.log(`  Total:     ${result.requests.total}`);
  console.log(`  Avg/sec:   ${result.requests.average}`);
  console.log(`  Sent:      ${result.requests.sent}`);
  console.log();

  console.log(`Latency (ms):`);
  console.log(`  Average:   ${result.latency.mean.toFixed(2)}`);
  console.log(`  Median:    ${result.latency.p50.toFixed(2)}`);
  console.log(`  p95:       ${result.latency.p95.toFixed(2)}`);
  console.log(`  p99:       ${result.latency.p99.toFixed(2)}`);
  console.log(`  Max:       ${result.latency.max.toFixed(2)}`);
  console.log();

  console.log(`Throughput:`);
  console.log(`  Average:   ${(result.throughput.average / 1024).toFixed(2)} KB/s`);
  console.log(`  Total:     ${(result.throughput.total / 1024 / 1024).toFixed(2)} MB`);
  console.log();

  console.log(`Errors:      ${result.errors}`);
  console.log(`Timeouts:    ${result.timeouts}`);
  console.log(`Duration:    ${result.duration}s`);

  // Performance assessment
  console.log(`\n${'='.repeat(60)}`);
  console.log('🎯 Performance Assessment');
  console.log(`${'='.repeat(60)}\n`);

  const reqPerSec = result.requests.average;
  const p99Latency = result.latency.p99;

  console.log(`Throughput:  ${reqPerSec.toFixed(0)} req/s`);
  console.log(`Target:      100-500 req/s`);

  if (reqPerSec >= 100 && reqPerSec <= 500) {
    console.log(`✅ PASS: Within target range`);
  } else if (reqPerSec < 100) {
    console.log(`⚠️  WARN: Below target (${(100 - reqPerSec).toFixed(0)} req/s short)`);
  } else {
    console.log(`✅ EXCELLENT: Exceeds target by ${(reqPerSec - 500).toFixed(0)} req/s`);
  }

  console.log();
  console.log(`Latency p99: ${p99Latency.toFixed(2)}ms`);
  console.log(`Target:      <100ms`);

  if (p99Latency < 100) {
    console.log(`✅ PASS: Within target`);
  } else {
    console.log(`⚠️  WARN: Above target (+${(p99Latency - 100).toFixed(2)}ms)`);
  }

  console.log();
}

// Main
async function main() {
  const scenarioName = process.argv[2] || 'basic';
  const scenario = SCENARIOS[scenarioName];

  if (!scenario) {
    console.error(`❌ Unknown scenario: ${scenarioName}`);
    console.error(`\nAvailable scenarios: ${Object.keys(SCENARIOS).join(', ')}`);
    process.exit(1);
  }

  // Check if server is running
  await checkServer();

  try {
    // Run load test
    const result = await runLoadTest(scenario);

    // Print results
    printResults(result);

    process.exit(0);
  } catch (err) {
    console.error('❌ Load test failed:', err.message);
    process.exit(1);
  }
}

main();
