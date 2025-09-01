
# EcoAlert Deployment Guide

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Deployment Options](#deployment-options)
  - [Docker Deployment](#docker-deployment)
  - [Kubernetes Deployment](#kubernetes-deployment)
  - [Cloud Platform Deployment](#cloud-platform-deployment)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [SSL/TLS Configuration](#ssltls-configuration)
- [Monitoring & Logging](#monitoring--logging)
- [Scaling & Performance](#scaling--performance)
- [Backup & Recovery](#backup--recovery)
- [Maintenance](#maintenance)
- [Troubleshooting](#troubleshooting)

## Overview

This guide provides comprehensive instructions for deploying EcoAlert to various environments. The deployment process has been designed to be consistent across different platforms while optimizing for each specific environment's characteristics.

## Prerequisites

### System Requirements

**Minimum Requirements:**
- 4 vCPUs
- 8GB RAM
- 100GB SSD storage
- Ubuntu 20.04+ or CentOS 8+

**Recommended Requirements:**
- 8 vCPUs
- 16GB RAM
- 200GB SSD storage
- Load balancer
- Multiple availability zones

### Software Requirements

- Node.js 18+ (LTS version)
- PostgreSQL 14+
- Redis 6+
- Docker 20.10+
- Docker Compose 2.0+
- NGINX 1.18+
- Certbot for SSL certificates

### Network Requirements

- HTTP/HTTPS access (ports 80, 443)
- Database access (port 5432)
- Redis access (port 6379)
- Monitoring ports (if applicable)

## Deployment Options

### Docker Deployment

#### 1. Docker Compose Setup

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/ecoalert_prod
      - REDIS_URL=redis://redis:6379
      - NEXTAUTH_URL=https://api.ecoalert.com
    depends_on:
      - db
      - redis
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs
    restart: unless-stopped

  db:
    image: timescale/timescaledb:latest-pg14
    environment:
      POSTGRES_DB: ecoalert_prod
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    restart: unless-stopped

  redis:
    image: redis:6-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
    restart: unless-stopped

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      GF_SECURITY_ADMIN_PASSWORD: admin
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana/provisioning:/etc/grafana/provisioning
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  prometheus_data:
  grafana_data:
```

#### 2. Dockerfile Configuration

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

#### 3. Deployment Script

```bash
#!/bin/bash
# deploy.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="ecoalert"
DEPLOY_ENV="production"
BACKUP_DIR="/backups/$PROJECT_NAME"

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    error "Please do not run as root"
fi

# Stop services
log "Stopping existing services..."
docker-compose down

# Backup database
log "Creating database backup..."
mkdir -p $BACKUP_DIR
docker exec -t ecoalert_db pg_dump -U postgres ecoalert_prod > $BACKUP_DIR/db_backup_$(date +%Y%m%d_%H%M%S).sql
gzip $BACKUP_DIR/db_backup_$(date +%Y%m%d_%H%M%S).sql

# Pull latest images
log "Pulling latest Docker images..."
docker-compose pull

# Build and start services
log "Building and starting services..."
docker-compose up -d --build

# Wait for services to be ready
log "Waiting for services to be ready..."
sleep 30

# Run database migrations
log "Running database migrations..."
docker-compose exec -T app npx prisma migrate deploy

# Seed database if needed
log "Seeding database..."
docker-compose exec -T app npx prisma db seed

# Verify deployment
log "Verifying deployment..."
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    log "Deployment successful!"
else
    error "Health check failed"
fi

# Clean up old backups
log "Cleaning up old backups..."
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

log "Deployment completed successfully!"
```

### Kubernetes Deployment

#### 1. Kubernetes Manifests

```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: ecoalert
  labels:
    app: ecoalert
    environment: production
```

```yaml
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: ecoalert-config
  namespace: ecoalert
data:
  NODE_ENV: "production"
  NEXTAUTH_URL: "https://api.ecoalert.com"
  DATABASE_HOST: "postgres-service"
  REDIS_HOST: "redis-service"
  # Add other environment variables as needed
```

```yaml
# k8s/secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: ecoalert-secrets
  namespace: ecoalert
type: Opaque
data:
  # Base64 encoded secrets
  database-password: <base64-encoded-password>
  redis-password: <base64-encoded-password>
  nextauth-secret: <base64-encoded-secret>
  api-keys: <base64-encoded-api-keys>
```

```yaml
# k8s/postgres-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
  namespace: ecoalert
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: timescale/timescaledb:latest-pg14
        env:
        - name: POSTGRES_DB
          value: ecoalert_prod
        - name: POSTGRES_USER
          value: postgres
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: ecoalert-secrets
              key: database-password
        ports:
        - containerPort: 5432
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
        resources:
          requests:
            memory: "2Gi"
            cpu: "1000m"
          limits:
            memory: "4Gi"
            cpu: "2000m"
      volumes:
      - name: postgres-storage
        persistentVolumeClaim:
          claimName: postgres-pvc
```

```yaml
# k8s/postgres-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: postgres-service
  namespace: ecoalert
spec:
  selector:
    app: postgres
  ports:
  - port: 5432
    targetPort: 5432
```

```yaml
# k8s/redis-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis
  namespace: ecoalert
spec:
  replicas: 1
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
      - name: redis
        image: redis:6-alpine
        ports:
        - containerPort: 6379
        env:
        - name: REDIS_PASSWORD
          valueFrom:
            secretKeyRef:
              name: ecoalert-secrets
              key: redis-password
        command:
        - redis-server
        - --requirepass
        - $(REDIS_PASSWORD)
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
```

```yaml
# k8s/redis-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: redis-service
  namespace: ecoalert
spec:
  selector:
    app: redis
  ports:
  - port: 6379
    targetPort: 6379
```

```yaml
# k8s/app-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ecoalert-app
  namespace: ecoalert
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ecoalert-app
  template:
    metadata:
      labels:
        app: ecoalert-app
    spec:
      containers:
      - name: ecoalert-app
        image: your-registry/ecoalert:latest
        ports:
        - containerPort: 3000
        envFrom:
        - configMapRef:
            name: ecoalert-config
        - secretRef:
            name: ecoalert-secrets
        resources:
          requests:
            memory: "1Gi"
            cpu: "1000m"
          limits:
            memory: "2Gi"
            cpu: "2000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
      imagePullSecrets:
      - name: registry-secret
```

```yaml
# k8s/app-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: ecoalert-app-service
  namespace: ecoalert
spec:
  selector:
    app: ecoalert-app
  ports:
  - port: 80
    targetPort: 3000
  type: ClusterIP
```

```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ecoalert-ingress
  namespace: ecoalert
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/backend-protocol: "HTTP"
spec:
  tls:
  - hosts:
    - api.ecoalert.com
    secretName: ecoalert-tls
  rules:
  - host: api.ecoalert.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: ecoalert-app-service
            port:
              number: 80
```

#### 2. Helm Chart

```yaml
# charts/ecoalert/Chart.yaml
apiVersion: v2
name: ecoalert
description: A Helm chart for deploying EcoAlert
type: application
version: 1.0.0
appVersion: 1.0.0
```

```yaml
# charts/ecoalert/values.yaml
replicaCount: 3

image:
  repository: your-registry/ecoalert
  pullPolicy: IfNotPresent
  tag: "latest"

imagePullSecrets: []
nameOverride: ""
fullnameOverride: ""

serviceAccount:
  create: true
  annotations: {}
  name: ""

podAnnotations: {}

podSecurityContext: {}
  # fsGroup: 2000

securityContext: {}
  # capabilities:
  #   drop:
  #   - ALL
  # readOnlyRootFilesystem: true
  # runAsNonRoot: true
  # runAsUser: 1000

service:
  type: ClusterIP
  port: 80

ingress:
  enabled: true
  className: "nginx"
  annotations:
    # kubernetes.io/ingress.class: nginx
    # kubernetes.io/tls-acme: "true"
  hosts:
    - host: api.ecoalert.com
      paths:
        - path: /
          pathType: Prefix
  tls: []
  #  - secretName: ecoalert-tls
  #    hosts:
  #      - api.ecoalert.com

resources:
  limits:
    cpu: 2
    memory: 2Gi
  requests:
    cpu: 1
    memory: 1Gi

autoscaling:
  enabled: false
  minReplicas: 1
  maxReplicas: 5
  targetCPUUtilizationPercentage: 80
  # targetMemoryUtilizationPercentage: 80

nodeSelector: {}

tolerations: {}

affinity: {}

postgresql:
  enabled: true
  postgresqlDatabase: ecoalert_prod
  postgresqlUsername: postgres
  postgresqlPassword: password
  persistence:
    enabled: true
    size: 10Gi

redis:
  enabled: true
  password: password
  master:
    persistence:
      enabled: true
      size: 8Gi

monitoring:
  enabled: true
  prometheus:
    enabled: true
  grafana:
    enabled: true
    adminPassword: admin
```

### Cloud Platform Deployment

#### 1. AWS Deployment

##### Infrastructure as Code (Terraform)

```hcl
# main.tf
provider "aws" {
  region = var.aws_region
}

# VPC Configuration
resource "aws_vpc" "ecoalert_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "ecoalert-vpc"
  }
}

# Subnets
resource "aws_subnet" "public_subnet" {
  vpc_id                  = aws_vpc.ecoalert_vpc.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = true
  availability_zone       = data.aws_availability_zones.available.names[0]

  tags = {
    Name = "ecoalert-public-subnet"
  }
}

resource "aws_subnet" "private_subnet" {
  vpc_id            = aws_vpc.ecoalert_vpc.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = data.aws_availability_zones.available.names[0]

  tags = {
    Name = "ecoalert-private-subnet"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "ecoalert_igw" {
  vpc_id = aws_vpc.ecoalert_vpc.id

  tags = {
    Name = "ecoalert-igw"
  }
}

# Route Table
resource "aws_route_table" "ecoalert_rt" {
  vpc_id = aws_vpc.ecoalert_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.ecoalert_igw.id
  }

  tags = {
    Name = "ecoalert-rt"
  }
}

resource "aws_route_table_association" "ecoalert_rta" {
  subnet_id      = aws_subnet.public_subnet.id
  route_table_id = aws_route_table.ecoalert_rt.id
}

# Security Groups
resource "aws_security_group" "ecoalert_sg" {
  name        = "ecoalert-sg"
  description = "Security group for EcoAlert"
  vpc_id      = aws_vpc.ecoalert_vpc.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "ecoalert-sg"
  }
}

# RDS Instance
resource "aws_db_instance" "ecoalert_db" {
  identifier           = "ecoalert-db"
  engine               = "postgres"
  engine_version       = "14"
  instance_class       = "db.t3.large"
  allocated_storage    = 100
  storage_type         = "gp2"
  storage_encrypted    = true
  username             = "postgres"
  password             = var.db_password
  parameter_group_name = "default.postgres14"
  vpc_security_group_ids = [aws_security_group.ecoalert_sg.id]
  db_subnet_group_name = aws_db_subnet_group.ecoalert_db_subnet.id
  backup_retention_period = 7
  backup_window        = "03:00-04:00"
  maintenance_window   = "sun:04:00-sun:05:00"
  multi_az             = true

  tags = {
    Name = "ecoalert-db"
  }
}

# ElastiCache for Redis
resource "aws_elasticache_subnet_group" "ecoalert_redis" {
  name        = "ecoalert-redis"
  description = "Subnet group for EcoAlert Redis"
  subnet_ids  = [aws_subnet.private_subnet.id]

  tags = {
    Name = "ecoalert-redis"
  }
}

resource "aws_elasticache_replication_group" "ecoalert_redis" {
  replication_group_id          = "ecoalert-redis"
  description                   = "EcoAlert Redis replication group"
  node_type                     = "cache.m6g.large"
  num_cache_clusters            = 2
  automatic_failover_enabled    = true
  engine_version               = "6.x"
  parameter_group_name         = "default.redis6.x"
  subnet_group_name            = aws_elasticache_subnet_group.ecoalert_redis.name
  security_group_ids           = [aws_security_group.ecoalert_sg.id]
  at_rest_encryption_enabled    = true
  transit_encryption_enabled   = true
  auth_token                   = var.redis_password
  maintenance_window           = "sun:05:00-sun:06:00"
  snapshot_window              = "09:00-10:00"
  snapshot_retention_limit     = 7
  apply_immediately            = true

  tags = {
    Name = "ecoalert-redis"
  }
}

# ECS Cluster
resource "aws_ecs_cluster" "ecoalert" {
  name = "ecoalert-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

# ECS Task Definition
resource "aws_ecs_task_definition" "ecoalert" {
  family                   = "ecoalert-app"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "1024"
  memory                   = "2048"
  execution_role_arn       = aws_iam_role.ecoalert_ecs_execution.arn
  task_role_arn            = aws_iam_role.ecoalert_ecs_task.arn

  container_definitions = jsonencode([
    {
      name  = "ecoalert-app"
      image = "${var.ecr_repository}:${var.image_tag}"
      portMappings = [
        {
          containerPort = 3000
          protocol      = "tcp"
        }
      ]
      environment = [
        {
          name  = "NODE_ENV"
          value = "production"
        },
        {
          name  = "DATABASE_URL"
          value = "postgresql://postgres:${var.db_password}@${aws_db_instance.ecoalert_db.address}:5432/ecoalert_prod"
        },
        {
          name  = "REDIS_URL"
          value = "redis://${aws_elasticache_replication_group.ecoalert_redis.primary_endpoint_address}:6379"
        },
        {
          name  = "NEXTAUTH_URL"
          value = "https://api.ecoalert.com"
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/ecoalert"
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])
}

# ECS Service
resource "aws_ecs_service" "ecoalert" {
  name            = "ecoalert-service"
  cluster         = aws_ecs_cluster.ecoalert.id
  task_definition = aws_ecs_task_definition.ecoalert.id
  desired_count   = 3
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = [aws_subnet.private_subnet.id]
    assign_public_ip = false
    security_groups  = [aws_security_group.ecoalert_sg.id]
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.ecoalert.arn
    container_name   = "ecoalert-app"
    container_port   = 3000
  }

  depends_on = [
    aws_lb_listener.ecoalert_http,
    aws_lb_listener.ecoalert_https
  ]
}

# Application Load Balancer
resource "aws_lb" "ecoalert" {
  name               = "ecoalert-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.ecoalert_sg.id]
  subnets            = [aws_subnet.public_subnet.id]

  enable_deletion_protection = false

  tags = {
    Environment = "production"
  }
}

resource "aws_lb_target_group" "ecoalert" {
  name        = "ecoalert-tg"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = aws_vpc.ecoalert_vpc.id
  target_type = "ip"

  health_check {
    path = "/health"
    port = "3000"
  }
}

resource "aws_lb_listener" "ecoalert_http" {
  load_balancer_arn = aws_lb.ecoalert.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type = "redirect"

    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

resource "aws_lb_listener" "ecoalert_https" {
  load_balancer_arn = aws_lb.ecoalert.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn   = aws_acm_certificate.ecoalert.arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.ecoalert.arn
  }
}

# ACM Certificate
resource "aws_acm_certificate" "ecoalert" {
  domain_name       = "api.ecoalert.com"
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

# Route 53 DNS
resource "aws_route53_record" "ecoalert" {
  zone_id = var.hosted_zone_id
  name    = "api.ecoalert.com"
  type    = "A"

  alias {
    name                   = aws_lb.ecoalert.dns_name
    zone_id                = aws_lb.ecoalert.zone_id
    evaluate_target_health = true
  }
}
```

##### AWS ECS Deployment Script

```bash
#!/bin/bash
# aws-deploy.sh

set -e

# Configuration
AWS_REGION="us-east-1"
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
IMAGE_TAG=$(git rev-parse --short HEAD)
ECR_REPOSITORY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/ecoalert"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Login to ECR
log "Logging in to ECR..."
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

# Build Docker image
log "Building Docker image..."
docker build -t ${ECR_REPOSITORY}:${IMAGE_TAG} .

# Push to ECR
log "Pushing image to ECR..."
docker push ${ECR_REPOSITORY}:${IMAGE_TAG}

# Update ECS service
log "Updating ECS service..."
aws ecs update-service \
    --cluster ecoalert-cluster \
    --service ecoalert-service \
    --force-new-deployment \
    --region ${AWS_REGION}

# Wait for deployment to complete
log "Waiting for deployment to complete..."
aws ecs wait services-stable \
    --cluster ecoalert-cluster \
    --services ecoalert-service \
    --region ${AWS_REGION}

log "Deployment completed successfully!"
```

#### 2. Google Cloud Platform (GCP) Deployment

##### Terraform Configuration

```hcl
# main.tf
provider "google" {
  project = var.gcp_project
  region  = var.gcp_region
}

# VPC Network
resource "google_compute_network" "ecoalert_vpc" {
  name                    = "ecoalert-vpc"
  auto_create_subnetworks = false
}

# Subnets
resource "google_compute_subnetwork" "ecoalert_subnet" {
  name          = "ecoalert-subnet"
  ip_cidr_range = "10.0.0.0/24"
  network       = google_compute_network.ecoalert_vpc.id
}

# Cloud SQL Instance
resource "google_sql_database_instance" "ecoalert_db" {
  name             = "ecoalert-db"
  database_version = "POSTGRES_14"
  region           = var.gcp_region
  
  settings {
    tier              = "db-g1-small"
    disk_type         = "PD_SSD"
    availability_type = "REGIONAL"
    
    backup_configuration {
      enabled            = true
      binary_log_enabled = true
    }
    
    ip_configuration {
      ipv4_enabled = true
      authorized_networks {
        name  = "all"
        value = "0.0.0.0/0"
      }
    }
  }
  
  maintenance_window {
    day  = 7
    hour = 3
  }
}

# Memorystore for Redis
resource "google_memorade_redis_instance" "ecoalert_redis" {
  name           = "ecoalert-redis"
  memory_size_gb = 1
  tier           = "STANDARD_HA"
  
  location_id    = var.gcp_region
  
  redis_version  = "REDIS_6_X"
  
  auth_enabled   = true
  password       = var.redis_password
  
  maintenance_policy {
    weekly_maintenance_window {
      day = "SUNDAY"
      hour = 3
    }
  }
}

# Cloud Run Service
resource "google_cloud_run_service" "ecoalert" {
  name     = "ecoalert"
  location = var.gcp_region
  
  template {
    spec {
      containers {
        image = "${google_artifact_registry_repository.ecoalert_repository.location}-docker.pkg.dev/${var.gcp_project}/${google_artifact_registry_repository.ecoalert_repository.name}/ecoalert:${var.image_tag}"
        
        env {
          name  = "NODE_ENV"
          value = "production"
        }
        
        env {
          name  = "DATABASE_URL"
          value = "postgres://postgres:${var.db_password}@${google_sql_database_instance.ecoalert_db.private_ip_address}:5432/ecoalert_prod?sslmode=require"
        }
        
        env {
          name  = "REDIS_URL"
          value = "redis://${google_memorade_redis_instance.ecoalert_redis.host}:6379"
        }
        
        env {
          name  = "NEXTAUTH_URL"
          value = "https://api.ecoalert.com"
        }
        
        resources {
          limits = {
            cpu    = "1000m"
            memory = "2Gi"
          }
          requests = {
            cpu    = "500m"
            memory = "1Gi"
          }
        }
      }
      
      container_concurrency = 100
      timeout_seconds       = 300
    }
  }
  
  traffic {
    percent         = 100
    latest_revision = true
  }
}

# Artifact Registry
resource "google_artifact_registry_repository" "ecoalert_repository" {
  repository_id   = "ecoalert-repo"
  format         = "DOCKER"
  project        = var.gcp_project
  location       = var.gcp_region
  description    = "Docker repository for EcoAlert"
  kms_key_name   = null
  mode           = "STANDARD_REPOSITORY"
  maven_settings = null
  remote_repository_config = null
  cleaning_policies = []
}

# Cloud Load Balancing
resource "google_compute_global_address" "ecoalert_ip" {
  name = "ecoalert-ip"
}

resource "google_compute_managed_ssl_certificate" "ecoalert_ssl" {
  name = "ecoalert-ssl"
  
  managed {
    domains = ["api.ecoalert.com"]
  }
}

resource "google_compute_backend_service" "ecoalert_backend" {
  name            = "ecoalert-backend"
  protocol        = "HTTP"
  port_name       = "http"
  timeout_sec     = 30
  enable_cdn      = false
  
  backend {
    group           = google_compute_instance_group.ecoalert_group.id
    balancing_mode  = "UTILIZATION"
    capacity_scaler = 1.0
  }
  
  health_checks = [google_compute_http_health_check.ecoalert_health.id]
}

resource "google_compute_http_health_check" "ecoalert_health" {
  name               = "ecoalert-health"
  request_path       = "/health"
  port               = 3000
  check_interval_sec = 5
  timeout_sec        = 5
  unhealthy_threshold = 2
  healthy_threshold   = 2
}

resource "google_compute_url_map" "ecoalert_url_map" {
  name            = "ecoalert-url-map"
  
  default_service = google_compute_backend_service.ecoalert_backend.id
}

resource "google_compute_target_https_proxy" "ecoalert_https_proxy" {
  name             = "ecoalert-https-proxy"
  url_map          = google_compute_url_map.ecoalert_url_map.id
  ssl_certificates = [google_compute_managed_ssl_certificate.ecoalert_ssl.id]
}

resource "google_compute_global_forwarding_rule" "ecoalert_https_forwarding" {
  name                  = "ecoalert-https-forwarding"
  target                = google_compute_target_https_proxy.ecoalert_https_proxy.id
  port_range            = "443"
  ip_address            = google_compute_global_address.ecoalert_ip.id
  load_balancing_scheme = "EXTERNAL_MANAGED"
  require_ssl           = true
}
```

##### GCP Deployment Script

```bash
#!/bin/bash
# gcp-deploy.sh

set -e

# Configuration
GCP_PROJECT="ecoalert-project"
GCP_REGION="us-central1"
IMAGE_TAG=$(git rev-parse --short HEAD)
ARTIFACT_REGISTRY="us-central1-docker.pkg.dev/${GCP_PROJECT}/ecoalert-repo"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Configure Docker to use Artifact Registry
log "Configuring Docker for Artifact Registry..."
gcloud auth configure-docker ${GCP_REGION}-docker.pkg.dev

# Build and push Docker image
log "Building and pushing Docker image..."
docker build -t ${ARTIFACT_REGISTRY}/ecoalert:${IMAGE_TAG} .

docker push ${ARTIFACT_REGISTRY}/ecoalert:${IMAGE_TAG}

# Deploy to Cloud Run
log "Deploying to Cloud Run..."
gcloud run deploy ecoalert \
    --image ${ARTIFACT_REGISTRY}/ecoalert:${IMAGE_TAG} \
    --platform managed \
    --region ${GCP_REGION} \
    --allow-unauthenticated \
    --set-env-vars="NODE_ENV=production" \
    --set-env-vars="NEXTAUTH_URL=https://api.ecoalert.com" \
    --set-env-vars="DATABASE_URL=postgres://postgres:${DB_PASSWORD}@${DB_HOST}:5432/ecoalert_prod?sslmode=require" \
    --set-env-vars="REDIS_URL=redis://${REDIS_HOST}:6379" \
    --memory 2Gi \
    --cpu 1000m \
    --max-instances 100

# Update load balancer
log "Updating load balancer..."
gcloud compute url-maps update ecoalert-url-map \
    --default-service ecoalert-backend

log "Deployment completed successfully!"
```

## Environment Configuration

### Production Environment Variables

Create a comprehensive `.env.production` file:

```env
# Application Configuration
NODE_ENV=production
TURBOPACK=true
PORT=3000

# Database Configuration
DATABASE_URL=postgresql://postgres:${DB_PASSWORD}@${DB_HOST}:5432/ecoalert_prod?sslmode=require
DATABASE_HOST=your-db-host
DATABASE_PORT=5432
DATABASE_NAME=ecoalert_prod
DATABASE_USER=postgres
DATABASE_PASSWORD=${DB_PASSWORD}

# Redis Configuration
REDIS_URL=redis://${REDIS_HOST}:${REDIS_PORT}
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=${REDIS_PASSWORD}

# Authentication
NEXTAUTH_URL=https://api.ecoalert.com
NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
JWT_SECRET=${JWT_SECRET}

# API Keys
OPENWEATHER_API_KEY=${OPENWEATHER_API_KEY}
WAQI_API_KEY=${WAQI_API_KEY}
GOOGLE_MAPS_API_KEY=${GOOGLE_MAPS_API_KEY}
STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
STRIPE_PUBLISHABLE_KEY=${STRIPE_PUBLISHABLE_KEY}

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=${SMTP_USER}
SMTP_PASS=${SMTP_PASSWORD}
FROM_EMAIL=noreply@ecoalert.com

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf

# Monitoring and Logging
SENTRY_DSN=${SENTRY_DSN}
LOG_LEVEL=info
ENABLE_REQUEST_LOGGING=true

# Performance Optimization
CACHE_TTL=3600
ENABLE_CACHING=true
CDN_URL=https://cdn.ecoalert.com

# Security
ENABLE_RATE_LIMITING=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
ENABLE_SECURITY_HEADERS=true

# Third-party Integrations
TWILIO_ACCOUNT_SID=${TWILIO_ACCOUNT_SID}
TWILIO_AUTH_TOKEN=${TWILIO_AUTH_TOKEN}
TWILIO_PHONE_NUMBER=${TWILIO_PHONE_NUMBER}
SLACK_WEBHOOK_URL=${SLACK_WEBHOOK_URL}
DISCORD_WEBHOOK_URL=${DISCORD_WEBHOOK_URL}

# Analytics
GOOGLE_ANALYTICS_ID=${GOOGLE_ANALYTICS_ID}
MIXPANEL_TOKEN=${MIXPANEL_TOKEN}

# Development/Testing (should be empty in production)
DEBUG=false
MOCK_SERVICES=false
TEST_MODE=false
```

### Database Configuration

#### PostgreSQL Configuration

```sql
-- postgres.conf
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 4MB
min_wal_size = 1GB
max_wal_size = 4GB
checkpoint_timeout = 30min
```

#### TimescaleDB Configuration

```sql
-- Create TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Create hypertables for sensor data
SELECT create_hypertable('sensor_readings', 'timestamp');

-- Create indexes for performance
CREATE INDEX CONCURRENTLY idx_sensor_readings_sensor_id ON sensor_readings(sensor_id);
CREATE INDEX CONCURRENTLY idx_sensor_readings_timestamp ON sensor_readings(timestamp);
CREATE INDEX CONCURRENTLY idx_sensor_readings_location ON sensor_readings(location);

-- Create compression policy for old data
SELECT add_compression_policy('sensor_readings', 'time_bucket(\'1 day\', timestamp)');

-- Create retention policy
SELECT add_retention_policy('sensor_readings', INTERVAL '30 days');

-- Create continuous aggregate for pre-aggregated data
CREATE MATERIALIZED VIEW sensor_readings_daily
WITH (timescaledb.continuous) AS
  SELECT
    time_bucket('1 day', timestamp) AS day,
    sensor_id,
    avg(pm25) as avg_pm25,
    max(pm25) as max_pm25,
    min(pm25) as min_pm25,
    avg(pm10) as avg_pm10,
    max(pm10) as max_pm10,
    min(pm10) as min_pm10,
    avg(o3) as avg_o3,
    max(o3) as max_o3,
    min(o3) as min_o3,
    avg(no2) as avg_no2,
    max(no2) as max_no2,
    min(no2) as min_no2
  FROM sensor_readings
  GROUP BY time_bucket('1 day', timestamp), sensor_id;

-- Create continuous aggregate materialization policy
SELECT add_continuous_aggregate_policy('sensor_readings_daily',
  start => now() - INTERVAL '7 days',
  end => now(),
  schedule => INTERVAL '1 hour'
);
```

### SSL/TLS Configuration

#### Let's Encrypt Certificate Management

```bash
#!/bin/bash
# ssl-setup.sh

set -e

DOMAIN="api.ecoalert.com"
EMAIL="admin@ecoalert.com"

# Install Certbot
sudo apt-get update
sudo apt-get install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot certonly --nginx \
  --email ${EMAIL} \
  --agree-tos \
  --no-eff-email \
  -d ${DOMAIN}

# Create renewal hook
cat > /etc/letsencrypt/renewal-hooks/post/ecoalert-reload << 'EOF'
#!/bin/bash
# Reload nginx after certificate renewal
systemctl reload nginx
EOF

chmod +x /etc/letsencrypt/renewal-hooks/post/ecoalert-reload

# Test renewal
sudo certbot renew --dry-run

# Set up auto-renewal in crontab
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet --post-hook 'systemctl reload nginx'") | crontab -
```

#### NGINX SSL Configuration

```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    # Basic settings
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # MIME types
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;

    # Upstream servers
    upstream ecoalert_app {
        server 127.0.0.1:3000;
        # Add more servers for load balancing
        # server 127.0.0.1:3001;
        # server 127.0.0.1:3002;
    }

    # HTTP server - redirect to HTTPS
    server {
        listen 80;
        server_name api.ecoalert.com www.ecoalert.com;
        return 301 https://$server_name$request_uri;
    }

    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name api.ecoalert.com www.ecoalert.com;

        # SSL configuration
        ssl_certificate /etc/letsencrypt/live/api.ecoalert.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/api.ecoalert.com/privkey.pem;
        
        # SSL security settings
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384';
        ssl_prefer_server_ciphers off;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 1d;
        ssl_session_tickets off;
        
        # HSTS
        add_header Strict-Transport-Security "max-age=63072000" always;

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Referrer-Policy "strict-origin-when-cross-origin";

        # Rate limiting for API endpoints
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            
            proxy_pass http://ecoalert_app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            proxy_cache_bypass $http_upgrade;
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;

# EcoAlert Deployment Guide

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Deployment Options](#deployment-options)
  - [Docker Deployment](#docker-deployment)
  - [Kubernetes Deployment](#kubernetes-deployment)
  - [Cloud Platform Deployment](#cloud-platform-deployment)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [SSL/TLS Configuration](#ssltls-configuration)
- [Monitoring & Logging](#monitoring--logging)
- [Scaling & Performance](#scaling--performance)
- [Backup & Recovery](#backup--recovery)
- [Maintenance](#maintenance)
- [Troubleshooting](#troubleshooting)

## Overview

This guide provides comprehensive instructions for deploying EcoAlert to various environments. The deployment process has been designed to be consistent across different platforms while optimizing for each specific environment's characteristics.

## Prerequisites

### System Requirements

**Minimum Requirements:**
- 4 vCPUs
- 8GB RAM
- 100GB SSD storage
- Ubuntu 20.04+ or CentOS 8+

**Recommended Requirements:**
- 8 vCPUs
- 16GB RAM
- 200GB SSD storage
- Load balancer
- Multiple availability zones

### Software Requirements

- Node.js 18+ (LTS version)
- PostgreSQL 14+
- Redis 6+
- Docker 20.10+
- Docker Compose 2.0+
- NGINX 1.18+
- Certbot for SSL certificates

### Network Requirements

- HTTP/HTTPS access (ports 80, 443)
- Database access (port 5432)
- Redis access (port 6379)
- Monitoring ports (if applicable)

## Deployment Options

### Docker Deployment

#### 1. Docker Compose Setup

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/ecoalert_prod
      - REDIS_URL=redis://redis:6379
      - NEXTAUTH_URL=https://api.ecoalert.com
    depends_on:
      - db
      - redis
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs
    restart: unless-stopped

  db:
    image: timescale/timescaledb:latest-pg14
    environment:
      POSTGRES_DB: ecoalert_prod
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    restart: unless-stopped

  redis:
    image: redis:6-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
    restart: unless-stopped

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      GF_SECURITY_ADMIN_PASSWORD: admin
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana/provisioning:/etc/grafana/provisioning
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  prometheus_data:
  grafana_data:
```

#### 2. Dockerfile Configuration

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

#### 3. Deployment Script

```bash
#!/bin/bash
# deploy.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="ecoalert"
DEPLOY_ENV="production"
BACKUP_DIR="/backups/$PROJECT_NAME"

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    error "Please do not run as root"
fi

# Stop services
log "Stopping existing services..."
docker-compose down

# Backup database
log "Creating database backup..."
mkdir -p $BACKUP_DIR
docker exec -t ecoalert_db pg_dump -U postgres ecoalert_prod > $BACKUP_DIR/db_backup_$(date +%Y%m%d_%H%M%S).sql
gzip $BACKUP_DIR/db_backup_$(date +%Y%m%d_%H%M%S).sql

# Pull latest images
log "Pulling latest Docker images..."
docker-compose pull

# Build and start services
log "Building and starting services..."
docker-compose up -d --build

# Wait for services to be ready
log "Waiting for services to be ready..."
sleep 30

# Run database migrations
log "Running database migrations..."
docker-compose exec -T app npx prisma migrate deploy

# Seed database if needed
log "Seeding database..."
docker-compose exec -T app npx prisma db seed

# Verify deployment
log "Verifying deployment..."
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    log "Deployment successful!"
else
    error "Health check failed"
fi

# Clean up old backups
log "Cleaning up old backups..."
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

log "Deployment completed successfully!"
```

### Kubernetes Deployment

#### 1. Kubernetes Manifests

```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: ecoalert
  labels:
    app: ecoalert
    environment: production
```

```yaml
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: ecoalert-config
  namespace: ecoalert
data:
  NODE_ENV: "production"
  NEXTAUTH_URL: "https://api.ecoalert.com"
  DATABASE_HOST: "postgres-service"
  REDIS_HOST: "redis-service"
  # Add other environment variables as needed
```

```yaml
# k8s/secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: ecoalert-secrets
  namespace: ecoalert
type: Opaque
data:
  # Base64 encoded secrets
  database-password: <base64-encoded-password>
  redis-password: <base64-encoded-password>
  nextauth-secret: <base64-encoded-secret>
  api-keys: <base64-encoded-api-keys>
```

```yaml
# k8s/postgres-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
  namespace: ecoalert
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: timescale/timescaledb:latest-pg14
        env:
        - name: POSTGRES_DB
          value: ecoalert_prod
        - name: POSTGRES_USER
          value: postgres
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: ecoalert-secrets
              key: database-password
        ports:
        - containerPort: 5432
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
        resources:
          requests:
            memory: "2Gi"
            cpu: "1000m"
          limits:
            memory: "4Gi"
            cpu: "2000m"
      volumes:
      - name: postgres-storage
        persistentVolumeClaim:
          claimName: postgres-pvc
```

```yaml
# k8s/postgres-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: postgres-service
  namespace: ecoalert
spec:
  selector:
    app: postgres
  ports:
  - port: 5432
    targetPort: 5432
```

```yaml
# k8s/redis-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis
  namespace: ecoalert
spec:
  replicas: 1
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
      - name: redis
        image: redis:6-alpine
        ports:
        - containerPort: 6379
        env:
        - name: REDIS_PASSWORD
          valueFrom:
            secretKeyRef:
              name: ecoalert-secrets
              key: redis-password
        command:
        - redis-server
        - --requirepass
        - $(REDIS_PASSWORD)
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
```

```yaml
# k8s/redis-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: redis-service
  namespace: ecoalert
spec:
  selector:
    app: redis
  ports:
  - port: 6379
    targetPort: 6379
```

```yaml
# k8s/app-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ecoalert-app
  namespace: ecoalert
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ecoalert-app
  template:
    metadata:
      labels:
        app: ecoalert-app
    spec:
      containers:
      - name: ecoalert-app
        image: your-registry/ecoalert:latest
        ports:
        - containerPort: 3000
        envFrom:
        - configMapRef:
            name: ecoalert-config
        - secretRef:
            name: ecoalert-secrets
        resources:
          requests:
            memory: "1Gi"
            cpu: "1000m"
          limits:
            memory: "2Gi"
            cpu: "2000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
      imagePullSecrets:
      - name: registry-secret
```

```yaml
# k8s/app-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: ecoalert-app-service
  namespace: ecoalert
spec:
  selector:
    app: ecoalert-app
  ports:
  - port: 80
    targetPort: 3000
  type: ClusterIP
```

```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ecoalert-ingress
  namespace: ecoalert
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/backend-protocol: "HTTP"
spec:
  tls:
  - hosts:
    - api.ecoalert.com
    secretName: ecoalert-tls
  rules:
  - host: api.ecoalert.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: ecoalert-app-service
            port:
              number: 80
```

#### 2. Helm Chart

```yaml
# charts/ecoalert/Chart.yaml
apiVersion: v2
name: ecoalert
description: A Helm chart for deploying EcoAlert
type: application
version: 1.0.0
appVersion: 1.0.0
```

```yaml
# charts/ecoalert/values.yaml
replicaCount: 3

image:
  repository: your-registry/ecoalert
  pullPolicy: IfNotPresent
  tag: "latest"

imagePullSecrets: []
nameOverride: ""
fullnameOverride: ""

serviceAccount:
  create: true
  annotations: {}
  name: ""

podAnnotations: {}

podSecurityContext: {}
  # fsGroup: 2000

securityContext: {}
  # capabilities:
  #   drop:
  #   - ALL
  # readOnlyRootFilesystem: true
  # runAsNonRoot: true
  # runAsUser: 1000

service:
  type: ClusterIP
  port: 80

ingress:
  enabled: true
  className: "nginx"
  annotations:
    # kubernetes.io/ingress.class: nginx
    # kubernetes.io/tls-acme: "true"
  hosts:
    - host: api.ecoalert.com
      paths:
        - path: /
          pathType: Prefix
  tls: []
  #  - secretName: ecoalert-tls
  #    hosts:
  #      - api.ecoalert.com

resources:
  limits:
    cpu: 2
    memory: 2Gi
  requests:
    cpu: 1
    memory: 1Gi

autoscaling:
  enabled: false
  minReplicas: 1
  maxReplicas: 5
  targetCPUUtilizationPercentage: 80
  # targetMemoryUtilizationPercentage: 80

nodeSelector: {}

tolerations: {}

affinity: {}

postgresql:
  enabled: true
  postgresqlDatabase: ecoalert_prod
  postgresqlUsername: postgres
  postgresqlPassword: password
  persistence:
    enabled: true
    size: 10Gi

redis:
  enabled: true
  password: password
  master:
    persistence:
      enabled: true
      size: 8Gi

monitoring:
  enabled: true
  prometheus:
    enabled: true
  grafana:
    enabled: true
    adminPassword: admin
```

### Cloud Platform Deployment

#### 1. AWS Deployment

##### Infrastructure as Code (Terraform)

```hcl
# main.tf
provider "aws" {
  region = var.aws_region
}

# VPC Configuration
resource "aws_vpc" "ecoalert_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "ecoalert-vpc"
  }
}

# Subnets
resource "aws_subnet" "public_subnet" {
  vpc_id                  = aws_vpc.ecoalert_vpc.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = true
  availability_zone       = data.aws_availability_zones.available.names[0]

  tags = {
    Name = "ecoalert-public-subnet"
  }
}

resource "aws_subnet" "private_subnet" {
  vpc_id            = aws_vpc.ecoalert_vpc.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = data.aws_availability_zones.available.names[0]

  tags = {
    Name = "ecoalert-private-subnet"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "ecoalert_igw" {
  vpc_id = aws_vpc.ecoalert_vpc.id

  tags = {
    Name = "ecoalert-igw"
  }
}

# Route Table
resource "aws_route_table" "ecoalert_rt" {
  vpc_id = aws_vpc.ecoalert_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.ecoalert_igw.id
  }

  tags = {
    Name = "ecoalert-rt"
  }
}

resource "aws_route_table_association" "ecoalert_rta" {
  subnet_id      = aws_subnet.public_subnet.id
  route_table_id = aws_route_table.ecoalert_rt.id
}

# Security Groups
resource "aws_security_group" "ecoalert_sg" {
  name        = "ecoalert-sg"
  description = "Security group for EcoAlert"
  vpc_id      = aws_vpc.ecoalert_vpc.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "ecoalert-sg"
  }
}

# RDS Instance
resource "aws_db_instance" "ecoalert_db" {
  identifier           = "ecoalert-db"
  engine               = "postgres"
  engine_version       = "14"
  instance_class       = "db.t3.large"
  allocated_storage    = 100
  storage_type         = "gp2"
  storage_encrypted    = true
  username             = "postgres"
  password             = var.db_password
  parameter_group_name = "default.postgres14"
  vpc_security_group_ids = [aws_security_group.ecoalert_sg.id]
  db_subnet_group_name = aws_db_subnet_group.ecoalert_db_subnet.id
  backup_retention_period = 7
  backup_window        = "03:00-04:00"
  maintenance_window   = "sun:04:00-sun:05:00"
  multi_az             = true

  tags = {
    Name = "ecoalert-db"
  }
}

# ElastiCache for Redis
resource "aws_elasticache_subnet_group" "ecoalert_redis" {
  name        = "ecoalert-redis"
  description = "Subnet group for EcoAlert Redis"
  subnet_ids  = [aws_subnet.private_subnet.id]

  tags = {
    Name = "ecoalert-redis"
  }
}

resource "aws_elasticache_replication_group" "ecoalert_redis" {
  replication_group_id          = "ecoalert-redis"
  description                   = "EcoAlert Redis replication group"
  node_type                     = "cache.m6g.large"
  num_cache_clusters            = 2
  automatic_failover_enabled    = true
  engine_version               = "6.x"
  parameter_group_name         = "default.redis6.x"
  subnet_group_name            = aws_elasticache_subnet_group.ecoalert_redis.name
  security_group_ids           = [aws_security_group.ecoalert_sg.id]
  at_rest_encryption_enabled    = true
  transit_encryption_enabled   = true
  auth_token                   = var.redis_password
  maintenance_window           = "sun:05:00-sun:06:00"
  snapshot_window              = "09:00-10:00"
  snapshot_retention_limit     = 7
  apply_immediately            = true

  tags = {
    Name = "ecoalert-redis"
  }
}

# ECS Cluster
resource "aws_ecs_cluster" "ecoalert" {
  name = "ecoalert-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

# ECS Task Definition
resource "aws_ecs_task_definition" "ecoalert" {
  family                   = "ecoalert-app"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "1024"
  memory                   = "2048"
  execution_role_arn       = aws_iam_role.ecoalert_ecs_execution.arn
  task_role_arn            = aws_iam_role.ecoalert_ecs_task.arn

  container_definitions = jsonencode([
    {
      name  = "ecoalert-app"
      image = "${var.ecr_repository}:${var.image_tag}"
      portMappings = [
        {
          containerPort = 3000
          protocol      = "tcp"
        }
      ]
      environment = [
        {
          name  = "NODE_ENV"
          value = "production"
        },
        {
          name  = "DATABASE_URL"
          value = "postgresql://postgres:${var.db_password}@${aws_db_instance.ecoalert_db.address}:5432/ecoalert_prod"
        },
        {
          name  = "REDIS_URL"
          value = "redis://${aws_elasticache_replication_group.ecoalert_redis.primary_endpoint_address}:6379"
        },
        {
          name  = "NEXTAUTH_URL"
          value = "https://api.ecoalert.com"
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/ecoalert"
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])
}

# ECS Service
resource "aws_ecs_service" "ecoalert" {
  name            = "ecoalert-service"
  cluster         = aws_ecs_cluster.ecoalert.id
  task_definition = aws_ecs_task_definition.ecoalert.id
  desired_count   = 3
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = [aws_subnet.private_subnet.id]
    assign_public_ip = false
    security_groups  = [aws_security_group.ecoalert_sg.id]
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.ecoalert.arn
    container_name   = "ecoalert-app"
    container_port   = 3000
  }

  depends_on = [
    aws_lb_listener.ecoalert_http,
    aws_lb_listener.ecoalert_https
  ]
}

# Application Load Balancer
resource "aws_lb" "ecoalert" {
  name               = "ecoalert-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.ecoalert_sg.id]
  subnets            = [aws_subnet.public_subnet.id]

  enable_deletion_protection = false

  tags = {
    Environment = "production"
  }
}

resource "aws_lb_target_group" "ecoalert" {
  name        = "ecoalert-tg"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = aws_vpc.ecoalert_vpc.id
  target_type = "ip"

  health_check {
    path = "/health"
    port = "3000"
  }
}

resource "aws_lb_listener" "ecoalert_http" {
  load_balancer_arn = aws_lb.ecoalert.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type = "redirect"

    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

resource "aws_lb_listener" "ecoalert_https" {
  load_balancer_arn = aws_lb.ecoalert.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn   = aws_acm_certificate.ecoalert.arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.ecoalert.arn
  }
}

# ACM Certificate
resource "aws_acm_certificate" "ecoalert" {
  domain_name       = "api.ecoalert.com"
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

# Route 53 DNS
resource "aws_route53_record" "ecoalert" {
  zone_id = var.hosted_zone_id
  name    = "api.ecoalert.com"
  type    = "A"

  alias {
    name                   = aws_lb.ecoalert.dns_name
    zone_id                = aws_lb.ecoalert.zone_id
    evaluate_target_health = true
  }
}
```

##### AWS ECS Deployment Script

```bash
#!/bin/bash
# aws-deploy.sh

set -e

# Configuration
AWS_REGION="us-east-1"
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
IMAGE_TAG=$(git rev-parse --short HEAD)
ECR_REPOSITORY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/ecoalert"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Login to ECR
log "Logging in to ECR..."
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

# Build Docker image
log "Building Docker image..."
docker build -t ${ECR_REPOSITORY}:${IMAGE_TAG} .

# Push to ECR
log "Pushing image to ECR..."
docker push ${ECR_REPOSITORY}:${IMAGE_TAG}

# Update ECS service
log "Updating ECS service..."
aws ecs update-service \
    --cluster ecoalert-cluster \
    --service ecoalert-service \
    --force-new-deployment \
    --region ${AWS_REGION}

# Wait for deployment to complete
log "Waiting for deployment to complete..."
aws ecs wait services-stable \
    --cluster ecoalert-cluster \
    --services ecoalert-service \
    --region ${AWS_REGION}

log "Deployment completed successfully!"
```

#### 2. Google Cloud Platform (GCP) Deployment

##### Terraform Configuration

```hcl
# main.tf
provider "google" {
  project = var.gcp_project
  region  = var.gcp_region
}

# VPC Network
resource "google_compute_network" "ecoalert_vpc" {
  name                    = "ecoalert-vpc"
  auto_create_subnetworks = false
}

# Subnets
resource "google_compute_subnetwork" "ecoalert_subnet" {
  name          = "ecoalert-subnet"
  ip_cidr_range = "10.0.0.0/24"
  network       = google_compute_network.ecoalert_vpc.id
}

# Cloud SQL Instance
resource "google_sql_database_instance" "ecoalert_db" {
  name             = "ecoalert-db"
  database_version = "POSTGRES_14"
  region           = var.gcp_region
  
  settings {
    tier              = "db-g1-small"
    disk_type         = "PD_SSD"
    availability_type = "REGIONAL"
    
    backup_configuration {
      enabled            = true
      binary_log_enabled = true
    }
    
    ip_configuration {
      ipv4_enabled = true
      authorized_networks {
        name  = "all"
        value = "0.0.0.0/0"
      }
    }
  }
  
  maintenance_window {
    day  = 7
    hour = 3
  }
}

# Memorystore for Redis
resource "google_memorade_redis_instance" "ecoalert_redis" {
  name           = "ecoalert-redis"
  memory_size_gb = 1
  tier           = "STANDARD_HA"
  
  location_id    = var.gcp_region
  
  redis_version  = "REDIS_6_X"
  
  auth_enabled   = true
  password       = var.redis_password
  
  maintenance_policy {
    weekly_maintenance_window {
      day = "SUNDAY"
      hour = 3
    }
  }
}

# Cloud Run Service
resource "google_cloud_run_service" "ecoalert" {
  name     = "ecoalert"
  location = var.gcp_region
  
  template {
    spec {
      containers {
        image = "${google_artifact_registry_repository.ecoalert_repository.location}-docker.pkg.dev/${var.gcp_project}/${google_artifact_registry_repository.ecoalert_repository.name}/ecoalert:${var.image_tag}"
        
        env {
          name  = "NODE_ENV"
          value = "production"
        }
        
        env {
          name  = "DATABASE_URL"
          value = "postgres://postgres:${var.db_password}@${google_sql_database_instance.ecoalert_db.private_ip_address}:5432/ecoalert_prod?sslmode=require"
        }
        
        env {
          name  = "REDIS_URL"
          value = "redis://${google_memorade_redis_instance.ecoalert_redis.host}:6379"
        }
        
        env {
          name  = "NEXTAUTH_URL"
          value = "https://api.ecoalert.com"
        }
        
        resources {
          limits = {
            cpu    = "1000m"
            memory = "2Gi"
          }
          requests = {
            cpu    = "500m"
            memory = "1Gi"
          }
        }
      }
      
      container_concurrency = 100
      timeout_seconds       = 300
    }
  }
  
  traffic {
    percent         = 100
    latest_revision = true
  }
}

# Artifact Registry
resource "google_artifact_registry_repository" "ecoalert_repository" {
  repository_id   = "ecoalert-repo"
  format         = "DOCKER"
  project        = var.gcp_project
  location       = var.gcp_region
  description    = "Docker repository for EcoAlert"
  kms_key_name   = null
  mode           = "STANDARD_REPOSITORY"
  maven_settings = null
  remote_repository_config = null
  cleaning_policies = []
}

# Cloud Load Balancing
resource "google_compute_global_address" "ecoalert_ip" {
  name = "ecoalert-ip"
}

resource "google_compute_managed_ssl_certificate" "ecoalert_ssl" {
  name = "ecoalert-ssl"
  
  managed {
    domains = ["api.ecoalert.com"]
  }
}

resource "google_compute_backend_service" "ecoalert_backend" {
  name            = "ecoalert-backend"
  protocol        = "HTTP"
  port_name       = "http"
  timeout_sec     = 30
  enable_cdn      = false
  
  backend {
    group           = google_compute_instance_group.ecoalert_group.id
    balancing_mode  = "UTILIZATION"
    capacity_scaler = 1.0
  }
  
  health_checks = [google_compute_http_health_check.ecoalert_health.id]
}

resource "google_compute_http_health_check" "ecoalert_health" {
  name               = "ecoalert-health"
  request_path       = "/health"
  port               = 3000
  check_interval_sec = 5
  timeout_sec        = 5
  unhealthy_threshold = 2
  healthy_threshold   = 2
}

resource "google_compute_url_map" "ecoalert_url_map" {
  name            = "ecoalert-url-map"
  
  default_service = google_compute_backend_service.ecoalert_backend.id
}

resource "google_compute_target_https_proxy" "ecoalert_https_proxy" {
  name             = "ecoalert-https-proxy"
  url_map          = google_compute_url_map.ecoalert_url_map.id
  ssl_certificates = [google_compute_managed_ssl_certificate.ecoalert_ssl.id]
}

resource "google_compute_global_forwarding_rule" "ecoalert_https_forwarding" {
  name                  = "ecoalert-https-forwarding"
  target                = google_compute_target_https_proxy.ecoalert_https_proxy.id
  port_range            = "443"
  ip_address            = google_compute_global_address.ecoalert_ip.id
  load_balancing_scheme = "EXTERNAL_MANAGED"
  require_ssl           = true
}
```

##### GCP Deployment Script

```bash
#!/bin/bash
# gcp-deploy.sh

set -e

# Configuration
GCP_PROJECT="ecoalert-project"
GCP_REGION="us-central1"
IMAGE_TAG=$(git rev-parse --short HEAD)
ARTIFACT_REGISTRY="us-central1-docker.pkg.dev/${GCP_PROJECT}/ecoalert-repo"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Configure Docker to use Artifact Registry
log "Configuring Docker for Artifact Registry..."
gcloud auth configure-docker ${GCP_REGION}-docker.pkg.dev

# Build and push Docker image
log "Building and pushing Docker image..."
docker build -t ${ARTIFACT_REGISTRY}/ecoalert:${IMAGE_TAG} .

docker push ${ARTIFACT_REGISTRY}/ecoalert:${IMAGE_TAG}

# Deploy to Cloud Run
log "Deploying to Cloud Run..."
gcloud run deploy ecoalert \
    --image ${ARTIFACT_REGISTRY}/ecoalert:${IMAGE_TAG} \
    --platform managed \
    --region ${GCP_REGION} \
    --allow-unauthenticated \
    --set-env-vars="NODE_ENV=production" \
    --set-env-vars="NEXTAUTH_URL=https://api.ecoalert.com" \
    --set-env-vars="DATABASE_URL=postgres://postgres:${DB_PASSWORD}@${DB_HOST}:5432/ecoalert_prod?sslmode=require" \
    --set-env-vars="REDIS_URL=redis://${REDIS_HOST}:6379" \
    --memory 2Gi \
    --cpu 1000m \
    --max-instances 100

# Update load balancer
log "Updating load balancer..."
gcloud compute url-maps update ecoalert-url-map \
    --default-service ecoalert-backend

log "Deployment completed successfully!"
```

## Environment Configuration

### Production Environment Variables

Create a comprehensive `.env.production` file:

```env
# Application Configuration
NODE_ENV=production
TURBOPACK=true
PORT=3000

# Database Configuration
DATABASE_URL=postgresql://postgres:${DB_PASSWORD}@${DB_HOST}:5432/ecoalert_prod?sslmode=require
DATABASE_HOST=your-db-host
DATABASE_PORT=5432
DATABASE_NAME=ecoalert_prod
DATABASE_USER=postgres
DATABASE_PASSWORD=${DB_PASSWORD}

# Redis Configuration
REDIS_URL=redis://${REDIS_HOST}:${REDIS_PORT}
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=${REDIS_PASSWORD}

# Authentication
NEXTAUTH_URL=https://api.ecoalert.com
NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
JWT_SECRET=${JWT_SECRET}

# API Keys
OPENWEATHER_API_KEY=${OPENWEATHER_API_KEY}
WAQI_API_KEY=${WAQI_API_KEY}
GOOGLE_MAPS_API_KEY=${GOOGLE_MAPS_API_KEY}
STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
STRIPE_PUBLISHABLE_KEY=${STRIPE_PUBLISHABLE_KEY}

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=${SMTP_USER}
SMTP_PASS=${SMTP_PASSWORD}
FROM_EMAIL=noreply@ecoalert.com

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf

# Monitoring and Logging
SENTRY_DSN=${SENTRY_DSN}
LOG_LEVEL=info
ENABLE_REQUEST_LOGGING=true

# Performance Optimization
CACHE_TTL=3600
ENABLE_CACHING=true
CDN_URL=https://cdn.ecoalert.com

# Security
ENABLE_RATE_LIMITING=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
ENABLE_SECURITY_HEADERS=true

# Third-party Integrations
TWILIO_ACCOUNT_SID=${TWILIO_ACCOUNT_SID}
TWILIO_AUTH_TOKEN=${TWILIO_AUTH_TOKEN}
TWILIO_PHONE_NUMBER=${TWILIO_PHONE_NUMBER}
SLACK_WEBHOOK_URL=${SLACK_WEBHOOK_URL}
DISCORD_WEBHOOK_URL=${DISCORD_WEBHOOK_URL}

# Analytics
GOOGLE_ANALYTICS_ID=${GOOGLE_ANALYTICS_ID}
MIXPANEL_TOKEN=${MIXPANEL_TOKEN}

# Development/Testing (should be empty in production)
DEBUG=false
MOCK_SERVICES=false
TEST_MODE=false
```

### Database Configuration

#### PostgreSQL Configuration

```sql
-- postgres.conf
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 4MB
min_wal_size = 1GB
max_wal_size = 4GB
checkpoint_timeout = 30min
```

#### TimescaleDB Configuration

```sql
-- Create TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Create hypertables for sensor data
SELECT create_hypertable('sensor_readings', 'timestamp');

-- Create indexes for performance
CREATE INDEX CONCURRENTLY idx_sensor_readings_sensor_id ON sensor_readings(sensor_id);
CREATE INDEX CONCURRENTLY idx_sensor_readings_timestamp ON sensor_readings(timestamp);
CREATE INDEX CONCURRENTLY idx_sensor_readings_location ON sensor_readings(location);

-- Create compression policy for old data
SELECT add_compression_policy('sensor_readings', 'time_bucket(\'1 day\', timestamp)');

-- Create retention policy
SELECT add_retention_policy('sensor_readings', INTERVAL '30 days');

-- Create continuous aggregate for pre-aggregated data
CREATE MATERIALIZED VIEW sensor_readings_daily
WITH (timescaledb.continuous) AS
  SELECT
    time_bucket('1 day', timestamp) AS day,
    sensor_id,
    avg(pm25) as avg_pm25,
    max(pm25) as max_pm25,
    min(pm25) as min_pm25,
    avg(pm10) as avg_pm10,
    max(pm10) as max_pm10,
    min(pm10) as min_pm10,
    avg(o3) as avg_o3,
    max(o3) as max_o3,
    min(o3) as min_o3,
    avg(no2) as avg_no2,
    max(no2) as max_no2,
    min(no2) as min_no2
  FROM sensor_readings
  GROUP BY time_bucket('1 day', timestamp), sensor_id;

-- Create continuous aggregate materialization policy
SELECT add_continuous_aggregate_policy('sensor_readings_daily',
  start => now() - INTERVAL '7 days',
  end => now(),
  schedule => INTERVAL '1 hour'
);
```

### SSL/TLS Configuration

#### Let's Encrypt Certificate Management

```bash
#!/bin/bash
# ssl-setup.sh

set -e

DOMAIN="api.ecoalert.com"
EMAIL="admin@ecoalert.com"

# Install Certbot
sudo apt-get update
sudo apt-get install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot certonly --nginx \
  --email ${EMAIL} \
  --agree-tos \
  --no-eff-email \
  -d ${DOMAIN}

# Create renewal hook
cat > /etc/letsencrypt/renewal-hooks/post/ecoalert-reload << 'EOF'
#!/bin/bash
# Reload nginx after certificate renewal
systemctl reload nginx
EOF

chmod +x /etc/letsencrypt/renewal-hooks/post/ecoalert-reload

# Test renewal
sudo certbot renew --dry-run

# Set up auto-renewal in crontab
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet --post-hook 'systemctl reload nginx'") | crontab -
```

#### NGINX SSL Configuration

```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    # Basic settings
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # MIME types
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;

    # Upstream servers
    upstream ecoalert_app {
        server 127.0.0.1:3000;
        # Add more servers for load balancing
        # server 127.0.0.1:3001;
        # server 127.0.0.1:3002;
    }

    # HTTP server - redirect to HTTPS
    server {
        listen 80;
        server_name api.ecoalert.com www.ecoalert.com;
        return 301 https://$server_name$request_uri;
    }

    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name api.ecoalert.com www.ecoalert.com;

        # SSL configuration
        ssl_certificate /etc/letsencrypt/live/api.ecoalert.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/api.ecoalert.com/privkey.pem;
        
        # SSL security settings
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384';
        ssl_prefer_server_ciphers off;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 1d;
        ssl_session_tickets off;
        
        # HSTS
        add_header Strict-Transport-Security "max-age=63072000" always;

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Referrer-Policy "strict-origin-when-cross-origin";

        # Rate limiting for API endpoints
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            
            proxy_pass http://ecoalert_app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            proxy_cache_bypass $http_upgrade;
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
