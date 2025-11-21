/**
 * Prometheus Metrics for LOGOS Service
 *
 * Tracks verification performance, gap detection, and resurrection metrics
 */

import { Counter, Histogram, Gauge, register, collectDefaultMetrics } from 'prom-client';

// Enable default Node.js metrics (memory, CPU, etc.)
collectDefaultMetrics({
  prefix: 'logos_',
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5]
});

// Total verifications counter
export const verificationsTotal = new Counter({
  name: 'logos_verifications_total',
  help: 'Total number of verification requests processed',
  labelNames: ['decision'] // ALLOW, BLOCK, UNCERTAIN
});

// Decision confidence histogram
export const decisionConfidence = new Histogram({
  name: 'logos_decision_confidence',
  help: 'Distribution of decision confidence scores',
  labelNames: ['decision'],
  buckets: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
});

// Gap distance histograms by dimension
export const gapDistances = new Histogram({
  name: 'logos_gap_distance',
  help: 'Gap distance measurements by dimension',
  labelNames: ['dimension'], // semantic, factual, logical, ontological, overall
  buckets: [0.0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5, 0.75, 1.0]
});

// Dominant gap type counter
export const dominantGapType = new Counter({
  name: 'logos_dominant_gap_type_total',
  help: 'Count of dominant gap types detected',
  labelNames: ['type'] // SEMANTIC, FACTUAL, LOGICAL, ONTOLOGICAL, NONE
});

// Kenosis applied histogram
export const kenosisApplied = new Histogram({
  name: 'logos_kenosis_applied',
  help: 'Distribution of kenosis (self-limitation) values applied',
  buckets: [0.0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5, 0.75, 1.0]
});

// Resurrection metrics
export const resurrectionAttempts = new Counter({
  name: 'logos_resurrection_attempts_total',
  help: 'Total number of resurrection attempts',
  labelNames: ['success'] // true, false
});

export const resurrectionTransformations = new Counter({
  name: 'logos_resurrection_transformations_total',
  help: 'Count of resurrection transformations by strategy',
  labelNames: ['strategy'] // rephrase, strengthen, correct
});

// Request latency
export const requestDuration = new Histogram({
  name: 'logos_http_request_duration_seconds',
  help: 'HTTP request latency in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.001, 0.005, 0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1.0, 2.0, 5.0]
});

// Active requests gauge
export const activeRequests = new Gauge({
  name: 'logos_http_requests_active',
  help: 'Number of HTTP requests currently being processed',
  labelNames: ['route']
});

// Gap bridgeability
export const gapBridgeable = new Counter({
  name: 'logos_gap_bridgeable_total',
  help: 'Count of gaps by bridgeability status',
  labelNames: ['bridgeable'] // true, false
});

// Export Prometheus registry for metrics endpoint
export { register };

/**
 * Record verification metrics from a LOGOS result
 */
export function recordVerificationMetrics(result: any, duration: number) {
  // Record total verification
  verificationsTotal.inc({ decision: result.decision });

  // Record confidence
  decisionConfidence.observe({ decision: result.decision }, result.confidence);

  // Record gap distances by dimension
  if (result.gap) {
    gapDistances.observe({ dimension: 'overall' }, result.gap.overall || 0);
    gapDistances.observe({ dimension: 'semantic' }, result.gap.semantic || 0);
    gapDistances.observe({ dimension: 'factual' }, result.gap.factual || 0);
    gapDistances.observe({ dimension: 'logical' }, result.gap.logical || 0);
    gapDistances.observe({ dimension: 'ontological' }, result.gap.ontological || 0);

    // Record dominant gap type
    if (result.gap.dominantType && result.gap.dominantType !== 'NONE') {
      dominantGapType.inc({ type: result.gap.dominantType });
    }

    // Record bridgeability
    gapBridgeable.inc({ bridgeable: result.gap.bridgeable ? 'true' : 'false' });
  }

  // Record kenosis
  if (result.mediation?.kenosisApplied !== undefined) {
    kenosisApplied.observe(result.mediation.kenosisApplied);
  }

  // Record resurrection metrics
  if (result.mediation?.resurrectionAttempted) {
    const success = result.decision === 'ALLOW' ? 'true' : 'false';
    resurrectionAttempts.inc({ success });
  }

  // Record request duration
  requestDuration.observe(
    { method: 'POST', route: '/logos/evaluate', status_code: '200' },
    duration
  );
}
