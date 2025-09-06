# API Security Enhancements for EcoAlert

## Overview

This document outlines the security enhancements implemented for the EcoAlert API to protect against common web vulnerabilities and ensure secure data handling.

## Security Features Implemented

### 1. Rate Limiting

**Implementation**: `src/lib/security.ts` - `RateLimiter` class and `rateLimit` middleware

**Features**:
- In-memory rate limiting with configurable time windows and request limits
- IP-based identification using `x-forwarded-for` header
- Automatic cleanup of expired records
- Customizable error messages and retry headers

**Usage**:
```typescript
// Apply rate limiting with 100 requests per 15 minutes
const rateLimitResponse = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests
  message: 'Too many requests. Please try again later.'
})(request);

if (rateLimitResponse) {
  // Return 429 Too Many Requests response
}
```

### 2. Input Validation

**Implementation**: `src/lib/security.ts` - `InputValidator` class

**Features**:
- Email format validation
- Password strength validation
- Numeric range validation
- String length validation
- XSS protection through input sanitization
- Custom validation rules for sensor and alert data

**Usage**:
```typescript
// Validate sensor data
if (!InputValidator.isValidSensorData(sensorData)) {
  return NextResponse.json({ error: 'Invalid sensor data' }, { status: 400 });
}

// Validate alert data
if (!InputValidator.isValidAlertData(alertData)) {
  return NextResponse.json({ error: 'Invalid alert data' }, { status: 400 });
}
```

### 3. API Key Management

**Implementation**: `src/lib/security.ts` - `ApiKeyValidator` class

**Features**:
- Secure API key generation
- In-memory key validation (in production, use database)
- Dynamic key management (add/remove keys)
- Integration with request authentication

**Usage**:
```typescript
// Add API key
ApiKeyValidator.addApiKey('your-api-key-here');

// Validate API key
if (!ApiKeyValidator.isValidApiKey(apiKey)) {
  return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
}
```

### 4. Security Headers

**Implementation**: `src/lib/security.ts` - `securityHeaders` constant

**Headers Applied**:
- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-Content-Type-Options: nosniff` - Prevents MIME type sniffing
- `X-XSS-Protection: 1; mode=block` - Enables XSS protection
- `Referrer-Policy: strict-origin-when-cross-origin` - Controls referrer information
- `Content-Security-Policy` - Restricts resource loading
- `Permissions-Policy` - Controls browser permissions

### 5. CORS Configuration

**Implementation**: `src/lib/security.ts` - `corsOptions` constant

**Features**:
- Configurable allowed origins
- Credential support
- Custom allowed headers and methods
- Automatic handling of preflight OPTIONS requests

### 6. Security Middleware

**Implementation**: `src/middleware-api.ts`

**Features**:
- Unified security middleware for all API routes
- Rate limiting integration
- API key validation
- Input validation
- Security header application
- Bot detection and blocking
- Suspicious pattern detection

**Usage**:
```typescript
// Apply security middleware to all API routes
const securityResponse = await apiMiddleware(request);
if (securityResponse) {
  return securityResponse;
}
```

### 7. Token Utilities

**Implementation**: `src/lib/security.ts` - `TokenUtils` class

**Features**:
- Secure random token generation
- Password hashing using SHA-256
- Password verification
- Salt-based security

**Usage**:
```typescript
// Generate and hash password
const { hash, salt } = await TokenUtils.hashPassword('user-password');

// Verify password
const isValid = await TokenUtils.verifyPassword('input-password', hash, salt);
```

## API Route Security Implementation

### Example: Environment API (`/api/environment`)

The environment API demonstrates comprehensive security implementation:

1. **Security Middleware**: Applied at the beginning of the request handler
2. **Input Validation**: Validates latitude and longitude parameters
3. **Rate Limiting**: Limits API requests to prevent abuse
4. **Security Headers**: Applied to all responses

```typescript
export async function GET(request: Request) {
  // Apply API security middleware
  const securityResponse = await apiMiddleware(request as any);
  if (securityResponse) {
    return securityResponse;
  }
  
  try {
    // Validate input parameters
    const validationResponse = validateRequestData(request as any, { lat, lon }, validationRules);
    if (validationResponse) {
      return validationResponse;
    }
    
    // Process request...
    
    // Apply security headers to response
    return applySecurityHeaders(response);
  } catch (error) {
    // Handle errors securely
  }
}
```

## Security Best Practices Implemented

### 1. Defense in Depth
- Multiple layers of security (rate limiting, validation, headers)
- Both client-side and server-side validation
- Comprehensive error handling

### 2. Least Privilege
- API key-based access control
- Minimal required permissions for each route
- Input validation on all data

### 3. Secure by Default
- All security features enabled by default
- Conservative security headers
- Strict CORS policies

### 4. Monitoring and Logging
- Security violations logged
- Rate limiting violations tracked
- Suspicious patterns detected

## Deployment Considerations

### Production Environment
1. Replace in-memory rate limiter with Redis for distributed rate limiting
2. Store API keys in a secure database with proper encryption
3. Implement proper secret management for API keys and tokens
4. Add comprehensive logging and monitoring for security events

### Testing
1. Perform security testing including penetration testing
2. Test rate limiting under load
3. Validate input sanitization effectiveness
4. Test CORS configuration

### Maintenance
1. Regularly review and update security headers
2. Monitor security advisories for dependencies
3. Keep security libraries up to date
4. Regularly review and update API key policies

## Security Headers Reference

| Header | Purpose | Value |
|--------|---------|-------|
| X-Frame-Options | Prevents clickjacking | `DENY` |
| X-Content-Type-Options | Prevents MIME type sniffing | `nosniff` |
| X-XSS-Protection | Enables XSS protection | `1; mode=block` |
| Referrer-Policy | Controls referrer information | `strict-origin-when-cross-origin` |
| Content-Security-Policy | Restricts resource loading | See implementation |
| Permissions-Policy | Controls browser permissions | `camera=(), microphone=(), geolocation=()` |

## Rate Limiting Configuration

| Endpoint | Window | Max Requests | Purpose |
|----------|--------|--------------|---------|
| All API endpoints | 15 minutes | 100 | General API protection |
| Authentication endpoints | 15 minutes | 5 | Prevent brute force attacks |
| Data submission endpoints | 15 minutes | 50 | Prevent spam |

## Conclusion

These security enhancements provide comprehensive protection for the EcoAlert API while maintaining usability and performance. The implementation follows industry best practices and addresses common security vulnerabilities.

Regular security reviews and updates are recommended to maintain security as new threats emerge.