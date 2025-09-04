# EcoAlert - Environmental Monitoring Platform

## Overview

EcoAlert is a comprehensive environmental monitoring platform that provides real-time air quality data, weather information, predictive analytics, and community-driven environmental insights. Built with Next.js 15, TypeScript, and a modern microservices architecture, EcoAlert scales to serve millions of users worldwide.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Technology Stack](#technology-stack)
- [Core Features](#core-features)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Deployment Guide](#deployment-guide)
- [Development Guide](#development-guide)
- [Monitoring & Analytics](#monitoring--analytics)
- [Security Considerations](#security-considerations)
- [Performance Optimization](#performance-optimization)
- [Troubleshooting](#troubleshooting)

## Architecture Overview

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Client    │    │   Mobile Apps   │    │   Third-Party   │
│   (Next.js)     │    │   (React Native)│    │   Integrations  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   API Gateway   │
                    │   (Next.js API) │
                    └─────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Database      │    │   Cache Layer   │    │   Message       │
│   (PostgreSQL)  │    │   (Redis)       │    │   Queue         │
└─────────────────┘    └─────────────────┘    │   (RabbitMQ)    │
                                             └─────────────────┘
                                                         │
                                             ┌─────────────────┐
                                             │   External      │
                                             │   Services      │
                                             │ (IoT, Weather,  │
                                             │  Air Quality)   │
                                             └─────────────────┘
```

### Microservices Architecture

EcoAlert follows a microservices architecture with the following core services:

1. **API Gateway**: Handles all incoming requests, authentication, and routing
2. **User Service**: Manages user accounts, authentication, and profiles
3. **Sensor Service**: Processes IoT sensor data and real-time updates
4. **Analytics Service**: Performs predictive analytics and anomaly detection
5. **Notification Service**: Handles alerts and emergency notifications
6. **Integration Service**: Manages third-party integrations
7. **Cache Service**: Provides caching for performance optimization
8. **Database Service**: Manages data persistence and queries

## Technology Stack

### Frontend
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Leaflet**: Interactive maps
- **Chart.js**: Data visualization
- **Socket.IO**: Real-time communication

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **TypeScript**: Type-safe JavaScript
- **Prisma**: Database ORM
- **Redis**: In-memory data store
- **RabbitMQ**: Message broker
- **Socket.IO**: Real-time communication

### Database
- **PostgreSQL**: Primary relational database
- **TimescaleDB**: Time-series data storage
- **Redis**: Caching and session management
- **InfluxDB**: Time-series sensor data

### DevOps & Infrastructure
- **Docker**: Containerization
- **Kubernetes**: Container orchestration
- **NGINX**: Reverse proxy and load balancing
- **Let's Encrypt**: SSL certificates
- **Prometheus & Grafana**: Monitoring and visualization
- **ELK Stack**: Logging and analytics

## Core Features

### 1. Real-time Environmental Monitoring
- Live air quality data from IoT sensors
- Weather information and forecasts
- Pollution tracking and alerts
- Historical data analysis

### 2. Predictive Analytics
- AI-powered pollution forecasting
- Anomaly detection for sensor malfunctions
- Trend analysis and pattern recognition
- Custom alert thresholds

### 3. Community Features
- User-contributed data streams
- Environmental challenge system
- Leaderboards and achievements
- Discussion forums and knowledge sharing

### 4. Emergency Response
- Automated alert system
- Emergency contact management
- Evacuation route planning
- Crisis communication tools

### 5. Third-party Integrations
- Air quality APIs (WAQI, OpenWeatherMap)
- Smart home device integration
- Social media sharing
- Data export capabilities

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- Redis 6+
- Docker & Docker Compose (optional)

### Local Development Setup

1. **Clone the repository**
```bash
git clone https://github.com/your-org/ecoalert.git
cd ecoalert
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

4. **Configure database**
```bash
# Create database
createdb ecoalert_development

# Run migrations
npx prisma migrate dev

# Seed database
npx prisma db seed
```

5. **Start development server**
```bash
npm run dev
```

6. **Open browser**
Navigate to `http://localhost:3000`

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/ecoalert_development"
DATABASE_URL_TEST="postgresql://username:password@localhost:5432/ecoalert_test"

# Redis
REDIS_URL="redis://localhost:6379"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# API Keys
OPENWEATHER_API_KEY="your-openweather-api-key"
WAQI_API_KEY="your-waqi-api-key"
GOOGLE_MAPS_API_KEY="your-google-maps-api-key"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-email-password"

# File Upload
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=10485760

# Monitoring
SENTRY_DSN="your-sentry-dsn"

# Third-party Integrations
TWILIO_ACCOUNT_SID="your-twilio-account-sid"
TWILIO_AUTH_TOKEN="your-twilio-auth-token"
```

## API Documentation

### Authentication

All API endpoints require authentication using Bearer tokens:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     https://api.ecoalert.com/v1/users/profile
```

### Core Endpoints

#### Users API
```http
GET    /api/users/profile
PUT    /api/users/profile
GET    /api/users/{id}
DELETE /api/users/{id}
```

#### Sensors API
```http
GET    /api/sensors
POST   /api/sensors
GET    /api/sensors/{id}
PUT    /api/sensors/{id}
DELETE /api/sensors/{id}
POST   /api/sensors/{id}/data
```

#### Air Quality API
```http
GET    /api/air-quality/current
GET    /api/air-quality/history
GET    /api/air-quality/forecast
POST   /api/air-quality/alerts
```

#### Weather API
```http
GET    /api/weather/current
GET    /api/weather/forecast
GET    /api/weather/historical
```

#### Analytics API
```http
GET    /api/analytics/predictions
GET    /api/analytics/anomalies
GET    /api/analytics/trends
```

#### Integrations API
```http
GET    /api/integrations
POST   /api/integrations
GET    /api/integrations/{id}
POST   /api/integrations/{id}
PUT    /api/integrations/{id}
DELETE /api/integrations/{id}
```

### WebSocket Events

```javascript
// Connect to WebSocket
const socket = io('https://api.ecoalert.com');

// Subscribe to sensor updates
socket.emit('subscribe', { channel: 'sensors' });

// Listen for real-time updates
socket.on('sensor_update', (data) => {
  console.log('Sensor update:', data);
});

// Listen for alerts
socket.on('alert', (alert) => {
  console.log('Alert:', alert);
});
```

## Deployment Guide

### Production Environment Setup

#### 1. Infrastructure Requirements

- **Minimum**: 4 vCPUs, 8GB RAM, 100GB SSD
- **Recommended**: 8 vCPUs, 16GB RAM, 200GB SSD
- **Database**: PostgreSQL 14+ with TimescaleDB extension
- **Cache**: Redis 6+
- **Load Balancer**: NGINX or similar

#### 2. Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

#### 3. Kubernetes Deployment

```bash
# Apply manifests
kubectl apply -f k8s/

# Check pods
kubectl get pods

# Forward port for testing
kubectl port-forward svc/ecoalert 3000:80
```

#### 4. Manual Deployment

```bash
# Build the application
npm run build

# Set production environment
export NODE_ENV=production

# Start the application
npm start
```

### Environment Configuration

#### Production Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:pass@prod-db:5432/ecoalert_prod"

# Redis
REDIS_URL="redis://prod-redis:6379"

# Authentication
NEXTAUTH_URL="https://api.ecoalert.com"
NEXTAUTH_SECRET="production-secret-key"

# API Keys
OPENWEATHER_API_KEY="production-openweather-key"
WAQI_API_KEY="production-waqi-key"

# Email
SMTP_HOST="prod-smtp.example.com"
SMTP_PORT=587
SMTP_USER="noreply@ecoalert.com"
SMTP_PASS="production-email-password"

# Monitoring
SENTRY_DSN="production-sentry-dsn"
NEW_RELIC_LICENSE_KEY="new-relic-license"

# Performance
NODE_ENV=production
TURBOPACK=true
```

### SSL/TLS Configuration

#### Using Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d api.ecoalert.com -d www.ecoalert.com

# Auto-renewal
sudo crontab -e
```

Add to crontab:
```crontab
0 12 * * * /usr/bin/certbot renew --quiet
```

#### NGINX Configuration

```nginx
server {
    listen 80;
    server_name api.ecoalert.com www.ecoalert.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.ecoalert.com www.ecoalert.com;
    
    ssl_certificate /etc/letsencrypt/live/api.ecoalert.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.ecoalert.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Database Setup

#### PostgreSQL Configuration

```sql
-- Create TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Create hypertables for sensor data
SELECT create_hypertable('sensor_readings', 'timestamp');

-- Create indexes for performance
CREATE INDEX idx_sensor_readings_sensor_id ON sensor_readings(sensor_id);
CREATE INDEX idx_sensor_readings_timestamp ON sensor_readings(timestamp);
CREATE INDEX idx_sensor_readings_location ON sensor_readings(location);

-- Set up partitioning
CREATE TABLE sensor_readings_2024 PARTITION OF sensor_readings
    FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
```

#### Database Backup

```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump ecoalert_prod > /backups/ecoalert_$DATE.sql
gzip /backups/ecoalert_$DATE.sql

# Retain last 30 days
find /backups -name "ecoalert_*.sql.gz" -mtime +30 -delete
```

### Monitoring and Logging

#### Prometheus Configuration

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'ecoalert'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/metrics'
```

#### Grafana Dashboard

Import the provided EcoAlert dashboard JSON file for comprehensive monitoring.

#### Log Aggregation

```bash
# ELK Stack Configuration
docker-compose -f elk/docker-compose.yml up -d

# Filebeat configuration
filebeat.config:
  modules:
    path: ${path.config}/modules.d/*.yml
    reload.enabled: false

filebeat.inputs:
- type: log
  enabled: true
  paths:
    - /var/log/ecoalert/*.log
  fields:
    app: ecoalert
  fields_under_root: true

output.elasticsearch:
  hosts: ["elasticsearch:9200"]
```

## Development Guide

### Project Structure

```
ecoalert/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   ├── auth/              # Authentication pages
│   │   ├── dashboard/         # Dashboard pages
│   │   ├── integrations/      # Integration pages
│   │   └── layout.tsx         # Root layout
│   ├── components/            # React components
│   │   ├── ui/               # Base UI components
│   │   ├── charts/           # Chart components
│   │   ├── maps/             # Map components
│   │   └── forms/            # Form components
│   ├── lib/                  # Utility libraries
│   │   ├── api/              # API clients
│   │   ├── auth/             # Authentication helpers
│   │   ├── integrations/     # Integration services
│   │   ├── sensors/          # Sensor utilities
│   │   └── utils/            # General utilities
│   ├── types/                # TypeScript type definitions
│   └── hooks/                # Custom React hooks
├── prisma/                   # Database schema
├── public/                   # Static assets
├── docs/                     # Documentation
├── tests/                    # Test files
└── scripts/                  # Build and deployment scripts
```

### Development Workflow

#### 1. Code Style

```bash
# Install ESLint and Prettier
npm install --save-dev eslint prettier eslint-config-prettier

# Run linting
npm run lint

# Format code
npm run format

# Check types
npm run type-check
```

#### 2. Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run integration tests
npm run test:integration

# Run e2e tests
npm run test:e2e
```

#### 3. Database Management

```bash
# Generate Prisma client
npx prisma generate

# Create migration
npx prisma migrate dev --name add-new-feature

# Reset database (development only)
npx prisma migrate reset

# Studio for database management
npx prisma studio
```

#### 4. Building and Deployment

```bash
# Build application
npm run build

# Start production server
npm start

# Export static files (if needed)
npm run export
```

### Code Standards

#### TypeScript Guidelines

- Use strict TypeScript mode
- Define all types explicitly
- Avoid `any` type - use proper typing
- Use interfaces for object shapes
- Use enums for constants where appropriate

#### React Component Guidelines

- Use functional components with hooks
- Follow the component naming convention: `PascalCase`
- Use descriptive prop names
- Implement proper error boundaries
- Use TypeScript for props and state

#### API Guidelines

- Use RESTful design principles
- Implement proper error handling
- Use consistent response formats
- Add proper authentication and authorization
- Document all endpoints

### Debugging

#### Common Issues

1. **Database Connection Issues**
```bash
# Check database status
sudo systemctl status postgresql

# Check database logs
tail -f /var/log/postgresql/postgresql-14-main.log
```

2. **Memory Issues**
```bash
# Check memory usage
free -h

# Monitor Node.js memory
node --inspect app.js
```

3. **Performance Issues**
```bash
# Profile performance
npm run profile

# Check API response times
curl -w "@curl-format.txt" -o /dev/null -s "http://localhost:3000/api/sensors"
```

## Security Considerations

### Authentication & Authorization

#### JWT Implementation

```typescript
// Generate JWT
const token = jwt.sign(
  { userId: user.id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);

// Verify JWT
const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
```

#### Role-Based Access Control

```typescript
// Define roles
enum UserRole {
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  USER = 'user',
  GUEST = 'guest'
}

// Authorization middleware
const authorize = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Check user role and permissions
  };
};
```

### Data Protection

#### Encryption

```typescript
// Password hashing
import bcrypt from 'bcrypt';

const hashedPassword = await bcrypt.hash(password, 10);

// Compare passwords
const isMatch = await bcrypt.compare(password, hashedPassword);
```

#### API Security

```typescript
// Rate limiting
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || [],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
};
```

### Security Headers

```typescript
// Security middleware
const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
};
```

## Performance Optimization

### Caching Strategy

#### Redis Caching

```typescript
// Cache configuration
const cache = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD
});

// Cache middleware
const cacheResponse = (duration: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const key = req.originalUrl;
    const cached = await cache.get(key);
    
    if (cached) {
      return res.json(JSON.parse(cached));
    }
    
    res.originalJson = res.json;
    res.json = (body: any) => {
      cache.setex(key, duration, JSON.stringify(body));
      res.originalJson(body);
    };
    
    next();
  };
};
```

#### Database Optimization

```sql
-- Query optimization
EXPLAIN ANALYZE SELECT * FROM sensor_readings 
WHERE sensor_id = $1 AND timestamp > $2;

-- Index optimization
CREATE INDEX CONCURRENTLY idx_sensor_readings_sensor_timestamp 
ON sensor_readings(sensor_id, timestamp);

-- Query plan analysis
EXPLAIN ANALYZE SELECT COUNT(*) FROM sensor_readings 
WHERE location && ST_MakeEnvelope(-180, -90, 180, 90, 4326);
```

### Frontend Optimization

#### Code Splitting

```typescript
// Dynamic imports
const LazyComponent = React.lazy(() => import('./LazyComponent'));

// Route-based code splitting
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Analytics = React.lazy(() => import('./pages/Analytics'));
```

#### Image Optimization

```typescript
import Image from 'next/image';

// Optimized image component
<Image
  src="/api/images/sensor-reading.jpg"
  alt="Sensor reading"
  width={800}
  height={600}
  priority
/>
```

### Backend Optimization

#### Connection Pooling

```typescript
// Database connection pool
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

#### Request Optimization

```typescript
// Compression middleware
import compression from 'compression';

app.use(compression({
  level: 6,
  threshold: 1024
}));

// Response caching
app.use((req, res, next) => {
  const send = res.send;
  res.send = (body) => {
    res.setHeader('Cache-Control', 'public, max-age=3600');
    send.call(res, body);
  };
  next();
});
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Problems

**Symptoms:**
- Connection timeout errors
- Slow query performance
- Deadlocks

**Solutions:**
```bash
# Check database connections
SELECT count(*) FROM pg_stat_activity;

# Kill idle connections
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle';

# Optimize connection settings
ALTER SYSTEM SET max_connections = 200;
SELECT pg_reload_conf();
```

#### 2. Memory Issues

**Symptoms:**
- Out of memory errors
- Slow performance
- Process crashes

**Solutions:**
```bash
# Monitor memory usage
top -p $(pgrep node)

# Increase swap space
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Optimize Node.js memory
node --max-old-space-size=4096 app.js
```

#### 3. Performance Issues

**Symptoms:**
- Slow API responses
- High CPU usage
- Database bottlenecks

**Solutions:**
```bash
# Profile application
node --prof app.js

# Analyze database queries
EXPLAIN ANALYZE SELECT * FROM sensor_readings 
WHERE timestamp > NOW() - INTERVAL '1 hour';

# Optimize queries
CREATE INDEX CONCURRENTLY idx_sensor_readings_timestamp 
ON sensor_readings(timestamp);
```

### Log Analysis

#### Log Levels

```typescript
// Structured logging
import { createLogger, transports, format } from 'winston';

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'error.log', level: 'error' }),
    new transports.File({ filename: 'combined.log' })
  ]
});
```

#### Log Analysis Commands

```bash
# Analyze error logs
grep "ERROR" ecoalert.log | awk '{print $1}' | sort | uniq -c

