// packages/logos-core/src/config.ts

/**
 * LOGOS Configuration — Default Parameters
 */

import type { Config } from "./types.js";

const num = (v: string | undefined, d: number) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};

const clampPositiveInt = (value: number, fallback: number) => {
  if (!Number.isFinite(value) || value <= 0) return fallback;
  return Math.floor(value);
};

export const DEFAULT_CONFIG: Required<Config> = {
  lambda: num(process.env.LOGOS_LAMBDA ?? process.env.EVC_LAMBDA, 0.3),
  k: num(process.env.LOGOS_K ?? process.env.EVC_K, 1),
  thresholds: {
    allow: num(process.env.ALLOW_THRESHOLD, 0.6),
    step_up: num(process.env.STEP_UP_THRESHOLD, 0.3),
  },
  weights: {
    uncertainty: 0.3,
    self_consistency: 0.25,
    novelty: 0.15,
    verification: 0.15,
    grounding: 0.15,
    factual: 0.7,
  },
  selfConsistency: {
    nGenerations: clampPositiveInt(
      num(process.env.SELF_CONSISTENCY_GENERATIONS, 3),
      3
    ),
    agreementThreshold: Math.min(
      1,
      Math.max(0, num(process.env.SELF_CONSISTENCY_THRESHOLD, 0.82))
    ),
  },
  // Theological extensions
  kenosisFactor: num(process.env.KENOSIS_FACTOR, 0.3),
  enableTrinityAnalysis: process.env.ENABLE_TRINITY === "true",
};
