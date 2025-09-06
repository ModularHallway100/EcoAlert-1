/**
 * Security utilities and middleware for EcoAlert API
 */

import { NextRequest } from 'next/server';

// Rate limiting configuration
interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  max: number; // Maximum requests per window
  message?: string;
}

// Simple in-memory rate limiter
class RateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> = new Map();

  checkRateLimit(key: string, config: RateLimitConfig): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const record = this.requests.get(key);

    // If record doesn't exist or has expired, create a new one
    if (!record || now > record.resetTime) {
      this.requests.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
      });
      return { allowed: true, remaining: config.max - 1, resetTime: record?.resetTime || now + config.windowMs };
    }

    // If under limit, increment count
    if (record.count < config.max) {
      record.count++;
      this.requests.set(key, record);
      return { allowed: true, remaining: config.max - record.count, resetTime: record.resetTime };
    }

    // Over limit
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }

  // Clean up expired records periodically
  cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.requests.entries()) {
      if (now > record.resetTime) {
        this.requests.delete(key);
      }
    }
  }
}

// Create rate limiter instance
const rateLimiter = new RateLimiter();

// Rate limiting middleware factory
export function rateLimit(config: RateLimitConfig) {
  return (req: NextRequest): Response | null => {
    // Extract IP address from request
    const forwardedFor = req.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown';
    const key = `rate_limit:${ip}:${req.nextUrl.pathname}`;
    
    const { allowed, remaining, resetTime } = rateLimiter.checkRateLimit(key, config);
    
    if (!allowed) {
      return new Response(
        JSON.stringify({
          error: 'Too Many Requests',
          message: config.message || 'Rate limit exceeded. Please try again later.',
          remaining,
          resetTime,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': config.max.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': resetTime.toString(),
            'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString(),
          },
        }
      );
    }
    
    return null; // Continue to next handler
  };
}

// Input validation utilities
export class InputValidator {
  // Validate email format
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate password strength
  static isStrongPassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Validate numeric range
  static isInRange(value: number, min: number, max: number): boolean {
    return value >= min && value <= max;
  }

  // Validate string length
  static hasValidLength(value: string, min: number, max: number): boolean {
    return value.length >= min && value.length <= max;
  }

  // Sanitize input to prevent XSS
  static sanitizeInput(input: string): string {
    return input
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"')
      .replace(/'/g, '&#039;');
  }

  // Validate sensor data format
  static isValidSensorData(data: any): boolean {
    if (!data || typeof data !== 'object') return false;
    
    // Check required fields
    const requiredFields = ['aqi', 'pm25', 'pm10', 'co2', 'temperature', 'humidity'];
    for (const field of requiredFields) {
      if (typeof data[field] !== 'number') return false;
    }
    
    // Check reasonable ranges
    if (!this.isInRange(data.aqi, 0, 500)) return false;
    if (!this.isInRange(data.pm25, 0, 500)) return false;
    if (!this.isInRange(data.pm10, 0, 1000)) return false;
    if (!this.isInRange(data.co2, 0, 10000)) return false;
    if (!this.isInRange(data.temperature, -50, 60)) return false;
    if (!this.isInRange(data.humidity, 0, 100)) return false;
    
    return true;
  }

  // Validate alert data format
  static isValidAlertData(data: any): boolean {
    if (!data || typeof data !== 'object') return false;
    
    // Check required fields
    const requiredFields = ['type', 'severity', 'title', 'message'];
    for (const field of requiredFields) {
      if (!data[field] || typeof data[field] !== 'string') return false;
    }
    
    // Check allowed types
    const allowedTypes = ['air', 'water', 'noise', 'general'];
    if (!allowedTypes.includes(data.type)) return false;
    
    // Check allowed severities
    const allowedSeverities = ['low', 'moderate', 'high', 'critical'];
    if (!allowedSeverities.includes(data.severity)) return false;
    
    // Check title and message lengths
    if (!this.hasValidLength(data.title, 5, 100)) return false;
    if (!this.hasValidLength(data.message, 10, 500)) return false;
    
    return true;
  }
}

// CORS configuration
export const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
};

// Security headers
export const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https:; font-src 'self' data:;",
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

// JWT token utilities
export class TokenUtils {
  // Generate a secure random token
  static generateToken(length: number = 32): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Hash a password using PBKDF2
  static async hashPassword(password: string, salt: string = this.generateToken(16)): Promise<{ hash: string; salt: string }> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + salt);
    
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return { hash: hashHex, salt };
  }

  // Verify a password against a hash
  static async verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
    const { hash: computedHash } = await this.hashPassword(password, salt);
    return computedHash === hash;
  }
}

// API key validation
export class ApiKeyValidator {
  private static validApiKeys: Set<string> = new Set();

  // Add a valid API key (in production, this would come from a database)
  static addApiKey(key: string): void {
    this.validApiKeys.add(key);
  }

  // Validate an API key
  static isValidApiKey(key: string): boolean {
    return this.validApiKeys.has(key);
  }

  // Remove an API key
  static removeApiKey(key: string): void {
    this.validApiKeys.delete(key);
  }

  // Generate a new API key
  static generateApiKey(): string {
    const key = `eco_api_${this.generateToken(32)}`;
    this.addApiKey(key);
    return key;
  }

  private static generateToken(length: number = 32): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
}

// Initialize with some sample API keys (in production, these would come from environment variables)
ApiKeyValidator.addApiKey(process.env.API_KEY_1 || 'sample_key_1');
ApiKeyValidator.addApiKey(process.env.API_KEY_2 || 'sample_key_2');

// Security middleware
export function securityMiddleware(req: NextRequest): Response | null {
  // Check security headers
  const userAgent = req.headers.get('user-agent') || '';
  
  // Block known bot user agents
  const botUserAgents = [
    'bot', 'crawler', 'spider', 'scraper', 'curl', 'wget', 'python-requests',
    'java', 'php', 'perl', 'ruby', 'go-http', 'axios', 'postman'
  ];
  
  if (botUserAgents.some(bot => userAgent.toLowerCase().includes(bot))) {
    return new Response('Bot access denied', { status: 403 });
  }
  
  // Check for suspicious patterns in URL
  const suspiciousPatterns = [
    '/admin', '/wp-admin', '/phpmyadmin', '/.env', '/config',
    '/etc/passwd', '/proc/self/environ', '/server-status'
  ];
  
  if (suspiciousPatterns.some(pattern => req.nextUrl.pathname.includes(pattern))) {
    return new Response('Access denied', { status: 403 });
  }
  
  return null; // Continue to next handler
}

// Clean up rate limiter periodically (call this from a cron job or interval)
export function initializeRateLimiterCleanup(): void {
  // Clean up every 5 minutes
  setInterval(() => {
    rateLimiter.cleanup();
  }, 5 * 60 * 1000);
}