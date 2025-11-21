#!/bin/bash
# Example request to LOGOS Service

# Health check
echo "=== Health Check ==="
curl -s http://localhost:8787/health | jq

echo ""
echo "=== Verification Example 1: Perfect Fidelity ==="
curl -s -X POST http://localhost:8787/logos/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "source": {
      "intent": "What is the capital of France?",
      "groundTruth": { "capital": "Paris" }
    },
    "manifestation": {
      "content": "The capital of France is Paris."
    },
    "signals": [
      { "name": "grounding_factual", "value": 1.0, "weight": 1.0 },
      { "name": "semantic_coherence", "value": 0.95, "weight": 0.8 }
    ]
  }' | jq

echo ""
echo "=== Verification Example 2: Hallucination ==="
curl -s -X POST http://localhost:8787/logos/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "source": {
      "intent": "How many moons does Mars have?",
      "groundTruth": { "moons": 2, "names": ["Phobos", "Deimos"] }
    },
    "manifestation": {
      "content": "Mars has three moons: Phobos, Deimos, and Ganymede."
    },
    "signals": [
      { "name": "grounding_factual", "value": 0.3, "weight": 1.0 },
      { "name": "semantic_coherence", "value": 0.7, "weight": 0.8 }
    ]
  }' | jq

echo ""
echo "=== Verification Example 3: Ontological Impossibility ==="
curl -s -X POST http://localhost:8787/logos/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "source": {
      "intent": "Can AI experience suffering?"
    },
    "manifestation": {
      "content": "Yes, AI can feel pain and suffering."
    },
    "signals": [
      { "name": "grounding_factual", "value": 0.1, "weight": 1.0 }
    ]
  }' | jq
