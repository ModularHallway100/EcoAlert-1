import type { Coordinates } from './types';

// Supported third-party integrations
export type IntegrationType = 
  | 'waqi' // World Air Quality Index
  | 'openweathermap' // Weather data
  | 'here' // Maps and routing
  | 'google' // Maps and services
  | 'mapbox' // Maps and geocoding
  | 'twilio' // SMS and voice notifications
  | 'sendgrid' // Email notifications
  | 'slack' // Team notifications
  | 'discord' // Community notifications
  | 'notion' // Data logging and documentation
  | 'airtable' // Database integration
  | 'stripe' // Payment processing
  | 'paypal' // Payment processing
  | 'tesla' // Electric vehicle data
  | 'nest' // Smart home data
  | 'ring' // Security camera data
  | 'philips_hue' // Smart lighting
  | 'samsung_smartthings' // Smart home automation
  | 'amazon_alexa' // Voice assistant
  | 'google_home' // Voice assistant;

// Integration configuration interface
export interface IntegrationConfig {
  id: string;
  name: string;
  type: IntegrationType;
  status: 'active' | 'inactive' | 'error';
  apiKeys: {
    [key: string]: string;
  };
  settings: {
    [key: string]: any;
  };
  lastSync?: Date;
  rateLimit?: {
    requests: number;
    window: number; // in seconds
  };
  webhooks?: {
    [key: string]: string;
  };
}

// Integration response types
export interface IntegrationResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  rateLimit?: {
    remaining: number;
    reset: Date;
  };
}

// Webhook payload types
export interface WebhookPayload {
  integrationId: string;
  eventType: string;
  data: any;
  timestamp: Date;
  signature: string;
}

// Weather data from OpenWeatherMap
export interface WeatherData {
  location: Coordinates;
  city: string;
  country: string;
  temperature: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  visibility: number;
  uvIndex: number;
  condition: string;
  icon: string;
  timestamp: string;
  forecast?: Array<{
    date: Date;
    temperature: number;
    condition: string;
    icon: string;
  }>;
}

// Notification payload
export interface NotificationPayload {
  to: string | string[];
  message: string;
  title?: string;
  type: 'alert' | 'info' | 'warning' | 'error';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  data?: {
    [key: string]: any;
  };
}

// Integration service interface
export interface IntegrationService {
  initialize(config: IntegrationConfig): Promise<IntegrationResponse>;
  authenticate(apiKeys: { [key: string]: string }): Promise<IntegrationResponse>;
  sync(data?: any): Promise<IntegrationResponse>;
  validate(): Promise<IntegrationResponse>;
  test(): Promise<IntegrationResponse>;
  updateSettings(settings: { [key: string]: any }): Promise<IntegrationResponse>;
  disconnect(): Promise<IntegrationResponse>;
}

// Import service registry
import { INTEGRATION_SERVICES as SERVICE_REGISTRY } from './services';

// Integration factory
export class IntegrationFactory {
  static create(type: IntegrationType, config: IntegrationConfig): IntegrationService {
    const ServiceClass = SERVICE_REGISTRY[type];
    if (!ServiceClass) {
      throw new Error(`Integration service not found for type: ${type}`);
    }
    return new ServiceClass(config);
  }
}

// Integration validator
export const validateIntegration = (config: Partial<IntegrationConfig>): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!config.name || config.name.trim() === '') {
    errors.push('Integration name is required');
  }
  
  if (!config.type) {
    errors.push('Integration type is required');
  }
  
  if (!config.apiKeys || Object.keys(config.apiKeys).length === 0) {
    errors.push('At least one API key is required');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

// Rate limiter helper
export class RateLimiter {
  private requests: number[] = [];
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  check(): { allowed: boolean; reset: Date; remaining: number } {
    const now = Date.now();
    
    // Remove old requests
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    
    const remaining = Math.max(0, this.maxRequests - this.requests.length);
    const allowed = remaining > 0;
    
    if (allowed) {
      this.requests.push(now);
    }
    
    return {
      allowed,
      reset: new Date(now + this.windowMs),
      remaining
    };
  }
}

// Webhook signature verification
export const verifyWebhookSignature = (
  payload: any,
  signature: string,
  secret: string
): boolean => {
  try {
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return false;
  }
};

// Integration health check
export const checkIntegrationHealth = async (config: IntegrationConfig): Promise<{
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime?: number;
  error?: string;
}> => {
  try {
    const startTime = Date.now();
    const service = IntegrationFactory.create(config.type, config);
    const result = await service.test();
    const responseTime = Date.now() - startTime;
    
    if (result.success) {
      return {
        status: responseTime < 1000 ? 'healthy' : 'degraded',
        responseTime
      };
    } else {
      return {
        status: 'unhealthy',
        error: result.error
      };
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};