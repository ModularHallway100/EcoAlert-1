import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimit } from '@/lib/security';
import { InputValidator } from '@/lib/security';
import { ApiKeyValidator } from '@/lib/security';
import { securityMiddleware } from '@/lib/security';

// Apply rate limiting to all API routes
export function applyRateLimit(req: NextRequest, maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) {
  const rateLimitResponse = rateLimit({
    windowMs,
    max: maxRequests,
    message: 'Too many API requests. Please try again later.',
  })(req);
  
  if (rateLimitResponse) {
    return rateLimitResponse;
  }
  
  return null;
}

// Apply API key validation to protected routes
export function requireApiKey(req: NextRequest) {
  const apiKey = req.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Missing API key' },
      { status: 401 }
    );
  }
  
  if (!ApiKeyValidator.isValidApiKey(apiKey)) {
    return NextResponse.json(
      { error: 'Invalid API key' },
      { status: 401 }
    );
  }
  
  return null;
}

// Apply input validation to API requests
interface ValidationRule {
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object';
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  validator?: (value: any) => true | string;
}

export function validateRequestData(req: NextRequest, data: any, validationRules: Record<string, ValidationRule>) {
  const errors: string[] = [];
  
  for (const [field, rules] of Object.entries(validationRules)) {
    const value = data[field];
    
    // Check if required field is missing
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field} is required`);
      continue;
    }
    
    // Skip validation if field is not required and not provided
    if (!rules.required && (value === undefined || value === null)) {
      continue;
    }
    
    // Type validation
    if (rules.type && typeof value !== rules.type) {
      errors.push(`${field} must be of type ${rules.type}`);
      continue;
    }
    
    // Length validation
    if (rules.minLength !== undefined && (typeof value === 'string' || Array.isArray(value)) && value.length < rules.minLength) {
      errors.push(`${field} must be at least ${rules.minLength} characters/elements long`);
    }
    
    if (rules.maxLength !== undefined && (typeof value === 'string' || Array.isArray(value)) && value.length > rules.maxLength) {
      errors.push(`${field} must be at most ${rules.maxLength} characters/elements long`);
    }
    
    // Range validation for numbers
    if (rules.type === 'number' && (rules.min !== undefined || rules.max !== undefined)) {
      if (rules.min !== undefined && value < rules.min) {
        errors.push(`${field} must be at least ${rules.min}`);
      }
      if (rules.max !== undefined && value > rules.max) {
        errors.push(`${field} must be at most ${rules.max}`);
      }
    }
    
    // Custom validation
    if (rules.validator && typeof rules.validator === 'function') {
      const validationResult = rules.validator(value);
      if (validationResult !== true) {
        errors.push(`${field}: ${validationResult}`);
      }
    }
  }
  
  if (errors.length > 0) {
    return NextResponse.json(
      { error: 'Validation failed', details: errors },
      { status: 400 }
    );
  }
  
  return null;
}

// Apply security checks to all API requests
export function secureApiRoute(req: NextRequest) {
  // Apply general security middleware
  const securityResponse = securityMiddleware(req);
  if (securityResponse) {
    return securityResponse;
  }
  
  // Apply CORS headers
  const corsResponse = handleCors(req);
  if (corsResponse) {
    return corsResponse;
  }
  
  return null;
}

// Handle CORS preflight requests
function handleCors(req: NextRequest) {
  if (req.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 200 });
    response.headers.set('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS || '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    return response;
  }
  
  return null;
}

// Apply security headers to API responses
export function applySecurityHeaders(response: NextResponse) {
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https:; font-src 'self' data:;");
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  return response;
}

// Main middleware for API routes
export async function apiMiddleware(req: NextRequest) {
  // Apply security checks
  const securityResponse = secureApiRoute(req);
  if (securityResponse) {
    return securityResponse;
  }
  
  // Apply rate limiting
  const rateLimitResponse = applyRateLimit(req);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }
  
  // Continue to the route handler
  return null;
}