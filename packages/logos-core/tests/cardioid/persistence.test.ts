/**
 * Tests for PERSISTENCIA - Memory That Endures
 *
 * Verifies that MarianMemory and VerifierPosture can be serialized,
 * saved, loaded, and deserialized correctly.
 *
 * THEOLOGICAL FOUNDATION:
 * "The memory of the just is with blessings" (Proverbs 10:7)
 *
 * Without persistence, learning is amnesia. Memory must endure across sessions.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'path';
import {
  serializeMemory,
  deserializeMemory,
  serializePosture,
  deserializePosture,
  saveState,
  loadState,
  stateExists,
  autoSave,
  autoLoad
} from '../../src/cardioid/persistence.js';
import { createMarianMemory } from '../../src/cardioid/memory.js';
import { createDefaultPosture } from '../../src/cardioid/metanoia.js';
import type { MarianMemory, VerifierPosture } from '../../src/cardioid/types.js';

describe('Persistencia - Memory Serialization', () => {
  const testDir = path.join(process.cwd(), '.test-logos');
  const testFile = path.join(testDir, 'test-memory.json');

  // Clean up test directory before and after tests
  beforeEach(async () => {
    try {
      await fs.mkdir(testDir, { recursive: true });
    } catch {
      // Directory may already exist
    }
  });

  afterEach(async () => {
    try {
      await fs.rm(testDir, { recursive: true });
    } catch {
      // Directory may not exist
    }
  });

  describe('serializeMemory / deserializeMemory', () => {
    it('serializes and deserializes empty memory correctly', () => {
      const memory = createMarianMemory();

      const serialized = serializeMemory(memory);
      const deserialized = deserializeMemory(serialized);

      expect(deserialized.pondered).toEqual([]);
      expect(deserialized.receptivityDepth).toEqual(memory.receptivityDepth);
      expect(deserialized.cyclesCompleted).toBe(0);
    });

    it('preserves pondered experiences through serialization', () => {
      const memory = createMarianMemory();

      // Add a pondered experience
      memory.pondered.push({
        gapPattern: {
          type: 'SEMANTIC',
          characteristics: ['conceptual_drift', 'transformation:metaphor']
        },
        mediationSuccess: true,
        wisdom: 'Semantic gaps can be bridged through transformation',
        timestamp: new Date('2024-01-15T10:00:00Z'),
        mediationMode: 'kenotic'
      });

      const serialized = serializeMemory(memory);
      const deserialized = deserializeMemory(serialized);

      expect(deserialized.pondered.length).toBe(1);
      expect(deserialized.pondered[0]?.gapPattern.type).toBe('SEMANTIC');
      expect(deserialized.pondered[0]?.wisdom).toContain('Semantic gaps');

      // Date should be preserved
      expect(deserialized.pondered[0]?.timestamp).toBeInstanceOf(Date);
      expect(deserialized.pondered[0]?.timestamp.toISOString()).toBe('2024-01-15T10:00:00.000Z');
    });

    it('preserves receptivity depth values', () => {
      const memory = createMarianMemory();

      // Modify receptivity
      memory.receptivityDepth.semantic = 0.75;
      memory.receptivityDepth.factual = 0.82;
      memory.receptivityDepth.logical = 0.68;
      memory.receptivityDepth.ontological = 0.91;
      memory.receptivityDepth.overall = 0.79;

      const serialized = serializeMemory(memory);
      const deserialized = deserializeMemory(serialized);

      expect(deserialized.receptivityDepth.semantic).toBe(0.75);
      expect(deserialized.receptivityDepth.factual).toBe(0.82);
      expect(deserialized.receptivityDepth.logical).toBe(0.68);
      expect(deserialized.receptivityDepth.ontological).toBe(0.91);
      expect(deserialized.receptivityDepth.overall).toBe(0.79);
    });

    it('preserves cycle count', () => {
      const memory = createMarianMemory();
      memory.cyclesCompleted = 42;

      const serialized = serializeMemory(memory);
      const deserialized = deserializeMemory(serialized);

      expect(deserialized.cyclesCompleted).toBe(42);
    });
  });

  describe('serializePosture / deserializePosture', () => {
    it('serializes and deserializes default posture correctly', () => {
      const posture = createDefaultPosture();

      const serialized = serializePosture(posture);
      const deserialized = deserializePosture(serialized);

      expect(deserialized.weights).toEqual(posture.weights);
      expect(deserialized.thresholds).toEqual(posture.thresholds);
      expect(deserialized.learningRate).toBe(0.1);
      expect(deserialized.history).toEqual([]);
    });

    it('preserves weight adjustments', () => {
      const posture = createDefaultPosture();

      posture.weights.grounding_factual = 1.2; // Adjusted up
      posture.weights.semantic_coherence = 0.95;

      const serialized = serializePosture(posture);
      const deserialized = deserializePosture(serialized);

      expect(deserialized.weights.grounding_factual).toBe(1.2);
      expect(deserialized.weights.semantic_coherence).toBe(0.95);
    });

    it('preserves threshold adjustments', () => {
      const posture = createDefaultPosture();

      posture.thresholds.allowThreshold = 0.65; // Relaxed
      posture.thresholds.blockThreshold = 0.25; // Tightened

      const serialized = serializePosture(posture);
      const deserialized = deserializePosture(serialized);

      expect(deserialized.thresholds.allowThreshold).toBe(0.65);
      expect(deserialized.thresholds.blockThreshold).toBe(0.25);
    });

    it('preserves adjustment history with dates', () => {
      const posture = createDefaultPosture();

      posture.history.push({
        cycleNumber: 1,
        reason: 'FACTUAL gap detected',
        dimension: 'grounding_factual',
        oldValue: 1.0,
        newValue: 1.08,
        delta: 0.08,
        timestamp: new Date('2024-01-15T10:00:00Z')
      });

      const serialized = serializePosture(posture);
      const deserialized = deserializePosture(serialized);

      expect(deserialized.history.length).toBe(1);
      expect(deserialized.history[0]?.cycleNumber).toBe(1);
      expect(deserialized.history[0]?.dimension).toBe('grounding_factual');
      expect(deserialized.history[0]?.delta).toBe(0.08);

      // Date should be preserved
      expect(deserialized.history[0]?.timestamp).toBeInstanceOf(Date);
      expect(deserialized.history[0]?.timestamp.toISOString()).toBe('2024-01-15T10:00:00.000Z');
    });
  });

  describe('saveState / loadState', () => {
    it('saves and loads state to file', async () => {
      const memory = createMarianMemory();
      const posture = createDefaultPosture();

      memory.cyclesCompleted = 5;
      posture.weights.grounding_factual = 1.1;

      await saveState(memory, posture, testFile);

      // Verify file exists
      const exists = await stateExists(testFile);
      expect(exists).toBe(true);

      // Load and verify
      const loaded = await loadState(testFile);

      expect(loaded.memory.cyclesCompleted).toBe(5);
      expect(loaded.posture.weights.grounding_factual).toBe(1.1);
    });

    it('creates directory if it does not exist', async () => {
      const deepPath = path.join(testDir, 'deep', 'nested', 'path', 'memory.json');

      const memory = createMarianMemory();
      const posture = createDefaultPosture();

      await saveState(memory, posture, deepPath);

      // Verify file exists in deep path
      const exists = await stateExists(deepPath);
      expect(exists).toBe(true);
    });

    it('saved state includes version and timestamp', async () => {
      const memory = createMarianMemory();
      const posture = createDefaultPosture();

      await saveState(memory, posture, testFile);

      // Read raw JSON
      const json = await fs.readFile(testFile, 'utf-8');
      const data = JSON.parse(json);

      expect(data.version).toBe('1.0.0');
      expect(data.savedAt).toBeDefined();

      // savedAt should be a valid ISO date
      const savedDate = new Date(data.savedAt);
      expect(savedDate.getTime()).toBeGreaterThan(0);
    });

    it('throws error if loading incompatible version', async () => {
      // Write a state file with incompatible version
      const badState = {
        version: '2.0.0', // Future version
        savedAt: new Date().toISOString(),
        memory: serializeMemory(createMarianMemory()),
        posture: serializePosture(createDefaultPosture())
      };

      await fs.writeFile(testFile, JSON.stringify(badState), 'utf-8');

      await expect(loadState(testFile)).rejects.toThrow(/Incompatible state version/);
    });

    it('preserves complex state with history', async () => {
      const memory = createMarianMemory();

      // Add multiple pondered experiences
      memory.pondered.push({
        gapPattern: {
          type: 'FACTUAL',
          characteristics: ['factual:contradictory']
        },
        mediationSuccess: true,
        wisdom: 'Factual gaps can be corrected',
        timestamp: new Date('2024-01-15T10:00:00Z'),
        mediationMode: 'redemptive'
      });

      memory.pondered.push({
        gapPattern: {
          type: 'SEMANTIC',
          characteristics: ['conceptual_drift']
        },
        mediationSuccess: false,
        wisdom: 'Some semantic gaps resist transformation',
        timestamp: new Date('2024-01-15T11:00:00Z'),
        mediationMode: 'kenotic'
      });

      memory.cyclesCompleted = 10;

      const posture = createDefaultPosture();

      // Add adjustment history
      posture.history.push({
        cycleNumber: 3,
        reason: 'FACTUAL gap',
        dimension: 'grounding_factual',
        oldValue: 1.0,
        newValue: 1.08,
        delta: 0.08,
        timestamp: new Date('2024-01-15T10:30:00Z')
      });

      posture.weights.grounding_factual = 1.2;

      await saveState(memory, posture, testFile);

      // Load and verify everything
      const loaded = await loadState(testFile);

      expect(loaded.memory.pondered.length).toBe(2);
      expect(loaded.memory.cyclesCompleted).toBe(10);
      expect(loaded.posture.history.length).toBe(1);
      expect(loaded.posture.weights.grounding_factual).toBe(1.2);

      // Verify dates are preserved
      expect(loaded.memory.pondered[0]?.timestamp).toBeInstanceOf(Date);
      expect(loaded.posture.history[0]?.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('stateExists', () => {
    it('returns true if file exists', async () => {
      const memory = createMarianMemory();
      const posture = createDefaultPosture();

      await saveState(memory, posture, testFile);

      const exists = await stateExists(testFile);
      expect(exists).toBe(true);
    });

    it('returns false if file does not exist', async () => {
      const exists = await stateExists(path.join(testDir, 'nonexistent.json'));
      expect(exists).toBe(false);
    });
  });

  describe('autoSave / autoLoad', () => {
    it('auto-saves to default location', async () => {
      const memory = createMarianMemory();
      const posture = createDefaultPosture();

      memory.cyclesCompleted = 7;

      await autoSave(memory, posture);

      // Verify file exists in default location
      const defaultPath = path.join(process.cwd(), '.logos', 'memory.json');
      const exists = await stateExists(defaultPath);
      expect(exists).toBe(true);

      // Clean up
      await fs.rm(path.join(process.cwd(), '.logos'), { recursive: true });
    });

    it('auto-loads from default location', async () => {
      const memory = createMarianMemory();
      const posture = createDefaultPosture();

      memory.cyclesCompleted = 12;
      posture.weights.semantic_coherence = 0.95;

      await autoSave(memory, posture);

      // Load it back
      const loaded = await autoLoad();

      expect(loaded).not.toBeNull();
      expect(loaded!.memory.cyclesCompleted).toBe(12);
      expect(loaded!.posture.weights.semantic_coherence).toBe(0.95);

      // Clean up
      await fs.rm(path.join(process.cwd(), '.logos'), { recursive: true });
    });

    it('returns null if no saved state exists', async () => {
      // Ensure no saved state
      try {
        await fs.rm(path.join(process.cwd(), '.logos'), { recursive: true });
      } catch {
        // May not exist
      }

      const loaded = await autoLoad();
      expect(loaded).toBeNull();
    });
  });

  describe('Round-trip Integration Test', () => {
    it('survives complete save/load cycle without data loss', async () => {
      // Create complex state
      const memory = createMarianMemory();
      memory.pondered.push({
        gapPattern: {
          type: 'LOGICAL',
          characteristics: ['logical:invalid', 'fallacy:affirming_consequent']
        },
        mediationSuccess: true,
        wisdom: 'Logical gaps can be repaired through resurrection',
        timestamp: new Date('2024-01-15T14:22:33Z'),
        mediationMode: 'redemptive'
      });

      memory.receptivityDepth.semantic = 0.77;
      memory.receptivityDepth.factual = 0.84;
      memory.receptivityDepth.logical = 0.71;
      memory.receptivityDepth.ontological = 0.93;
      memory.receptivityDepth.overall = 0.81;
      memory.cyclesCompleted = 23;

      const posture = createDefaultPosture();
      posture.weights.grounding_factual = 1.15;
      posture.weights.semantic_coherence = 0.92;
      posture.thresholds.allowThreshold = 0.68;
      posture.learningRate = 0.12;

      posture.history.push({
        cycleNumber: 5,
        reason: 'SEMANTIC gap detected',
        dimension: 'semantic_coherence',
        oldValue: 0.8,
        newValue: 0.92,
        delta: 0.12,
        timestamp: new Date('2024-01-15T14:20:00Z')
      });

      // Save
      await saveState(memory, posture, testFile);

      // Load
      const loaded = await loadState(testFile);

      // Verify EVERYTHING matches
      expect(loaded.memory.pondered.length).toBe(1);
      expect(loaded.memory.pondered[0]?.gapPattern.type).toBe('LOGICAL');
      expect(loaded.memory.pondered[0]?.wisdom).toContain('Logical gaps');
      expect(loaded.memory.pondered[0]?.timestamp.toISOString()).toBe('2024-01-15T14:22:33.000Z');

      expect(loaded.memory.receptivityDepth.semantic).toBe(0.77);
      expect(loaded.memory.receptivityDepth.factual).toBe(0.84);
      expect(loaded.memory.receptivityDepth.logical).toBe(0.71);
      expect(loaded.memory.receptivityDepth.ontological).toBe(0.93);
      expect(loaded.memory.receptivityDepth.overall).toBe(0.81);
      expect(loaded.memory.cyclesCompleted).toBe(23);

      expect(loaded.posture.weights.grounding_factual).toBe(1.15);
      expect(loaded.posture.weights.semantic_coherence).toBe(0.92);
      expect(loaded.posture.thresholds.allowThreshold).toBe(0.68);
      expect(loaded.posture.learningRate).toBe(0.12);

      expect(loaded.posture.history.length).toBe(1);
      expect(loaded.posture.history[0]?.cycleNumber).toBe(5);
      expect(loaded.posture.history[0]?.dimension).toBe('semantic_coherence');
      expect(loaded.posture.history[0]?.delta).toBe(0.12);
      expect(loaded.posture.history[0]?.timestamp.toISOString()).toBe('2024-01-15T14:20:00.000Z');
    });
  });
});
