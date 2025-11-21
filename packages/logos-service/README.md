# @logos/service

HTTP service exposing LOGOS Christological verification via REST API.

## Quick Start

### Development

```bash
# Install dependencies
pnpm install

# Run in development mode
pnpm --filter @logos/service dev
```

Server starts on `http://localhost:8787`

### Docker

```bash
# Build and run with Docker Compose
docker-compose up --build

# Run with monitoring stack
docker-compose --profile monitoring up --build
```

## API Endpoints

### POST /logos/evaluate

Perform Christological verification on a manifestation.

**Request:**

```json
{
  "source": {
    "intent": "What is the capital of France?",
    "groundTruth": { "capital": "Paris" }
  },
  "manifestation": {
    "content": "The capital of France is Paris."
  },
  "signals": [
    { "name": "grounding_factual", "value": 1.0, "weight": 1.0 }
  ]
}
```

**Response:**

```json
{
  "decision": "ALLOW",
  "confidence": 0.95,
  "gap": {
    "overall": 0.05,
    "semantic": 0.02,
    "factual": 0.01,
    "logical": 0.01,
    "ontological": 0.01,
    "dominantType": "SEMANTIC",
    "bridgeable": true
  },
  "mediation": {
    "type": "direct",
    "kenosisApplied": 0.05,
    "resurrectionAttempted": false
  },
  "finalState": "original",
  "timestamp": "2025-01-21T19:00:00.000Z"
}
```

### GET /health

Health check endpoint.

**Response:**

```json
{
  "status": "ok",
  "uptime": 123.45,
  "timestamp": "2025-01-21T19:00:00.000Z",
  "version": "0.1.0",
  "services": {
    "redis": "connected",
    "core": "operational"
  }
}
```

### GET /metrics

Prometheus metrics endpoint for monitoring.

**Response:** Prometheus exposition format

```
# HELP logos_verifications_total Total number of verification requests processed
# TYPE logos_verifications_total counter
logos_verifications_total{decision="ALLOW"} 42

# HELP logos_gap_distance Gap distance measurements by dimension
# TYPE logos_gap_distance histogram
logos_gap_distance_bucket{le="0.1",dimension="semantic"} 35
...
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8787` | Server port |
| `HOST` | `0.0.0.0` | Server host |
| `NODE_ENV` | `development` | Environment |
| `REDIS_URL` | - | Redis connection URL |
| `LOG_LEVEL` | `info` | Logging level |
| `ALLOW_THRESHOLD` | `0.7` | Confidence threshold for ALLOW |
| `BLOCK_THRESHOLD` | `0.3` | Confidence threshold for BLOCK |
| `REDEMPTIVE_MODE` | `true` | Enable resurrection attempts |
| `MAX_RESURRECTION_ATTEMPTS` | `3` | Max resurrection attempts |
| `RATE_LIMIT_MAX` | `60` | Max requests per time window |
| `RATE_LIMIT_WINDOW` | `1 minute` | Rate limit time window |
| `ALLOWED_ORIGINS` | `*` | CORS allowed origins |
| `SENTRY_DSN` | - | Sentry error tracking DSN |
| `SENTRY_ENABLED` | `false` | Enable Sentry in development |
| `SENTRY_TRACES_SAMPLE_RATE` | `0.1` | Performance tracing sample rate |
| `SENTRY_PROFILES_SAMPLE_RATE` | `0.1` | Profiling sample rate |
| `APP_VERSION` | `0.1.0` | Application version for Sentry releases |

## Architecture

```
┌─────────────────────────────────────────────┐
│           Client (HTTP/JSON)                │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│        Fastify HTTP Server                  │
│  ┌─────────────────────────────────────┐   │
│  │  Middleware Stack                    │   │
│  │  - CORS                              │   │
│  │  - Helmet (Security Headers)         │   │
│  │  - Rate Limiting (Redis-backed)      │   │
│  │  - Request Validation (Zod)          │   │
│  └─────────────────────────────────────┘   │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│          LOGOS Core Engine                  │
│  - Gap Detection (4D)                       │
│  - Kenosis (Self-limitation)                │
│  - Resurrection (Error recovery)            │
│  - Cardioid Architecture                    │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│            External Services                │
│  - Redis (Rate limiting, caching)           │
│  - Prometheus (Metrics - optional)          │
│  - Grafana (Visualization - optional)       │
└─────────────────────────────────────────────┘
```

## Performance

Target metrics:
- **Throughput**: 100-500 req/s (single instance)
- **Latency p50**: <20ms
- **Latency p99**: <100ms

### Load Testing

Run performance benchmarks:

```bash
# Basic test (30s, 10 connections)
pnpm load-test

# Hallucination detection test
pnpm load-test:hallucination

# Mixed workload (realistic)
pnpm load-test:mixed

# Stress test (100 connections)
pnpm load-test:stress
```

### Current Performance (Local)

- **Throughput**: ~4,800 req/s (10x target ✅)
- **Latency p50**: 1ms
- **Latency p99**: ~4ms

## Monitoring

LOGOS Service includes comprehensive monitoring:

- **Prometheus Metrics**: `GET /metrics` - Request rates, latencies, gap distances, decision distributions
- **Sentry Error Tracking**: Automatic error capture with verification context
- **Load Testing**: Autocannon-based performance benchmarking
- **Grafana Dashboards**: Pre-configured panels for key metrics

See [MONITORING.md](./MONITORING.md) for complete documentation.

## License

Apache-2.0
