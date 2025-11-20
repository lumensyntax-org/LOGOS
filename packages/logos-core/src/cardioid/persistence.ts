/**
 * PERSISTENCIA - Memory That Endures
 *
 * "The memory of the just is with blessings" (Proverbs 10:7)
 *
 * Without persistence, Metanoia is amnesia—the system learns but forgets.
 * This module enables MarianMemory to be preserved across sessions,
 * allowing the verification system to mature over time.
 *
 * THEOLOGICAL FOUNDATION:
 * Memory in Scripture is not mere recall—it's anamnesis (ἀνάμνησις),
 * "making present again" what was past. The Eucharist is anamnesis of
 * Christ's sacrifice, making it present in each celebration.
 *
 * Similarly, persisted memory makes past learnings present in future cycles.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import type { MarianMemory, PonderedExperience, VerifierPosture } from './types.js';

/**
 * Serializable version of MarianMemory
 *
 * Dates are converted to ISO strings for JSON serialization.
 */
export interface SerializedMemory {
  pondered: Array<{
    gapPattern: {
      type: 'SEMANTIC' | 'FACTUAL' | 'LOGICAL' | 'ONTOLOGICAL';
      characteristics: string[];
    };
    mediationSuccess: boolean;
    wisdom: string;
    timestamp: string; // ISO date string
    mediationMode: string;
  }>;
  receptivityDepth: {
    semantic: number;
    factual: number;
    logical: number;
    ontological: number;
    overall: number;
  };
  cyclesCompleted: number;
}

/**
 * Serializable version of VerifierPosture
 */
export interface SerializedPosture {
  weights: {
    grounding_factual: number;
    semantic_coherence: number;
    logical_consistency: number;
    completeness: number;
  };
  thresholds: {
    allowThreshold: number;
    blockThreshold: number;
  };
  learningRate: number;
  history: Array<{
    cycleNumber: number;
    reason: string;
    dimension: string;
    oldValue: number;
    newValue: number;
    delta: number;
    timestamp: string; // ISO date string
  }>;
}

/**
 * Combined serialized state
 */
export interface SerializedState {
  memory: SerializedMemory;
  posture: SerializedPosture;
  version: string; // Schema version for future compatibility
  savedAt: string; // ISO timestamp
}

/**
 * Serialize MarianMemory to JSON-safe format
 *
 * Converts Date objects to ISO strings for JSON serialization.
 */
export function serializeMemory(memory: MarianMemory): SerializedMemory {
  return {
    pondered: memory.pondered.map(exp => ({
      gapPattern: exp.gapPattern,
      mediationSuccess: exp.mediationSuccess,
      wisdom: exp.wisdom,
      timestamp: exp.timestamp.toISOString(),
      mediationMode: exp.mediationMode
    })),
    receptivityDepth: memory.receptivityDepth,
    cyclesCompleted: memory.cyclesCompleted
  };
}

/**
 * Deserialize MarianMemory from JSON format
 *
 * Converts ISO strings back to Date objects.
 */
export function deserializeMemory(serialized: SerializedMemory): MarianMemory {
  return {
    pondered: serialized.pondered.map(exp => ({
      gapPattern: exp.gapPattern,
      mediationSuccess: exp.mediationSuccess,
      wisdom: exp.wisdom,
      timestamp: new Date(exp.timestamp),
      mediationMode: exp.mediationMode as any
    })),
    receptivityDepth: serialized.receptivityDepth,
    cyclesCompleted: serialized.cyclesCompleted
  };
}

/**
 * Serialize VerifierPosture to JSON-safe format
 */
export function serializePosture(posture: VerifierPosture): SerializedPosture {
  return {
    weights: posture.weights,
    thresholds: posture.thresholds,
    learningRate: posture.learningRate,
    history: posture.history.map(adj => ({
      cycleNumber: adj.cycleNumber,
      reason: adj.reason,
      dimension: adj.dimension,
      oldValue: adj.oldValue,
      newValue: adj.newValue,
      delta: adj.delta,
      timestamp: adj.timestamp.toISOString()
    }))
  };
}

/**
 * Deserialize VerifierPosture from JSON format
 */
export function deserializePosture(serialized: SerializedPosture): VerifierPosture {
  return {
    weights: serialized.weights,
    thresholds: serialized.thresholds,
    learningRate: serialized.learningRate,
    history: serialized.history.map(adj => ({
      cycleNumber: adj.cycleNumber,
      reason: adj.reason,
      dimension: adj.dimension as any,
      oldValue: adj.oldValue,
      newValue: adj.newValue,
      delta: adj.delta,
      timestamp: new Date(adj.timestamp)
    }))
  };
}

/**
 * Save memory and posture to file
 *
 * ANAMNESIS: Making present what was past by writing it to persistent storage.
 *
 * @param memory - The Marian memory to save
 * @param posture - The verifier posture to save
 * @param filePath - Where to save (absolute path)
 */
export async function saveState(
  memory: MarianMemory,
  posture: VerifierPosture,
  filePath: string
): Promise<void> {
  const state: SerializedState = {
    memory: serializeMemory(memory),
    posture: serializePosture(posture),
    version: '1.0.0',
    savedAt: new Date().toISOString()
  };

  const json = JSON.stringify(state, null, 2);

  // Ensure directory exists
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });

  // Write to file
  await fs.writeFile(filePath, json, 'utf-8');
}

/**
 * Load memory and posture from file
 *
 * ANAMNESIS: Making present what was past by reading from persistent storage.
 *
 * @param filePath - Where to load from (absolute path)
 * @returns Deserialized memory and posture
 * @throws Error if file doesn't exist or is corrupted
 */
export async function loadState(
  filePath: string
): Promise<{ memory: MarianMemory; posture: VerifierPosture }> {
  const json = await fs.readFile(filePath, 'utf-8');
  const state: SerializedState = JSON.parse(json);

  // Version check (future-proofing for schema migrations)
  if (!state.version || state.version !== '1.0.0') {
    throw new Error(
      `Incompatible state version: ${state.version}. Expected 1.0.0. ` +
      `Migration may be required.`
    );
  }

  return {
    memory: deserializeMemory(state.memory),
    posture: deserializePosture(state.posture)
  };
}

/**
 * Check if a persisted state file exists
 *
 * Useful for determining whether to load existing state or create new.
 */
export async function stateExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get default state file path
 *
 * By convention, saves to .logos/memory.json in current working directory.
 * This allows each project to have its own learned memory.
 *
 * THEOLOGICAL NOTE:
 * Memory is contextual—what's learned in one domain may not apply
 * to another. Each project gets its own "tradition" of verification wisdom.
 */
export function getDefaultStatePath(): string {
  return path.join(process.cwd(), '.logos', 'memory.json');
}

/**
 * Auto-save helper: save state to default location
 */
export async function autoSave(
  memory: MarianMemory,
  posture: VerifierPosture
): Promise<void> {
  const filePath = getDefaultStatePath();
  await saveState(memory, posture, filePath);
}

/**
 * Auto-load helper: load state from default location
 *
 * Returns null if no saved state exists (first run).
 */
export async function autoLoad(): Promise<{
  memory: MarianMemory;
  posture: VerifierPosture;
} | null> {
  const filePath = getDefaultStatePath();

  if (!(await stateExists(filePath))) {
    return null;
  }

  return await loadState(filePath);
}
