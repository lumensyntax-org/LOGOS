/**
 * LOGOS Core - Christological Architecture for AI Verification
 * 
 * "In the beginning was the Logos, and the Logos was with God,
 *  and the Logos was God." - John 1:1
 * 
 * This module exports the core functionality of LOGOS:
 * - Types: Fundamental theological-technical types
 * - Gap: Detection, measurement, and traversal of the mediating space
 * - Verification: The Spirit's work of truth-checking
 */

// Core types
export * from './types.js';

// Gap operations - the heart of Christological mediation
export * from './gap/index.js';

// Main verification engine
export { LogosEngine } from './engine.js';

// Integrations
export { GeminiIntegration, type GeminiConfig } from './integration/gemini.js';

// Cardioid Architecture - Heartbeat circulation pattern
export * from './cardioid/types.js';
export {
  createMarianMemory,
  ponder,
  recallWisdom,
  getReceptivityForGap,
  isMatureMemory
} from './cardioid/memory.js';
export { heartbeat, type HeartbeatConfig, type HeartbeatResult } from './cardioid/heartbeat.js';
export { circulate, circulateContinuously } from './cardioid/circulate.js';
export { CardioidGraph } from './cardioid/graph.js';
