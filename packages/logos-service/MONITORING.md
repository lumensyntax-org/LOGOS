# Monitoring and Observability Guide

Complete guide for monitoring LOGOS Service in production.

## Table of Contents

1. [Metrics (Prometheus)](#metrics-prometheus)
2. [Error Tracking (Sentry)](#error-tracking-sentry)
3. [Load Testing](#load-testing)
4. [Dashboards](#dashboards)
5. [Alerts](#alerts)

---

## Metrics (Prometheus)

### Overview

LOGOS Service exposes Prometheus metrics at `GET /metrics` for monitoring verification performance, system health, and resource usage.

### Key Metrics

#### Verification Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `logos_verifications_total` | Counter | Total verifications by decision (ALLOW/BLOCK/STEP_UP) |
| `logos_decision_confidence` | Histogram | Distribution of confidence scores |
| `logos_gap_distance` | Histogram | Gap distances by dimension (semantic/factual/logical/ontological/overall) |
| `logos_dominant_gap_type_total` | Counter | Count by dominant gap type |
| `logos_gap_bridgeable_total` | Counter | Count of gaps by bridgeability |
| `logos_kenosis_applied` | Histogram | Distribution of kenosis (self-limitation) values |
| `logos_resurrection_attempts_total` | Counter | Resurrection attempts by success status |
| `logos_resurrection_transformations_total` | Counter | Transformations by strategy |

#### HTTP Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `logos_http_request_duration_seconds` | Histogram | Request latency by route/method/status |
| `logos_http_requests_active` | Gauge | Currently processing requests |

#### System Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `logos_process_cpu_*` | Counter | CPU usage (user/system/total) |
| `logos_process_resident_memory_bytes` | Gauge | Memory usage (RSS) |
| `logos_process_heap_bytes` | Gauge | Heap memory usage |
| `logos_nodejs_gc_duration_seconds` | Histogram | Garbage collection duration |

### Example Queries

#### Request Rate
```promql
# Requests per second
rate(logos_verifications_total[5m])

# By decision type
rate(logos_verifications_total{decision="ALLOW"}[5m])
```

#### Latency Percentiles
```promql
# p50 latency
histogram_quantile(0.5, logos_http_request_duration_seconds_bucket)

# p95 latency
histogram_quantile(0.95, logos_http_request_duration_seconds_bucket)

# p99 latency
histogram_quantile(0.99, logos_http_request_duration_seconds_bucket)
```

#### Gap Analysis
```promql
# Average gap distance by dimension
rate(logos_gap_distance_sum{dimension="semantic"}[5m])
  / rate(logos_gap_distance_count{dimension="semantic"}[5m])

# Gap types distribution
sum by (type) (rate(logos_dominant_gap_type_total[5m]))
```

#### Error Rate
```promql
# 5xx error rate
rate(logos_http_request_duration_seconds_count{status_code=~"5.."}[5m])
```

### Scraping Configuration

Add to `prometheus.yml`:

```yaml
scrape_configs:
  - job_name: 'logos-service'
    static_configs:
      - targets: ['logos-service:8787']
    metrics_path: '/metrics'
    scrape_interval: 15s
```

---

## Error Tracking (Sentry)

### Setup

1. **Create Sentry Project**: https://sentry.io

2. **Configure DSN**:
```bash
export SENTRY_DSN="https://[key]@sentry.io/[project]"
export SENTRY_ENABLED="true"  # Enable in development
export SENTRY_TRACES_SAMPLE_RATE="0.1"  # 10% of transactions
export APP_VERSION="0.1.0"  # For release tracking
```

3. **Verify**: Check Sentry dashboard for incoming events

### Features

#### Automatic Error Capture
- All 500+ HTTP errors captured automatically
- Request context included (method, URL, headers)
- Stack traces with source maps

#### Verification Context
Errors during verification include LOGOS-specific context:
- Decision type (ALLOW/BLOCK/STEP_UP)
- Confidence score
- Gap measurements (overall, dominant type)
- Source intent & manifestation content

#### Performance Monitoring
- Transaction tracking for each verification
- Slow query detection
- Database query tracking (if enabled)

#### Error Filtering
Automatically ignores expected errors:
- Validation errors (400)
- Rate limit errors (429)
- Client disconnects (ECONNRESET, EPIPE)

### Example Queries

**High Error Rate Alert**:
```
event.type:error event.environment:production
```

**Slow Verifications**:
```
transaction.op:verification transaction.duration:>1000
```

**Specific Decision Failures**:
```
tags.decision:BLOCK event.level:error
```

### Release Tracking

Deploy with version tracking:
```bash
export APP_VERSION="1.0.0"
export SENTRY_RELEASE="logos-service@1.0.0"
```

---

## Load Testing

### Running Tests

#### Basic Test (30s, 10 connections)
```bash
pnpm load-test
```

#### Hallucination Detection Test
```bash
pnpm load-test:hallucination
```

#### Mixed Workload (60s, 20 connections)
```bash
pnpm load-test:mixed
```

#### Stress Test (60s, 100 connections)
```bash
pnpm load-test:stress
```

### Custom Tests

```bash
node load-test.js [scenario]
```

**Available scenarios**: basic, hallucination, mixed, stress

### Performance Targets

| Metric | Target | Current (Local) |
|--------|--------|----------------|
| Throughput | 100-500 req/s | **~4,800 req/s** ✅ |
| Latency (p50) | <20ms | **1ms** ✅ |
| Latency (p99) | <100ms | **~4ms** ✅ |

### Interpreting Results

#### Throughput
- **Good**: 100-500 req/s
- **Excellent**: >500 req/s

#### Latency
- **Good**: p99 <100ms
- **Excellent**: p99 <50ms
- **Outstanding**: p99 <20ms

#### Error Rate
- **Target**: <0.1% errors
- **Acceptable**: <1% errors
- **Critical**: >5% errors (investigate immediately)

---

## Dashboards

### Grafana Setup

1. **Add Prometheus Data Source**:
   - URL: `http://prometheus:9090`
   - Scrape interval: 15s

2. **Import Dashboard**: Use provided JSON or create custom

### Recommended Panels

#### 1. Request Overview
- **Request Rate**: `rate(logos_verifications_total[5m])`
- **Error Rate**: `rate(logos_http_request_duration_seconds_count{status_code=~"5.."}[5m])`
- **Active Requests**: `logos_http_requests_active`

#### 2. Latency
- **p50**: `histogram_quantile(0.5, rate(logos_http_request_duration_seconds_bucket[5m]))`
- **p95**: `histogram_quantile(0.95, rate(logos_http_request_duration_seconds_bucket[5m]))`
- **p99**: `histogram_quantile(0.99, rate(logos_http_request_duration_seconds_bucket[5m]))`

#### 3. Decision Distribution
```promql
sum by (decision) (rate(logos_verifications_total[5m]))
```

#### 4. Gap Analysis
```promql
# Average gap by dimension
avg by (dimension) (
  rate(logos_gap_distance_sum[5m])
  / rate(logos_gap_distance_count[5m])
)
```

#### 5. System Resources
- **CPU**: `rate(logos_process_cpu_seconds_total[5m])`
- **Memory**: `logos_process_resident_memory_bytes`
- **Heap**: `logos_process_heap_bytes`

#### 6. Resurrection Success Rate
```promql
rate(logos_resurrection_attempts_total{success="true"}[5m])
  / rate(logos_resurrection_attempts_total[5m])
```

---

## Alerts

### Prometheus Alerting Rules

Add to `alerts.yml`:

```yaml
groups:
  - name: logos_service
    interval: 30s
    rules:
      # High Error Rate
      - alert: HighErrorRate
        expr: |
          rate(logos_http_request_duration_seconds_count{status_code=~"5.."}[5m])
          / rate(logos_http_request_duration_seconds_count[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate (>5%)"
          description: "Error rate is {{ $value | humanizePercentage }}"

      # High Latency
      - alert: HighLatency
        expr: |
          histogram_quantile(0.99,
            rate(logos_http_request_duration_seconds_bucket[5m])
          ) > 0.5
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High p99 latency (>500ms)"
          description: "p99 latency is {{ $value }}s"

      # Service Down
      - alert: ServiceDown
        expr: up{job="logos-service"} == 0
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "LOGOS Service is down"
          description: "Service has been down for 2+ minutes"

      # High Gap Distance
      - alert: HighGapDistance
        expr: |
          avg(rate(logos_gap_distance_sum[5m])
            / rate(logos_gap_distance_count[5m])) > 0.5
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "High average gap distance (>0.5)"
          description: "Average gap is {{ $value }}"

      # Low Confidence
      - alert: LowConfidence
        expr: |
          avg(rate(logos_decision_confidence_sum[5m])
            / rate(logos_decision_confidence_count[5m])) < 0.6
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Low average confidence (<0.6)"
          description: "Average confidence is {{ $value }}"

      # Memory Usage
      - alert: HighMemoryUsage
        expr: logos_process_resident_memory_bytes > 1e9
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage (>1GB)"
          description: "Memory usage is {{ $value | humanize1024 }}B"
```

### Notification Channels

Configure in Alertmanager:

```yaml
receivers:
  - name: 'team-alerts'
    slack_configs:
      - channel: '#logos-alerts'
        api_url: 'https://hooks.slack.com/...'

  - name: 'pagerduty'
    pagerduty_configs:
      - service_key: 'your-key'
        severity: '{{ .GroupLabels.severity }}'
```

---

## Production Checklist

### Before Deployment

- [ ] Configure Sentry DSN
- [ ] Set up Prometheus scraping
- [ ] Create Grafana dashboards
- [ ] Configure alerting rules
- [ ] Set up notification channels
- [ ] Run load tests against staging
- [ ] Set appropriate resource limits

### Monitoring Checklist

- [ ] Metrics endpoint accessible
- [ ] Prometheus scraping successfully
- [ ] Sentry receiving events
- [ ] Dashboards displaying data
- [ ] Alerts firing correctly
- [ ] Notification channels working

### Regular Reviews

**Daily**:
- Check error rate
- Review latency trends
- Monitor resource usage

**Weekly**:
- Review Sentry error patterns
- Analyze gap distributions
- Check resurrection success rates
- Update alert thresholds

**Monthly**:
- Performance benchmarking
- Capacity planning
- Dashboard refinement
- Alert tuning

---

## Troubleshooting

### High Latency

1. Check metrics: `/metrics`
2. Look for gaps in specific dimensions
3. Review recent code changes
4. Check database/Redis latency
5. Increase resources if needed

### High Error Rate

1. Check Sentry for stack traces
2. Review logs: `kubectl logs -f deployment/logos-service`
3. Check upstream dependencies
4. Verify configuration
5. Rollback if necessary

### Memory Leaks

1. Monitor heap usage over time
2. Check for unbounded arrays/caches
3. Review Sentry for repeated errors
4. Enable heap snapshots
5. Restart service if critical

### Missing Metrics

1. Verify endpoint: `curl http://localhost:8787/metrics`
2. Check Prometheus configuration
3. Verify network connectivity
4. Review firewall rules
5. Check service logs

---

## Additional Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Sentry Node.js SDK](https://docs.sentry.io/platforms/node/)
- [Autocannon Documentation](https://github.com/mcollina/autocannon)
- [LOGOS Service README](./README.md)
