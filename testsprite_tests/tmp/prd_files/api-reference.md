# EcoAlert API Reference

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Rate Limiting](#rate-limiting)
- [Error Handling](#error-handling)
- [Data Types](#data-types)
- [Endpoints](#endpoints)
  - [Users](#users)
  - [Authentication](#authentication-1)
  - [Sensors](#sensors)
  - [Air Quality](#air-quality)
  - [Weather](#weather)
  - [Analytics](#analytics)
  - [Integrations](#integrations)
  - [Social](#social)
  - [Educational Content](#educational-content)
  - [Notifications](#notifications)
- [WebSockets](#websockets)
- [Webhooks](#webhooks)
- [SDKs](#sdks)
- [Postman Collection](#postman-collection)
- [Examples](#examples)

## Overview

The EcoAlert API provides comprehensive access to environmental monitoring data, analytics, and platform features. This reference covers all available endpoints, data structures, and usage examples.

### Base URL

```
Production: https://api.ecoalert.com
Staging:    https://staging.api.ecoalert.com
Development: http://localhost:3000
```

### API Versioning

The API uses versioning in the URL path format:

```
/v1/{endpoint}
```

### Content-Type

All requests should include the appropriate `Content-Type` header:

```
Content-Type: application/json
```

### Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "data": {},
  "metadata": {
    "timestamp": "2024-01-15T12:00:00Z",
    "request_id": "req_1234567890",
    "version": "1.0.0"
  },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "has_next": true
  }
}
```

## Authentication

### API Keys

All API requests require authentication using an API key:

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     https://api.ecoalert.com/v1/sensors
```

### JWT Tokens

For user-specific endpoints, use JWT tokens:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     https://api.ecoalert.com/v1/user/profile
```

### OAuth 2.0

The API supports OAuth 2.0 for third-party applications:

```javascript
const authCode = 'YOUR_AUTH_CODE';
const response = await fetch('https://api.ecoalert.com/v1/oauth/token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    grant_type: 'authorization_code',
    code: authCode,
    redirect_uri: 'https://your-app.com/callback',
    client_id: 'YOUR_CLIENT_ID',
    client_secret: 'YOUR_CLIENT_SECRET'
  })
});
```

## Rate Limiting

The API implements rate limiting to ensure fair usage:

- **Requests per minute**: 60 requests per minute
- **Requests per hour**: 1000 requests per hour
- **Requests per day**: 10,000 requests per day

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 58
X-RateLimit-Reset: 1642300800
```

### Rate Limit Response

When rate limited, the API returns:

```http
HTTP 429 Too Many Requests

{
  "success": false,
  "error": "Rate limit exceeded",
  "retry_after": 60
}
```

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "issue": "must be a valid email address"
    }
  },
  "metadata": {
    "timestamp": "2024-01-15T12:00:00Z",
    "request_id": "req_1234567890"
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMITED` | 429 | Rate limit exceeded |
| `INTERNAL_ERROR` | 500 | Internal server error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |

## Data Types

### Coordinates

```typescript
interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
}
```

### Location

```typescript
interface Location {
  id: string;
  name: string;
  coordinates: Coordinates;
  type: 'point' | 'area';
  address?: string;
  city?: string;
  country?: string;
  timezone?: string;
}
```

### Sensor Reading

```typescript
interface SensorReading {
  id: string;
  sensor_id: string;
  timestamp: Date;
  location: Coordinates;
  parameters: {
    pm25: number;
    pm10: number;
    o3: number;
    no2: number;
    so2: number;
    co: number;
    temperature?: number;
    humidity?: number;
    pressure?: number;
  };
  quality_score: number;
  metadata?: Record<string, any>;
}
```

### Air Quality Index

```typescript
interface AirQualityIndex {
  overall: number;
  level: 'Good' | 'Moderate' | 'Unhealthy for Sensitive Groups' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';
  components: {
    pm25: {
      value: number;
      level: 'Good' | 'Moderate' | 'Unhealthy for Sensitive Groups' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';
    };
    pm10: {
      value: number;
      level: 'Good' | 'Moderate' | 'Unhealthy for Sensitive Groups' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';
    };
    o3: {
      value: number;
      level: 'Good' | 'Moderate' | 'Unhealthy for Sensitive Groups' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';
    };
    no2: {
      value: number;
      level: 'Good' | 'Moderate' | 'Unhealthy for Sensitive Groups' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';
    };
    so2: {
      value: number;
      level: 'Good' | 'Moderate' | 'Unhealthy for Sensitive Groups' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';
    };
    co: {
      value: number;
      level: 'Good' | 'Moderate' | 'Unhealthy for Sensitive Groups' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';
    };
  };
}
```

## Endpoints

### Users

#### Get User Profile

```http
GET /v1/users/profile
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_1234567890",
    "email": "user@example.com",
    "name": "John Doe",
    "preferences": {
      "theme": "dark",
      "language": "en",
      "notifications": {
        "email": true,
        "push": true,
        "sms": false
      }
    },
    "subscription": {
      "plan": "premium",
      "status": "active",
      "expires_at": "2024-12-31T23:59:59Z"
    },
    "created_at": "2023-01-15T12:00:00Z",
    "updated_at": "2024-01-15T12:00:00Z"
  }
}
```

#### Update User Profile

```http
PUT /v1/users/profile
Content-Type: application/json

{
  "name": "John Doe",
  "preferences": {
    "theme": "light",
    "language": "en",
    "notifications": {
      "email": true,
      "push": false,
      "sms": true
    }
  }
}
```

### Authentication

#### Register User

```http
POST /v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe"
}
```

#### Login User

```http
POST /v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

#### Refresh Token

```http
POST /v1/auth/refresh
Content-Type: application/json

{
  "refresh_token": "your_refresh_token"
}
```

### Sensors

#### List Sensors

```http
GET /v1/sensors?page=1&limit=20&location=37.7749,-122.4194&radius=10000
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "sensor_1234567890",
      "name": "Downtown Air Monitor",
      "location": {
        "latitude": 37.7749,
        "longitude": -122.4194
      },
      "type": "air_quality",
      "status": "active",
      "last_reading": "2024-01-15T12:00:00Z",
      "parameters": ["pm25", "pm10", "o3", "no2", "so2", "co"],
      "owner": {
        "id": "user_1234567890",
        "name": "John Doe"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "has_next": true
  }
}
```

#### Get Sensor Details

```http
GET /v1/sensors/{sensor_id}
```

#### Get Sensor Readings

```http
GET /v1/sensors/{sensor_id}/readings?start=2024-01-01T00:00:00Z&end=2024-01-15T23:59:59Z&interval=1h
```

#### Create Sensor

```http
POST /v1/sensors
Content-Type: application/json

{
  "name": "New Air Monitor",
  "location": {
    "latitude": 37.7749,
    "longitude": -122.4194
  },
  "type": "air_quality",
  "parameters": ["pm25", "pm10", "o3"]
}
```

### Air Quality

#### Get Current Air Quality

```http
GET /v1/air-quality/current?location=37.7749,-122.4194
```

**Response:**
```json
{
  "success": true,
  "data": {
    "location": {
      "latitude": 37.7749,
      "longitude": -122.4194
    },
    "timestamp": "2024-01-15T12:00:00Z",
    "aqi": {
      "overall": 45,
      "level": "Good",
      "components": {
        "pm25": {
          "value": 12.5,
          "level": "Good"
        },
        "pm10": {
          "value": 20.3,
          "level": "Moderate"
        },
        "o3": {
          "value": 35.2,
          "level": "Good"
        }
      }
    },
    "health_recommendations": [
      "Air quality is satisfactory, and air pollution poses little or no risk."
    ],
    "nearby_sensors": [
      {
        "id": "sensor_1234567890",
        "distance": 500,
        "aqi": 42
      }
    ]
  }
}
```

#### Get Air Quality History

```http
GET /v1/air-quality/history?location=37.7749,-122.4194&start=2024-01-01T00:00:00Z&end=2024-01-15T23:59:59Z&interval=1d
```

#### Get Air Quality Forecast

```http
GET /v1/air-quality/forecast?location=37.7749,-122.4194&days=7
```

#### Create Air Quality Alert

```http
POST /v1/air-quality/alerts
Content-Type: application/json

{
  "name": "High PM2.5 Alert",
  "conditions": {
    "parameter": "pm25",
    "operator": ">",
    "threshold": 35
  },
  "location": {
    "latitude": 37.7749,
    "longitude": -122.4194,
    "radius": 5000
  },
  "notifications": {
    "email": true,
    "push": true,
    "sms": false
  }
}
```

### Weather

#### Get Current Weather

```http
GET /v1/weather/current?location=37.7749,-122.4194
```

**Response:**
```json
{
  "success": true,
  "data": {
    "location": {
      "latitude": 37.7749,
      "longitude": -122.4194
    },
    "timestamp": "2024-01-15T12:00:00Z",
    "temperature": 15.2,
    "feels_like": 14.8,
    "humidity": 65,
    "pressure": 1013.2,
    "wind_speed": 3.5,
    "wind_direction": 180,
    "visibility": 10,
    "uv_index": 2,
    "condition": "partly_cloudy",
    "icon": "02d",
    "sunrise": "2024-01-15T07:00:00Z",
    "sunset": "2024-01-15T17:30:00Z"
  }
}
```

#### Get Weather Forecast

```http
GET /v1/weather/forecast?location=37.7749,-122.4194&days=7
```

#### Get Weather History

```http
GET /v1/weather/history?location=37.7749,-122.4194&start=2024-01-01T00:00:00Z&end=2024-01-15T23:59:59Z
```

### Analytics

#### Get Predictions

```http
GET /v1/analytics/predictions?location=37.7749,-122.4194&parameter=pm25&hours=24
```

**Response:**
```json
{
  "success": true,
  "data": {
    "location": {
      "latitude": 37.7749,
      "longitude": -122.4194
    },
    "parameter": "pm25",
    "predictions": [
      {
        "timestamp": "2024-01-15T13:00:00Z",
        "value": 15.2,
        "confidence": 0.85
      },
      {
        "timestamp": "2024-01-15T14:00:00Z",
        "value": 16.8,
        "confidence": 0.82
      }
    ],
    "model_info": {
      "name": "LSTM_AirQuality",
      "version": "1.2.3",
      "trained_at": "2024-01-10T00:00:00Z"
    }
  }
}
```

#### Get Anomalies

```http
GET /v1/analytics/anomalies?location=37.7749,-122.4194&start=2024-01-01T00:00:00Z&end=2024-01-15T23:59:59Z
```

#### Get Trends

```http
GET /v1/analytics/trends?location=37.7749,-122.4194&parameter=pm25&period=30d
```

#### Generate Report

```http
POST /v1/analytics/reports
Content-Type: application/json

{
  "type": "air_quality_summary",
  "location": {
    "latitude": 37.7749,
    "longitude": -122.4194
  },
  "period": {
    "start": "2024-01-01T00:00:00Z",
    "end": "2024-01-15T23:59:59Z"
  },
  "format": "pdf"
}
```

### Integrations

#### List Integrations

```http
GET /v1/integrations
```

#### Create Integration

```http
POST /v1/integrations
Content-Type: application/json

{
  "name": "WAQI Integration",
  "type": "waqi",
  "api_keys": {
    "WAQI_API_TOKEN": "your_api_token"
  },
  "settings": {
    "default_location": {
      "latitude": 37.7749,
      "longitude": -122.4194
    },
    "refresh_interval": 3600
  }
}
```

#### Get Integration Details

```http
GET /v1/integrations/{integration_id}
```

#### Update Integration

```http
PUT /v1/integrations/{integration_id}
Content-Type: application/json

{
  "name": "Updated WAQI Integration",
  "settings": {
    "refresh_interval": 1800
  }
}
```

#### Delete Integration

```http
DELETE /v1/integrations/{integration_id}
```

#### Perform Integration Action

```http
POST /v1/integrations/{integration_id}
Content-Type: application/json

{
  "action": "sync",
  "data": {
    "location": {
      "latitude": 37.7749,
      "longitude": -122.4194
    }
  }
}
```

### Social

#### Create Post

```http
POST /v1/social/posts
Content-Type: application/json

{
  "content": "Just checked the air quality in my area. Great day for outdoor activities!",
  "location": {
    "latitude": 37.7749,
    "longitude": -122.4194
  },
  "media": [
    {
      "type": "image",
      "url": "https://example.com/image.jpg"
    }
  ]
}
```

#### Get Posts

```http
GET /v1/social/posts?location=37.7749,-122.4194&radius=5000&limit=20
```

#### Like Post

```http
POST /v1/social/posts/{post_id}/like
```

#### Comment on Post

```http
POST /v1/social/posts/{post_id}/comments
Content-Type: application/json

{
  "content": "Great post! The air quality has been really good here too."
}
```

### Educational Content

#### List Content

```http
GET /v1/educational/content?type=article&limit=20
```

#### Get Content Details

```http
GET /v1/educational/content/{content_id}
```

#### Interact with Content

```http
POST /v1/educational/content/{content_id}/interact
Content-Type: application/json

{
  "action": "bookmark",
  "rating": 5
}
```

### Notifications

#### Get Notifications

```http
GET /v1/notifications?limit=20&read=false
```

#### Mark as Read

```http
PUT /v1/notifications/{notification_id}/read
```

#### Create Notification Subscription

```http
POST /v1/notifications/subscriptions
Content-Type: application/json

{
  "type": "air_quality_alert",
  "conditions": {
    "parameter": "pm25",
    "operator": ">",
    "threshold": 35
  },
  "channels": ["email", "push"]
}
```

## WebSockets

### Connect to WebSocket

```javascript
const socket = new WebSocket('wss://api.ecoalert.com/v1/ws');

socket.onopen = () => {
  console.log('Connected to EcoAlert WebSocket');
  // Subscribe to sensor updates
  socket.send(JSON.stringify({
    type: 'subscribe',
    channel: 'sensor_updates',
    location: { latitude: 37.7749, longitude: -122.4194 }
  }));
};

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received update:', data);
};

socket.onclose = () => {
  console.log('Disconnected from EcoAlert WebSocket');
};
```

### Available Channels

| Channel | Description |
|---------|-------------|
| `sensor_updates` | Real-time sensor readings |
| `air_quality_alerts` | Air quality alerts |
| `weather_updates` | Weather updates |
| `system_notifications` | System notifications |

### Message Format

```json
{
  "type": "update",
  "channel": "sensor_updates",
  "data": {
    "sensor_id": "sensor_1234567890",
    "timestamp": "2024-01-15T12:00:00Z",
    "readings": {
      "pm25": 15.2,
      "pm10": 20.3,
      "o3": 35.2
    }
  }
}
```

## Webhooks

### Register Webhook

```http
POST /v1/webhooks
Content-Type: application/json

{
  "url": "https://your-app.com/webhooks/ecoalert",
  "events": ["sensor_reading", "air_quality_alert", "weather_update"],
  "secret": "your_webhook_secret"
}
```

### Webhook Payload

```json
{
  "event": "sensor_reading",
  "data": {
    "sensor_id": "sensor_1234567890",
    "timestamp": "2024-01-15T12:00:00Z",
    "location": {
      "latitude": 37.7749,
      "longitude": -122.4194
    },
    "readings": {
      "pm25": 15.2,
      "pm10": 20.3,
      "o3": 35.2
    }
  },
  "signature": "sha256=your_signature"
}
```

### Verify Webhook Signature

```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(JSON.stringify(payload)).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(`sha256=${digest}`)
  );
}
```

## SDKs

### JavaScript SDK

```javascript
import EcoAlert from 'ecoalert-sdk';

const client = new EcoAlert({
  apiKey: 'YOUR_API_KEY',
  baseURL: 'https://api.ecoalert.com'
});

// Get current air quality
const airQuality = await client.airQuality.getCurrent({
  latitude: 37.7749,
  longitude: -122.4194
});

// Get sensor readings
const readings = await client.sensors.getReadings('sensor_1234567890', {
  start: '2024-01-01T00:00:00Z',
  end: '2024-01-15T23:59:59Z'
});

// Create webhook
await client.webhooks.create({
  url: 'https://your-app.com/webhooks',
  events: ['sensor_reading']
});
```

### Python SDK

```python
from ecoalert import EcoAlertClient

client = EcoAlertClient(api_key='YOUR_API_KEY')

# Get current air quality
air_quality = client.air_quality.get_current(
    latitude=37.7749,
    longitude=-122.4194
)

# Get weather forecast
forecast = client.weather.get_forecast(
    latitude=37.7749,
    longitude=-122.4194,
    days=7
)

# Create integration
integration = client.integrations.create(
    name='WAQI Integration',
    type='waqi',
    api_keys={'WAQI_API_TOKEN': 'your_token'}
)
```

### Ruby SDK

```ruby
require 'ecoalert'

client = EcoAlert::Client.new(api_key: 'YOUR_API_KEY')

# Get sensor readings
readings = client.sensors.readings(
  'sensor_1234567890',
  start: '2024-01-01T00:00:00Z',
  end: '2024-01-15T23:59:59Z'
)

# Get analytics predictions
predictions = client.analytics.predictions(
  location: { latitude: 37.7749, longitude: -122.4194 },
  parameter: 'pm25',
  hours: 24
)
```

## Postman Collection

### Import Collection

You can import the complete Postman collection for the EcoAlert API:

1. Download the collection JSON file: [ecoalert-api-collection.json](ecoalert-api-collection.json)
2. Open Postman
3. Click "Import" → "Link" → paste the URL
4. Set the API base URL and authentication

### Environment Variables

Set up these environment variables in Postman:

| Variable | Value |
|----------|-------|
| `BASE_URL` | `https://api.ecoalert.com` |
| `API_KEY` | `your_api_key` |
| `JWT_TOKEN` | `your_jwt_token` |

## Examples

### Example 1: Monitor Air Quality in Real-time

```javascript
// Subscribe to sensor updates
const socket = new WebSocket('wss://api.ecoalert.com/v1/ws');

socket.onopen = () => {
  socket.send(JSON.stringify({
    type: 'subscribe',
    channel: 'sensor_updates',
    location: { latitude: 37.7749, longitude: -122.4194 }
  }));
};

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.event === 'sensor_reading') {
    const { sensor_id, readings, timestamp } = data.data;
    
    console.log(`New reading from ${sensor_id} at ${timestamp}:`);
    console.log(`PM2.5: ${readings.pm25} µg/m³`);
    console.log(`PM10: ${readings.pm10} µg/m³`);
    console.log(`O3: ${readings.o3} ppb`);
    
    // Check for unhealthy levels
    if (readings.pm25 > 35) {
      console.warn('⚠️ High PM2.5 levels detected!');
    }
  }
};
```

### Example 2: Generate Air Quality Report

```javascript
// Generate a comprehensive air quality report
async function generateAirQualityReport(location, startDate, endDate) {
  try {
    // Get historical data
    const historyResponse = await fetch(
      `${BASE_URL}/v1/air-quality/history?location=${location.latitude},${location.longitude}&start=${startDate}&end=${endDate}`
    );
    const historyData = await historyResponse.json();
    
    // Get predictions
    const predictionResponse = await fetch(
      `${BASE_URL}/v1/analytics/predictions?location=${location.latitude},${location.longitude}&parameter=pm25&hours=24`
    );
    const predictionData = await predictionResponse.json();
    
    // Generate report
    const report = {
      location: location,
      period: { start: startDate, end: endDate },
      summary: {
        average_pm25: calculateAverage(historyData.data.pm25),
        max_pm25: Math.max(...historyData.data.pm25),
        min_pm25: Math.min(...historyData.data.pm25),
        unhealthy_days: countUnhealthyDays(historyData.data.pm25)
      },
      predictions: predictionData.data.predictions,
      recommendations: generateRecommendations(historyData.data)
    };
    
    return report;
  } catch (error) {
    console.error('Error generating report:', error);
    throw error;
  }
}

function calculateAverage(values) {
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

function countUnhealthyDays(values) {
  return values.filter(val => val > 35).length;
}

function generateRecommendations(data) {
  const recommendations = [];
  
  if (data.some(d => d.pm25 > 50)) {
    recommendations.push('Consider reducing outdoor activities when PM2.5 levels are high');
  }
  
  if (data.some(d => d.o3 > 70)) {
    recommendations.push('Ozone levels were high during the reporting period');
  }
  
  return recommendations;
}
```

### Example 3: Create Custom Alert System

```javascript
class EcoAlertSystem {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.alerts = new Map();
    this.webhookUrl = 'https://your-app.com/alerts';
  }

  // Create alert subscription
  createAlert(subscription) {
    const alertId = `alert_${Date.now()}`;
    this.alerts.set(alertId, {
      id: alertId,
      ...subscription,
      last_triggered: null,
      trigger_count: 0
    });
    
    return alertId;
  }

  // Check and trigger alerts
  async checkConditions(location) {
    const airQuality = await this.fetchAirQuality(location);
    
    for (const [alertId, alert] of this.alerts) {
      if (this.shouldTrigger(alert, airQuality)) {
        await this.triggerAlert(alertId, alert, airQuality);
      }
    }
  }

  async fetchAirQuality(location) {
    const response = await fetch(
      `https://api.ecoalert.com/v1/air-quality/current?location=${location.latitude},${location.longitude}`,
      {
        headers: { 'Authorization': `Bearer ${this.apiKey}` }
      }
    );
    return response.json();
  }

  shouldTrigger(alert, airQuality) {
    const { condition, parameter, operator, threshold, cooldown } = alert;
    const value = airQuality.data.aqi.components[parameter].value;
    
    const meetsCondition = this.evaluateCondition(value, operator, threshold);
    const inCooldown = this.isInCooldown(alert, cooldown);
    
    return meetsCondition && !inCooldown;
  }

  evaluateCondition(value, operator, threshold) {
    switch (operator) {
      case '>': return value > threshold;
      case '>=': return value >= threshold;
      case '<': return value < threshold;
      case '<=': return value <= threshold;
      case '==': return value === threshold;
      default: return false;
    }
  }

  isInCooldown(alert, cooldownMinutes) {
    if (!cooldownMinutes) return false;
    
    const lastTriggered = alert.last_triggered;
    if (!lastTriggered) return false;
    
    const cooldownMs = cooldownMinutes * 60 * 1000;
    const timeSinceLastTrigger = Date.now() - new Date(lastTriggered);
    
    return timeSinceLastTrigger < cooldownMs;
  }

  async triggerAlert(alertId, alert, airQuality) {
    alert.last_triggered = new Date().toISOString();
    alert.trigger_count++;
    this.alerts.set(alertId, alert);
    
    const payload = {
      alert_id: alertId,
      type: 'air_quality_alert',
      severity: this.calculateSeverity(alert, airQuality),
      message: this.generateAlertMessage(alert, airQuality),
      data: airQuality.data,
      timestamp: new Date().toISOString()
    };
    
    await this.sendWebhook(payload);
  }

  calculateSeverity(alert, airQuality) {
    const value = airQuality.data.aqi.components[alert.parameter].value;
    const threshold = alert.threshold;
    
    if (value > threshold * 2) return 'critical';
    if (value > threshold * 1.5) return 'high';
    if (value > threshold * 1.2) return 'medium';
    return 'low';
  }

  generateAlertMessage(alert, airQuality) {
    const value = airQuality.data.aqi.components[alert.parameter].value;
    const threshold = alert.threshold;
    const level = airQuality.data.aqi.level;
    
    return `${alert.parameter} is ${value} (threshold: ${threshold}). Air quality level: ${level}`;
  }

  async sendWebhook(payload) {
    await fetch(this.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  }
}

// Usage
const alertSystem = new EcoAlertSystem('your_api_key');

// Create an alert
const alertId = alertSystem.createAlert({
  condition: 'air_quality',
  parameter: 'pm25',
  operator: '>',
  threshold: 35,
  cooldown: 60, // minutes
  channels: ['email', 'push']
});

// Check conditions every 5 minutes
setInterval(() => {
  alertSystem.checkConditions({
    latitude: 37.7749,
    longitude: -122.4194
  });
}, 5 * 60 * 1000);
```

### Example 4: Data Analysis with Python

```python
import pandas as pd
import requests
from datetime import datetime, timedelta

class EcoAlertAnalyzer:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = 'https://api.ecoalert.com/v1'
        
    def get_sensor_data(self, sensor_id, start_date, end_date):
        """Get sensor readings for a specific date range"""
        url = f"{self.base_url}/sensors/{sensor_id}/readings"
        params = {
            'start': start_date.isoformat() + 'Z',
            'end': end_date.isoformat() + 'Z',
            'interval': '1h'
        }
        
        headers = {'Authorization': f'Bearer {self.api_key}'}
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        
        return response.json()['data']
    
    def analyze_air_quality_trends(self, location, days=30):
        """Analyze air quality trends for a location"""
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # Get historical data
        url = f"{self.base_url}/air-quality/history"
        params = {
            'location': f'{location["lat"]},{location["lon"]}',
            'start': start_date.isoformat() + 'Z',
            'end': end_date.isoformat() + 'Z',
            'interval': '1d'
        }
        
        headers = {'Authorization': f'Bearer {self.api_key}'}
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        
        data = response.json()['data']
        
        # Convert to DataFrame
        df = pd.DataFrame(data)
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        df.set_index('timestamp', inplace=True)
        
        # Calculate statistics
        stats = {
            'mean_pm25': df['pm25'].mean(),
            'median_pm25': df['pm25'].median(),
            'std_pm25': df['pm25'].std(),
            'max_pm25': df['pm25'].max(),
            'min_pm25': df['pm25'].min(),
            'unhealthy_days': (df['pm25'] > 35).sum(),
            'hazardous_days': (df['pm25'] > 150).sum()
        }
        
        # Calculate trend
        df['rolling_mean'] = df['pm25'].rolling(window=7).mean()
        trend = df['rolling_mean'].iloc[-1] - df['rolling_mean'].iloc[0]
        
        stats['trend'] = 'increasing' if trend > 0 else 'decreasing'
        stats['trend_value'] = trend
        
        return stats
    
    def generate_report(self, location, period='30d'):
        """Generate comprehensive air quality report"""
        end_date = datetime.utcnow()
        
        if period == '30d':
            start_date = end_date - timedelta(days=30)
        elif period == '7d':
            start_date = end_date - timedelta(days=7)
        else:
            start_date = end_date - timedelta(days=1)
        
        # Get various data sources
        air_quality_history = self.get_air_quality_history(location, start_date, end_date)
        weather_data = self.get_weather_data(location, start_date, end_date)
        predictions = self.get_predictions(location, hours=24)
        
        # Analyze data
        analysis = {
            'period': {
                'start': start_date.isoformat(),
                'end': end_date.isoformat(),
                'duration_days': (end_date - start_date).days
            },
            'location': location,
            'air_quality': self.analyze_air_quality_trends(location, (end_date - start_date).days),
            'weather_summary': self.summarize_weather(weather_data),
            'predictions': predictions,
            'recommendations': self.generate_recommendations(air_quality_history)
        }
        
        return analysis
    
    def get_air_quality_history(self, location, start_date, end_date):
        """Get air quality historical data"""
        url = f"{self.base_url}/air-quality/history"
        params = {
            'location': f'{location["lat"]},{location["lon"]}',
            'start': start_date.isoformat() + 'Z',
            'end': end_date.isoformat() + 'Z',
            'interval': '1h'
        }
        
        headers = {'Authorization': f'Bearer {self.api_key}'}
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        
        return response.json()['data']
    
    def get_weather_data(self, location, start_date, end_date):
        """Get weather historical data"""
        url = f"{self.base_url}/weather/history"
        params = {
            'location': f'{location["lat"]},{location["lon"]}',
            'start': start_date.isoformat() + 'Z',
            'end': end_date.isoformat() + 'Z'
        }
        
        headers = {'Authorization': f'Bearer {self.api_key}'}
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        
        return response.json()['data']
    
    def get_predictions(self, location, hours=24):
        """Get air quality predictions"""
        url = f"{self.base_url}/analytics/predictions"
        params = {
            'location': f'{location["lat"]},{location["lon"]}',
            'parameter': 'pm25',
            'hours': hours
        }
        
        headers = {'Authorization': f'Bearer {self.api_key}'}
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        
        return response.json()['data']
    
    def summarize_weather(self, weather_data):
        """Summarize weather data"""
        if not weather_data:
            return {}
        
        df = pd.DataFrame(weather_data)
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        df.set_index('timestamp', inplace=True)
        
        return {
            'avg_temperature': df['temperature'].mean(),
            'avg_humidity': df['humidity'].mean(),
            'avg_pressure': df['pressure'].mean(),
            'avg_wind_speed': df['wind_speed'].mean(),
            'dominant_condition': df['condition'].mode().iloc[0] if not df['condition'].empty else None
        }
    
    def generate_recommendations(self, air_quality_data):
        """Generate recommendations based on air quality data"""
        if not air_quality_data:
            return []
        
        df = pd.DataFrame(air_quality_data)
        recommendations = []
        
        # Check for high pollution periods
        if (df['pm25'] > 35).any():
            high_pollution_days = (df['pm25'] > 35).sum()
            recommendations.append(f"High PM2.5 levels detected on {high_pollution_days} days")
        
        # Check for trends
        if len(df) > 7:
            recent = df.tail(7)['pm25'].mean()
            earlier = df.head(7)['pm25'].mean()
            
            if recent > earlier * 1.2:
                recommendations.append("PM2.5 levels are increasing - consider indoor activities")
            elif recent < earlier * 0.8:
                recommendations.append("Air quality is improving - good time for outdoor activities")
        
        # Check for extreme conditions
        if (df['pm25'] > 150).any():
            recommendations.append("Hazardous air quality conditions detected - avoid outdoor activities")
        
        return recommendations

# Usage
analyzer = EcoAlertAnalyzer('your_api_key')

location = {'lat': 37.7749, 'lon': -122.4194}
report = analyzer.generate_report(location, period='30d')

print("Air Quality Report:")
print(f"Period: {report['period']['start']} to {report['period']['end']}")
print(f"Average PM2.5: {report['air_quality']['mean_pm25']:.1f} µg/m³")
print(f"Unhealthy days: {report['air_quality']['unhealthy_days']}")
print(f"Trend: {report['air_quality']['trend']} ({report['air_quality']['trend_value']:+.1f})")
print("\nRecommendations:")
for rec in report['recommendations']:
    print(f"- {rec}")
```

This comprehensive API reference provides all the information needed to integrate with the EcoAlert platform, including detailed endpoint documentation, examples, and SDK usage.