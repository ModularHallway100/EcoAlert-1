# EcoAlert Monitoring & Observability Guide

## Table of Contents

- [Overview](#overview)
- [Monitoring Architecture](#monitoring-architecture)
- [Prometheus Configuration](#prometheus-configuration)
- [Grafana Dashboards](#grafana-dashboards)
- [Logging Configuration](#logging-configuration)
- [Alerting Rules](#alerting-rules)
- [Distributed Tracing](#distributed-tracing)
- [Application Metrics](#application-metrics)
- [Infrastructure Monitoring](#infrastructure-monitoring)
- [Cost Monitoring](#cost-monitoring)
- [Troubleshooting](#troubleshooting)

## Overview

This guide provides comprehensive instructions for setting up monitoring, logging, and observability for the EcoAlert platform. A robust monitoring system is crucial for maintaining system reliability, performance, and user experience.

## Monitoring Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Applications  │    │   Databases     │    │   Infrastructure│
│   (Next.js)     │    │   (PostgreSQL)  │    │   (AWS/GCP)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Data Collectors │
                    │   (Node Exporter, │
                    │  Prometheus,     │
                    │  Fluentd)        │
                    └─────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Prometheus    │    │    Grafana      │    │   Alertmanager  │
│   (Time Series) │    │   (Visualization)│    │   (Notifications)│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Data Flow

1. **Metrics Collection**: Applications and infrastructure expose metrics via Prometheus endpoints
2. **Log Collection**: Application logs are collected and centralized by Fluentd/Loki
3. **Data Processing**: Prometheus scrapes metrics, processes them, and stores them
4. **Visualization**: Grafana queries Prometheus and Loki for visualization
5. **Alerting**: Alertmanager processes alerts and sends notifications via various channels

## Prometheus Configuration

### prometheus.yml

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

# Alertmanager configuration
alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

# Rule files
rule_files:
  - "alert_rules.yml"

# Scrape configuration
scrape_configs:
  # EcoAlert Application
  - job_name: 'ecoalert'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/metrics'
    scrape_interval: 15s
    scrape_timeout: 10s

  # Node Exporter (System metrics)
  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']
    scrape_interval: 30s

  # PostgreSQL Exporter
  - job_name: 'postgres-exporter'
    static_configs:
      - targets: ['postgres-exporter:9187']
    scrape_interval: 30s
    metrics_path: /metrics
    params:
      source: [postgres://postgres:${DB_PASSWORD}@${DB_HOST}:5432/ecoalert_prod?sslmode=require]

  # Redis Exporter
  - job_name: 'redis-exporter'
    static_configs:
      - targets: ['redis-exporter:9121']
    scrape_interval: 30s

  # NGINX Exporter
  - job_name: 'nginx-exporter'
    static_configs:
      - targets: ['nginx-exporter:9113']
    scrape_interval: 30s

  # Docker Exporter
  - job_name: 'docker'
    static_configs:
      - targets: ['cadvisor:8080']
    scrape_interval: 30s
```

### Alert Rules

```yaml
# alert_rules.yml
groups:
  - name: ecoalert_alerts
    rules:
      # High error rate
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate on {{ $labels.instance }}"
          description: "Error rate is {{ $value }} requests per second"

      # High request latency
      - alert: HighRequestLatency
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High request latency on {{ $labels.instance }}"
          description: "95th percentile latency is {{ $value }} seconds"

      # Database connection issues
      - alert: DatabaseConnectionsHigh
        expr: pg_stat_database_numbackends / pg_settings_max_connections > 0.8
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High database connection usage"
          description: "Database connections are at {{ $value }}% capacity"

      # Redis memory usage
      - alert: RedisMemoryHigh
        expr: redis_memory_used_bytes / redis_memory_max_bytes > 0.8
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High Redis memory usage"
          description: "Redis memory usage is at {{ $value }}%"

      # Low disk space
      - alert: DiskSpaceLow
        expr: (1 - (node_filesystem_avail_bytes / node_filesystem_size_bytes)) * 100 > 85
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Low disk space on {{ $labels.device }}"
          description: "Disk usage is at {{ $value }}%"

      # High CPU usage
      - alert: CPUUsageHigh
        expr: 100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High CPU usage on {{ $labels.instance }}"
          description: "CPU usage is at {{ $value }}%"

      # High memory usage
      - alert: MemoryUsageHigh
        expr: (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100 > 85
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage on {{ $labels.instance }}"
          description: "Memory usage is at {{ $value }}%"
```

### Service Monitor

```yaml
# service-monitor.yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: ecoalert-monitor
  namespace: monitoring
  labels:
    app: ecoalert
spec:
  selector:
    matchLabels:
      app: ecoalert
  endpoints:
  - port: metrics
    interval: 15s
    path: /metrics
    metricRelabelings:
    - sourceLabels: [__name__]
      regex: 'http_.*'
      targetLabel: __metrics_path__
      replacement: metrics
```

## Grafana Dashboards

### Application Dashboard

```json
{
  "dashboard": {
    "id": null,
    "title": "EcoAlert Application",
    "tags": ["ecoalert", "application"],
    "timezone": "browser",
    "panels": [
      {
        "id": 1,
        "title": "HTTP Requests",
        "type": "graph",
        "targets": [
          {
            "expr": "sum(rate(http_requests_total[5m]))",
            "legendFormat": "Total"
          },
          {
            "expr": "sum(rate(http_requests_total{status=~\"2..\"}[5m]))",
            "legendFormat": "2xx"
          },
          {
            "expr": "sum(rate(http_requests_total{status=~\"3..\"}[5m]))",
            "legendFormat": "3xx"
          },
          {
            "expr": "sum(rate(http_requests_total{status=~\"4..\"}[5m]))",
            "legendFormat": "4xx"
          },
          {
            "expr": "sum(rate(http_requests_total{status=~\"5..\"}[5m]))",
            "legendFormat": "5xx"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "unit": "reqps",
            "mappings": [],
            "thresholds": {
              "steps": [
                { "color": "green", "value": 0 },
                { "color": "red", "value": 100 }
              ]
            },
            "color": {
              "mode": "thresholds"
            }
          },
          "overrides": []
        }
      },
      {
        "id": 2,
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.50, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "P50"
          },
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "P95"
          },
          {
            "expr": "histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "P99"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "unit": "s",
            "mappings": [],
            "thresholds": {
              "steps": [
                { "color": "green", "value": 0 },
                { "color": "red", "value": 1 }
              ]
            },
            "color": {
              "mode": "thresholds"
            }
          },
          "overrides": []
        }
      }
    ],
    "time": {
      "from": "now-1h",
      "to": "now"
    },
    "refresh": "30s"
  }
}
```

### Infrastructure Dashboard

```json
{
  "dashboard": {
    "id": null,
    "title": "EcoAlert Infrastructure",
    "tags": ["ecoalert", "infrastructure"],
    "panels": [
      {
        "id": 1,
        "title": "CPU Usage",
        "type": "graph",
        "targets": [
          {
            "expr": "100 - (avg by(instance) (irate(node_cpu_seconds_total{mode=\"idle\"}[5m])) * 100)",
            "legendFormat": "{{ instance }}"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "unit": "percent",
            "mappings": [],
            "thresholds": {
              "steps": [
                { "color": "green", "value": 0 },
                { "color": "yellow", "value": 70 },
                { "color": "red", "value": 90 }
              ]
            }
          }
        }
      },
      {
        "id": 2,
        "title": "Memory Usage",
        "type": "graph",
        "targets": [
          {
            "expr": "(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100",
            "legendFormat": "{{ instance }}"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "unit": "percent",
            "mappings": [],
            "thresholds": {
              "steps": [
                { "color": "green", "value": 0 },
                { "color": "yellow", "value": 70 },
                { "color": "red", "value": 85 }
              ]
            }
          }
        }
      },
      {
        "id": 3,
        "title": "Disk Usage",
        "type": "graph",
        "targets": [
          {
            "expr": "(1 - (node_filesystem_avail_bytes / node_filesystem_size_bytes)) * 100",
            "legendFormat": "{{ device }} on {{ instance }}"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "unit": "percent",
            "mappings": [],
            "thresholds": {
              "steps": [
                { "color": "green", "value": 0 },
                { "color": "yellow", "value": 70 },
                { "color": "red", "value": 85 }
              ]
            }
          }
        }
      }
    ]
  }
}
```

### Database Dashboard

```json
{
  "dashboard": {
    "id": null,
    "title": "EcoAlert Database",
    "tags": ["ecoalert", "database"],
    "panels": [
      {
        "id": 1,
        "title": "Database Connections",
        "type": "graph",
        "targets": [
          {
            "expr": "pg_stat_database_numbackends",
            "legendFormat": "Active Connections"
          },
          {
            "expr": "pg_settings_max_connections",
            "legendFormat": "Max Connections"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "unit": "short",
            "mappings": [],
            "thresholds": {
              "steps": [
                { "color": "green", "value": 0 },
                { "color": "red", "value": 100 }
              ]
            }
          }
        }
      },
      {
        "id": 2,
        "title": "Query Performance",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(pg_stat_database_calls_total[5m])",
            "legendFormat": "Queries per second"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "unit": "qps",
            "mappings": [],
            "thresholds": {
              "steps": [
                { "color": "green", "value": 0 },
                { "color": "red", "value": 100 }
              ]
            }
          }
        }
      }
    ]
  }
}
```

## Logging Configuration

### Fluentd Configuration

```conf
# fluentd.conf
<source>
  @type forward
  port 24224
  bind 0.0.0.0
</source>

<source>
  @type tail
  path /var/log/ecoalert/*.log
  pos_file /var/log/fluentd/ecoalert.log.pos
  tag ecoalert.app
  format json
  time_format %Y-%m-%d %H:%M:%S.%N
</source>

<source>
  @type tail
  path /var/log/nginx/access.log
  pos_file /var/log/fluentd/nginx.access.log.pos
  tag nginx.access
  format /^(?<host>[^ ]*) - (?<user>[^ ]*) \[(?<time>[^\]]*)\] \"(?<method>\S+)(?: +(?<path>[^ ]*?)(?: +\[?\d+[^\]]*\]?)?)? (?<code>[^ ]*) (?<size>[^ ]*)\" \"(?<referer>[^\"]*)\" \"(?<agent>[^\"]*)\"$/
  time_format %d/%b/%Y:%H:%M:%S %z
</source>

<source>
  @type tail
  path /var/log/nginx/error.log
  pos_file /var/log/fluentd/nginx.error.log.pos
  tag nginx.error
  format none
  <parse>
    /(?<time>\d{4}/\d{2}/\d{2} \d{2}:\d{2}:\d{2}) \[(?<level>\w+)\] (?<pid>\d+)#(?<tid>\d+): (?<message>.*)/
  </parse>
</source>

<match ecoalert.**>
  @type elasticsearch
  host elasticsearch
  port 9200
  index_name ecoalert
  type_name _doc
  include_tag true
  tag_key @log_name
  <buffer>
    flush_mode interval
    flush_interval 5s
    chunk_limit 2m
    queue_limit 32
    retry_forever true
  </buffer>
</match>

<match nginx.**>
  @type elasticsearch
  host elasticsearch
  port 9200
  index_name nginx
  type_name _doc
  include_tag true
  tag_key @log_name
  <buffer>
    flush_mode interval
    flush_interval 5s
    chunk_limit 2m
    queue_limit 32
    retry_forever true
  </buffer>
</match>

<match **>
  @type stdout
</match>
```

### Logstash Configuration

```ruby
# logstash.conf
input {
  beats {
    port => 5044
  }
}

filter {
  if [log][file][path] =~ /ecoalert/ {
    grok {
      match => { "message" => "%{TIMESTAMP_ISO8601:timestamp} %{WORD:level} %{GREEDYDATA:message}" }
    }
  } else if [log][file][path] =~ /nginx/ {
    grok {
      match => { "message" => "%{COMBINEDAPACHELOG}" }
    }
  }

  date {
    match => [ "timestamp", "ISO8601" ]
    target => "@timestamp"
  }

  if [level] == "ERROR" {
    mutate {
      add_tag => ["error"]
    }
  }

  if [level] == "WARN" {
    mutate {
      add_tag => ["warning"]
    }
  }

  if [message] =~ /(exception|error|failed)/i {
    mutate {
      add_tag => ["exception"]
    }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "ecoalert-%{+YYYY.MM.dd}"
    document_type => "_doc"
  }

  if "error" in [tags] {
    email {
      to => ["admin@ecoalert.com"]
      subject => "EcoAlert Error Alert"
      via => "smtp"
      options => {
        address => "smtp.gmail.com"
        port => 587
        domain => "gmail.com"
        user => "your-email@gmail.com"
        password => "your-password"
        authentication => "plain"
        starttls => true
        ssl => false
        tls => true
        cacert => "/etc/ssl/certs/ca-certificates.crt"
    }
  }
}
```

### Loki Configuration

```yaml
#loki-config.yaml
auth_enabled: false

server:
  http_listen_port: 3100
  grpc_listen_port: 9096

common:
  path_prefix: /loki
  storage:
    filesystem:
      chunks_directory: /loki/chunks
      rules_directory: /loki/rules
  replication_factor: 1
  ring:
    instance_addr: 127.0.0.1
    kvstore:
      store: inmemory

query_range:
  results_cache:
    cache:
      embedded_cache:
        enabled: true
        max_size_mb: 100

schema_config:
  configs:
    - from: 2020-10-24
      store: boltdb-shipper
      object_store: filesystem
      schema: v11
      index:
        prefix: index_
        period: 24h

ruler:
  alertmanager_url: http://localhost:9093

# By default, Loki will send anonymous usage information to Grafana Labs
# to help us understand how it is being used. To disable this, set analytics.reporting_enabled to false
analytics:
  reporting_enabled: false
```

## Alerting Rules

### Slack Notifications

```yaml
# alertmanager-config.yml
global:
  smtp_smarthost: 'localhost:587'
  smtp_from: 'alerts@ecoalert.com'
  smtp_auth_username: 'alerts@ecoalert.com'
  smtp_auth_password: 'password'

route:
  group_by: ['alertname']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'web.hook'

receivers:
- name: 'web.hook'
  email_configs:
  - to: 'admin@ecoalert.com'
    subject: 'EcoAlert Alert: {{ .GroupLabels.alertname }}'
    body: |
      {{ range .Alerts }}
      Alert: {{ .Annotations.summary }}
      Description: {{ .Annotations.description }}
      Labels: {{ .Labels }}
      {{ end }}
  
  slack_configs:
  - api_url: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK'
    title: 'EcoAlert Alert'
    text: ' {{ range .Alerts }}{{ .Annotations.summary }}{{ end }}'
    color: 'danger'

  webhook_configs:
  - url: 'http://ecoalert-webhook:8080/'
    send_resolved: true
```

### PagerDuty Integration

```yaml
# pagerduty-receiver.yaml
receivers:
- name: 'pagerduty'
  pagerduty_configs:
  - service_key: 'YOUR_PAGERDUTY_SERVICE_KEY'
    severity: 'critical'
    component: 'ecoalert'
    group: 'monitoring'
    source: 'prometheus'
    class: 'system'
    summary: |
      {{ .GroupLabels.alertname }} on {{ .GroupLabels.instance }}
    description: |
      {{ range .Alerts }}
      {{ .Annotations.summary }}
      {{ end }}
    details:
      summary: |
        {{ .GroupLabels.alertname }} on {{ .GroupLabels.instance }}
      description: |
        {{ range .Alerts }}
        {{ .Annotations.description }}
        {{ end }}
      runbook_url: 'https://runbooks.ecoalert.com/{{ .GroupLabels.alertname }}'
```

## Distributed Tracing

### Jaeger Configuration

```yaml
# docker-compose.jaeger.yml
version: '3.8'

services:
  jaeger:
    image: jaegertracing/all-in-one:latest
    environment:
      - COLLECTOR_ZIPKIN_HTTP_PORT=9411
    ports:
      - "5775:5775/udp"
      - "6831:6831/udp"
      - "6832:6832/udp"
      - "5778:5778"
      - "16686:16686"
      - "14268:14268"
      - "9411:9411"
    networks:
      - ecoalert-network

  ecoalert:
    build: .
    environment:
      - JAEGER_AGENT_HOST=jaeger
      - JAEGER_AGENT_PORT=6831
      - JAEGER_SAMPLER_TYPE=const
      - JAEGER_SAMPLER_PARAM=1
    depends_on:
      - jaeger
    networks:
      - ecoalert-network

networks:
  ecoalert-network:
    driver: bridge
```

### OpenTelemetry Configuration

```javascript
// src/lib/telemetry.js
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
const { SimpleSpanProcessor } = require('@opentelemetry/sdk-trace-base');

// Configure tracer provider
const provider = new NodeTracerProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'ecoalert',
    [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
  }),
});

// Configure exporter
const exporter = new JaegerExporter({
  endpoint: 'http://jaeger:14268/api/traces',
});

// Register span processors
provider.addSpanProcessor(new SimpleSpanProcessor(exporter));

// Register provider
provider.register();

module.exports = { provider };
```

## Application Metrics

### Custom Metrics

```typescript
// src/lib/metrics.ts
import { Counter, Histogram, Gauge } from 'prom-client';

// HTTP request metrics
export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code', 'user_agent'],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
});

export const httpRequestTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

export const activeConnections = new Gauge({
  name: 'active_connections',
  help: 'Number of active connections',
  labelNames: ['service'],
});

// Database metrics
export const dbQueryDuration = new Histogram({
  name: 'db_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['operation', 'table'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
});

export const dbQueryTotal = new Counter({
  name: 'db_queries_total',
  help: 'Total number of database queries',
  labelNames: ['operation', 'table', 'status'],
});

// Business metrics
export const sensorReadingsProcessed = new Counter({
  name: 'sensor_readings_processed_total',
  help: 'Total number of sensor readings processed',
  labelNames: ['sensor_type', 'location'],
});

export const alertsTriggered = new Counter({
  name: 'alerts_triggered_total',
  help: 'Total number of alerts triggered',
  labelNames: ['alert_type', 'severity'],
});

export const userActivity = new Counter({
  name: 'user_activity_total',
  help: 'Total number of user activities',
  labelNames: ['activity_type', 'user_id'],
});
```

### Metrics Middleware

```typescript
// src/middleware/metrics.ts
import { NextRequest, NextResponse } from 'next/server';
import { httpRequestDuration, httpRequestTotal } from '../lib/metrics';

export function withMetrics(request: NextRequest, response: NextResponse) {
  const start = process.hrtime();
  const method = request.method;
  const route = request.nextUrl.pathname;
  const userAgent = request.headers.get('user-agent') || '';

  // Record request
  httpRequestTotal.inc({ method, route, status_code: response.status });

  // Hook into response to record duration
  const originalEnd = response.end;
  response.end = async function(chunk?: any) {
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = seconds + nanoseconds / 1e9;
    
    httpRequestDuration.observe(
      { method, route, status_code: response.status, user_agent: userAgent },
      duration
    );

    return originalEnd.call(this, chunk);
  } as any;

  return response;
}
```

## Infrastructure Monitoring

### Kubernetes Monitoring

```yaml
# k8s-monitoring.yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: kubelet-monitor
  namespace: monitoring
spec:
  selector:
    matchLabels:
      component: kubelet
  endpoints:
  - port: https-metrics
    scheme: https
    tlsConfig:
      caFile: /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
    bearerTokenFile: /var/run/secrets/kubernetes.io/serviceaccount/token
    interval: 30s

---
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: cAdvisor-monitor
  namespace: monitoring
spec:
  selector:
    matchLabels:
      k8s-app: cAdvisor
  endpoints:
  - port: http-metrics
    interval: 30s
```

### AWS CloudWatch Integration

```json
{
  "metrics": [
    {
      "namespace": "EcoAlert/Infrastructure",
      "metricName": "CPUUtilization",
      "dimensions": [
        {
          "name": "Environment",
          "value": "production"
        }
      ],
      "stat": "Average",
      "period": 300,
      "unit": "Percent"
    },
    {
      "namespace": "EcoAlert/Infrastructure",
      "metricName": "MemoryUtilization",
      "dimensions": [
        {
          "name": "Environment",
          "value": "production"
        }
      ],
      "stat": "Average",
      "period": 300,
      "unit": "Percent"
    }
  ],
  "alarms": [
    {
      "alarmName": "HighCPUUtilization",
      "alarmDescription": "CPU utilization is high",
      "metricName": "CPUUtilization",
      "namespace": "EcoAlert/Infrastructure",
      "statistic": "Average",
      "period": 300,
      "evaluationPeriods": 3,
      "threshold": 80,
      "comparisonOperator": "GreaterThanThreshold",
      "dimensions": [
        {
          "name": "Environment",
          "value": "production"
        }
      ],
      "alarmActions": [
        "arn:aws:sns:us-east-1:123456789012:EcoAlert-Alerts"
      ]
    }
  ]
}
```

## Cost Monitoring

### AWS Cost Explorer

```python
# cost_monitoring.py
import boto3
from datetime import datetime, timedelta

def get_cost_forecast():
    client = boto3.client('ce')
    
    # Get cost forecast for next month
    response = client.get_cost_forecast(
        TimePeriod={
            'Start': datetime.now().strftime('%Y-%m-%d'),
            'End': (datetime.now() + timedelta(days=30)).strftime('%Y-%m-%d')
        },
        Metric='BLENDED_COST',
        Granularity='MONTHLY'
    )
    
    forecast = response['Forecast']['ResultsByTime'][0]['Total']['Amount']
    print(f"Estimated cost for next month: ${forecast}")
    
    return forecast

def get_cost_by_service():
    client = boto3.client('ce')
    
    # Get costs by service for current month
    response = client.get_cost_and_usage(
        TimePeriod={
            'Start': datetime.now().replace(day=1).strftime('%Y-%m-%d'),
            'End': datetime.now().strftime('%Y-%m-%d')
        },
        Granularity='MONTHLY',
        Metrics=['BlendedCost'],
        GroupBy=[
            {
                'Type': 'DIMENSION',
                'Key': 'SERVICE'
            }
        ]
    )
    
    costs_by_service = {}
    for result in response['ResultsByTime'][0]['Groups']:
        service = result['Keys'][0]
        cost = float(result['Metrics']['BlendedCost']['Amount'])
        costs_by_service[service] = cost
    
    print("Costs by service:")
    for service, cost in sorted(costs_by_service.items(), key=lambda x: x[1], reverse=True):
        print(f"{service}: ${cost:.2f}")
    
    return costs_by_service

def set_cost_alerts():
    client = boto3.client('cloudwatch')
    
    # Set alarm for high costs
    client.put_metric_alarm(
        AlarmName='HighMonthlyCost',
        AlarmDescription='Monthly cost exceeds threshold',
        MetricName='EstimatedCharges',
        Namespace='AWS/Billing',
        Statistic='Maximum',
        Period = 2592000,
        EvaluationPeriods=1,
        Threshold=1000,
        ComparisonOperator='GreaterThanThreshold',
        AlarmActions=['arn:aws:sns:us-east-1:123456789012:EcoAlert-Alerts']
    )
```

## Troubleshooting

### Common Issues

#### 1. Metrics Not Showing Up

**Problem**: Metrics are not appearing in Grafana dashboards.

**Solutions**:
```bash
# Check if Prometheus is scraping metrics
curl http://localhost:9090/api/v1/targets

# Check application metrics endpoint
curl http://localhost:3000/metrics

# Check Prometheus logs
docker logs prometheus

# Verify ServiceMonitor configuration
kubectl get servicemonitor
kubectl describe servicemonitor <name>
```

#### 2. Alerting Not Working

**Problem**: Alerts are not firing or notifications are not being sent.

**Solutions**:
```bash
# Check Alertmanager logs
docker logs alertmanager

# Test alert rules
curl -X POST -d '{
  "alerts": [{
    "labels": {"alertname": "TestAlert"},
    "annotations": {"description": "Test alert"}
  }]
}' http://localhost:9093/api/v1/receivers

# Check receiver configuration
curl http://localhost:9093/api/v1/receivers

# Test webhook
curl -X POST -d '{"test": true}' http://your-webhook-url
```

#### 3. Logging Issues

**Problem**: Logs are not being collected or indexed properly.

**Solutions**:
```bash
# Check Fluentd/Logstash logs
docker logs fluentd
docker logs logstash

# Check Elasticsearch logs
docker logs elasticsearch

# Verify log format
tail -f /var/log/ecoalert/app.log

# Test log forwarding
echo '{"test": true}' | nc localhost 24224
```

#### 4. Performance Issues

**Problem**: Monitoring is causing performance degradation.

**Solutions**:
```bash
# Check resource usage
kubectl top pods

# Adjust scraping intervals
kubectl edit configmap prometheus-server

# Optimize queries
# Use rate() instead of instant queries
# Use sum() instead of individual metrics
# Avoid high-cardinality labels

# Enable query caching
# Configure query result caching
```

### Performance Tuning

#### Prometheus Configuration

```yaml
# prometheus.yml
global:
  scrape_interval: 30s  # Increase from 15s
  evaluation_interval: 30s  # Increase from 15s

scrape_configs:
  - job_name: 'ecoalert'
    scrape_interval: 30s  # Less frequent scraping
    scrape_timeout: 10s
    sample_limit: 50000  # Increase sample limit

# Enable query caching
query:
  timeout: 2m
  max_samples: 50000000
  max_concurrent_queries: 20

# Enable storage compression
storage:
  tsdb:
    retention.time: 15d
    retention.size: 10GB
    max_block_duration: 2h
    min_block_duration: 2h
    compact: true
    compact_concurrency: 1
    max_compaction_level: 16
```

#### Grafana Performance

```json
{
  "dashboard": {
    "panels": [
      {
        "id": 1,
        "maxDataPoints": 1000,
        "interval": "30s",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "intervalFactor": 2
          }
        ]
      }
    ]
  }
}
```

### Debug Tools

#### Prometheus Query Examples

```bash
# Check request rates by endpoint
sum(rate(http_requests_total[5m])) by (route)

# Find slow endpoints
topk(10, histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])))

# Check error rates
sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m]))

# Find high-traffic services
topk(10, sum(rate(http_requests_total[5m])) by (service))

# Check alert firing status
ALERTS{alertname="HighErrorRate"}

# Check alert history
ALERTS_FOR_STATE{alertname="HighErrorRate"}
```

#### Grafana Debugging

```javascript
// Enable debug mode in Grafana
// Add to grafana.ini
[log]
filters = alerting:debug,query:debug
```

#### Log Analysis Commands

```bash
# Find error logs
grep "ERROR" /var/log/ecoalert/app.log | tail -20

# Check specific error patterns
grep -i "exception\|error\|failed" /var/log/ecoalert/app.log

# Analyze response times
grep "response_time" /var/log/ecoalert/app.log | awk '{sum+=$3; count++} END {print "Average:", sum/count}'

# Monitor real-time logs
tail -f /var/log/ecoalert/app.log | grep "ERROR"
```

### Maintenance Procedures

#### Regular Maintenance Tasks

1. **Rotate Prometheus Storage**
```bash
# Rotate TSDB blocks
curl -X POST http://localhost:9090/-/reload

# Force compaction
curl -X POST http://localhost:9090/api/v1/admin/tsdb/clean_tombstones
```

2. **Update Grafana Dashboards**
```bash
# Export dashboard to JSON
curl -u admin:admin http://localhost:3000/api/dashboards/1 | jq '.dashboard' > dashboard.json

# Import dashboard
curl -u admin:admin -X POST -H "Content-Type: application/json" -d @dashboard.json http://localhost:3000/api/dashboards/db
```

3. **Clean Up Old Logs**
```bash
# Delete old indices in Elasticsearch
curl -X DELETE 'http://localhost:9200/ecoalert-2023.01'

# Rotate log files
logrotate -f /etc/logrotate.d/ecoalert
```

4. **Update Monitoring Rules**
```bash
# Update Prometheus alert rules
kubectl apply -f alert_rules.yml

# Update Alertmanager configuration
kubectl apply -f alertmanager-config.yml
```

This comprehensive monitoring guide provides everything needed to set up, configure, and maintain a robust observability system for the EcoAlert platform.