# Monitor real-time logs
tail -f ecoalert.log | grep "ERROR"

# Log rotation
logrotate -f /etc/logrotate.d/ecoalert
```

### Health Checks

#### Application Health

```typescript
// Health check endpoint
app.get('/health', (req, res) => {
  const health = {
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  };
  res.json(health);
});
```

#### Database Health

```typescript
// Database health check
app.get('/health/database', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'healthy' });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', error: error.message });
  }
});
```

## Contributing

### Development Guidelines

1. **Fork the repository**
2. **Create a feature branch**
3. **Follow coding standards**
4. **Write tests**
5. **Submit a pull request**

### Pull Request Process

1. **Update documentation** for any changes
2. **Add tests** for new functionality
3. **Ensure all tests pass**
4. **Update CHANGELOG.md**
5. **Request code review**

### Code Review Checklist

- [ ] Code follows project standards
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] Security considerations addressed
- [ ] Performance impact assessed
- [ ] Error handling implemented

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- **Documentation**: [docs.ecoalert.com](https://docs.ecoalert.com)
- **Issues**: [GitHub Issues](https://github.com/your-org/ecoalert/issues)
- **Community**: [Discord Server](https://discord.gg/ecoalert)
- **Email**: support@ecoalert.com

## Changelog

### Version 1.0.0 (2024-01-15)
- Initial release
- Core environmental monitoring features
- Real-time sensor data collection
- Basic analytics and reporting
- Mobile web application

### Version 1.1.0 (2024-02-20)
- Enhanced analytics engine
- Predictive pollution forecasting
- User dashboard improvements
- Performance optimizations
- Enhanced security features

### Version 1.2.0 (2024-03-25)
- Third-party integrations
- Advanced notification system
- Community features
- API improvements
- Mobile app beta release

---

*This documentation is continuously updated. For the latest version, please visit the GitHub repository.*