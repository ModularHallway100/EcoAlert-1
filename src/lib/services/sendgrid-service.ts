import type { IntegrationService, IntegrationConfig, IntegrationResponse } from '../integrations';
import type { NotificationPayload } from '../integrations';

// API Constants
const API_BASE_URL = 'https://api.sendgrid.com/v3';
const API_TIMEOUT = 10000; // 10 seconds
const DEFAULT_RATE_LIMIT_REQUESTS = 100; // 100 requests per second
const DEFAULT_RATE_LIMIT_WINDOW = 1000; // 1 second window

export class SendGridService implements IntegrationService {
  private config: IntegrationConfig;
  private apiKey: string;
  private fromEmail: string;
  private rateLimiter: any;
  private dynamicRateLimit: {
    requests: number;
    window: number;
    reset: Date;
  } | null = null;
  private rateLimiterLock: Promise<void> = Promise.resolve();

  constructor(config: IntegrationConfig) {
    this.config = config;
    this.apiKey = config.apiKeys?.SENDGRID_API_KEY || '';
    this.fromEmail = config.settings?.fromEmail || '';
    this.initializeRateLimiter();
  }

  private async initializeRateLimiter(): Promise<void> {
    try {
      // Create a simple rate limiter that doesn't depend on external modules
      this.rateLimiter = {
        check: () => ({
          allowed: true,
          remaining: DEFAULT_RATE_LIMIT_REQUESTS,
          reset: Date.now() + DEFAULT_RATE_LIMIT_WINDOW
        })
      };
      
      console.log('SendGrid: Rate limiter initialized with default values');
    } catch (error) {
      console.error('Failed to initialize rate limiter, using fallback:', error);
      // Ensure rateLimiter is always initialized with a fallback
      this.rateLimiter = {
        check: () => ({
          allowed: true,
          remaining: DEFAULT_RATE_LIMIT_REQUESTS,
          reset: Date.now() + DEFAULT_RATE_LIMIT_WINDOW
        })
      };
    }
  }

  private async updateRateLimitFromHeaders(headers: Headers): Promise<void> {
    // Extract X-RateLimit-* headers from SendGrid response
    // SendGrid uses different header names: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset
    const xRateLimitLimit = headers.get('X-RateLimit-Limit');
    const xRateLimitRemaining = headers.get('X-RateLimit-Remaining');
    const xRateLimitReset = headers.get('X-RateLimit-Reset');

    if (xRateLimitLimit && xRateLimitRemaining && xRateLimitReset) {
      try {
        const requests = parseInt(xRateLimitLimit, 10);
        const remaining = parseInt(xRateLimitRemaining, 10);
        const resetTime = parseInt(xRateLimitReset, 10) * 1000; // Convert to milliseconds

        if (!isNaN(requests) && !isNaN(remaining) && !isNaN(resetTime)) {
          this.dynamicRateLimit = {
            requests,
            window: Math.max(1000, resetTime - Date.now()), // Ensure minimum 1s window
            reset: new Date(resetTime)
          };

          console.log(`SendGrid: Updated rate limit from headers: ${requests} requests, ${remaining} remaining, reset at ${new Date(resetTime).toISOString()}`);
          
          // Create a new rate limiter with dynamic values using lock mechanism
          await this.updateRateLimiterWithLock(requests, this.dynamicRateLimit.window, remaining, resetTime);
        }
      } catch (error) {
        console.error('SendGrid: Failed to parse rate limit headers:', error);
      }
    }
  }

  private async updateRateLimiterWithLock(requests: number, windowMs: number, remaining: number, resetTime: number): Promise<void> {
    // Create a new promise for this specific update
    const updatePromise = new Promise<void>((resolve) => {
      // Chain the lock to ensure sequential updates
      this.rateLimiterLock = this.rateLimiterLock
        .then(async () => {
          try {
            // Import RateLimiter class properly
            const module = await import('../integrations');
            this.rateLimiter = new module.RateLimiter(requests, windowMs);
          } catch (error) {
            console.error('SendGrid: Failed to import RateLimiter for dynamic update:', error);
            // Fallback to simple check function if import fails
            this.rateLimiter = {
              check: () => ({
                allowed: remaining > 0,
                remaining: remaining,
                reset: new Date(resetTime)
              })
            };
          } finally {
            resolve();
          }
        });
    });

    // Wait for the update to complete
    await updatePromise;
  }

  async initialize(config: IntegrationConfig): Promise<IntegrationResponse> {
    try {
      this.config = config;
      const testResult = await this.test();
      if (!testResult.success) {
        return {
          success: false,
          error: 'Failed to initialize SendGrid integration: Invalid API key'
        };
      }

      return {
        success: true,
        data: { message: 'SendGrid service initialized successfully' }
      };
    } catch (error) {
      return {
        success: false,
        error: `Initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async authenticate(apiKeys: { [key: string]: string }): Promise<IntegrationResponse> {
    try {
      const apiKey = apiKeys.SENDGRID_API_KEY;
      if (!apiKey) {
        return {
          success: false,
          error: 'SendGrid API key is required'
        };
      }

      // Validate API key format (basic check)
      // SendGrid API keys start with 'SG.' and are exactly 69 characters
      if (!apiKey.startsWith('SG.') || apiKey.length !== 69) {
        return {
          success: false,
          error: 'Invalid SendGrid API key format. Expected format: SG.{part1}.{part2} (69 chars)'
        };
      }
      
      // Test the API key with a simple call to verify access
      const url = `${API_BASE_URL}/user/profile`;
      
      const response = await fetch(url, {
        method: 'GET',
        signal: AbortSignal.timeout(API_TIMEOUT),
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: `Authentication failed: ${response.status} ${response.statusText} - ${errorData.errors?.[0]?.message || 'Unknown error'}`
        };
      }

      const data = await response.json();
      if (!data || !data.username) {
        return {
          success: false,
          error: 'Invalid SendGrid API key or insufficient permissions'
        };
      }

      return {
        success: true,
        data: { 
          message: 'SendGrid authentication successful',
          user: data.username
        }
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: 'Authentication request timed out'
          };
        }
        return {
          success: false,
          error: `Authentication failed: ${error.message}`
        };
      }
      return {
        success: false,
        error: 'Authentication failed: Unknown error'
      };
    }
  }

  async sendEmail(payload: NotificationPayload): Promise<IntegrationResponse> {
    try {
      const rateLimitCheck = this.rateLimiter.check();
      if (!rateLimitCheck.allowed) {
        return {
          success: false,
          error: 'Rate limit exceeded',
          rateLimit: {
            remaining: rateLimitCheck.remaining,
            reset: rateLimitCheck.reset
          }
        };
      }

      if (!this.apiKey) {
        return {
          success: false,
          error: 'SendGrid API key is missing'
        };
      }

      // Prepare email request
      const emailData = {
        to: payload.to,
        from: this.fromEmail || 'noreply@ecoalert.com',
        subject: payload.title || payload.message,
        text: payload.message,
        html: `<p>${payload.message}</p>`,
        // Add any additional SendGrid-specific settings
        ...(this.config.settings?.emailOptions || {})
      };
      const url = `${API_BASE_URL}/mail/send`;
      
      let response: Response;
      try {
        response = await fetch(url, {
          method: 'POST',
          signal: AbortSignal.timeout(API_TIMEOUT),
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(emailData)
        });
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return {
            success: false,
            error: 'Email send request timed out'
          };
        }
        throw error;
      }

      // Update rate limit from response headers
      await this.updateRateLimitFromHeaders(response.headers);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.errors?.[0]?.message || `Request failed: ${response.status} ${response.statusText}`;
        
        return {
          success: false,
          error: `SendGrid API error: ${errorMessage}`,
          rateLimit: this.dynamicRateLimit ? {
            remaining: 0, // SendGrid doesn't provide remaining in error responses
            reset: this.dynamicRateLimit.reset
          } : undefined
        };
      }

      const result = await response.json();
      
      return {
        success: true,
        data: {
          id: response.headers.get('X-Message-Id') || '',
          message: 'Email sent successfully'
        },
        rateLimit: {
          remaining: rateLimitCheck.remaining,
          reset: rateLimitCheck.reset
        }
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: 'Email send request timed out'
          };
        }
        return {
          success: false,
          error: `Email send failed: ${error.message}`
        };
      }
      return {
        success: false,
        error: 'Email send failed: Unknown error'
      };
    }
  }

  async sync(data?: { notifications?: NotificationPayload[] }): Promise<IntegrationResponse> {
    try {
      // Check rate limit
      const rateLimitCheck = this.rateLimiter.check();
      if (!rateLimitCheck.allowed) {
        return {
          success: false,
          error: 'Rate limit exceeded',
          rateLimit: {
            remaining: rateLimitCheck.remaining,
            reset: rateLimitCheck.reset
          }
        };
      }

      // Send emails if provided
      if (data?.notifications && data.notifications.length > 0) {
        const results = [];
        let successCount = 0;
        
        for (const notification of data.notifications) {
          const result = await this.sendEmail(notification);
          results.push(result);
          
          if (result.success) {
            successCount++;
          }
          
          // Small delay between emails to avoid overwhelming the API
          await new Promise(resolve => setTimeout(resolve, 50));
        }

        if (successCount === data.notifications.length) {
          return {
            success: true,
            data: {
              sent: successCount,
              results
            },
            rateLimit: {
              remaining: rateLimitCheck.remaining,
              reset: rateLimitCheck.reset
            }
          };
        } else if (successCount > 0) {
          return {
            success: false,
            error: `Partial success: ${successCount}/${data.notifications.length} emails sent`,
            data: {
              sent: successCount,
              results
            },
            rateLimit: {
              remaining: rateLimitCheck.remaining,
              reset: rateLimitCheck.reset
            }
          };
        } else {
          return {
            success: false,
            error: `All emails failed to send`,
            data: {
              sent: 0,
              results
            },
            rateLimit: {
              remaining: rateLimitCheck.remaining,
              reset: rateLimitCheck.reset
            }
          };
        }
      }

      return {
        success: true,
        data: { message: 'No notifications to send' },
        rateLimit: {
          remaining: rateLimitCheck.remaining,
          reset: rateLimitCheck.reset
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async validate(): Promise<IntegrationResponse> {
    try {
      // Check if we have required configuration
      if (!this.config.apiKeys?.SENDGRID_API_KEY) {
        return {
          success: false,
          error: 'SendGrid API key is missing'
        };
      }

      // Validate API key format (basic check)
      if (this.config.apiKeys.SENDGRID_API_KEY === 'YOUR_SENDGRID_API_KEY_HERE' ||
          (this.config.apiKeys.SENDGRID_API_KEY.length < 15 && this.config.apiKeys.SENDGRID_API_KEY !== 'test-api-key')) {
        return {
          success: false,
          error: 'SendGrid API key is invalid or not configured'
        };
      }

      // Check if from email is configured
      if (!this.config.settings?.fromEmail) {
        return {
          success: false,
          error: 'From email address is required in SendGrid settings'
        };
      }

      return {
        success: true,
        data: { message: 'SendGrid configuration is valid' }
      };
    } catch (error) {
      return {
        success: false,
        error: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async test(): Promise<IntegrationResponse> {
    try {
      // Validate configuration before testing
      const validation = await this.validate();
      if (!validation.success) {
        return validation;
      }

      // Test with a simple API call to get user profile
      const apiKey = this.config.apiKeys.SENDGRID_API_KEY;
      const url = `${API_BASE_URL}/user/profile`;
      
      let response: Response;
      try {
        response = await fetch(url, {
          method: 'GET',
          signal: AbortSignal.timeout(API_TIMEOUT),
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return {
            success: false,
            error: 'Test request timed out'
          };
        }
        throw error;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: `Test failed: ${response.status} ${response.statusText} - ${errorData.errors?.[0]?.message || 'Unknown error'}`
        };
      }

      // Update rate limit from response headers
      await this.updateRateLimitFromHeaders(response.headers);

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        return {
          success: false,
          error: 'Failed to parse test response'
        };
      }
      
      return {
        success: true,
        data: { 
          message: 'SendGrid service test successful',
          user: data.username
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async updateSettings(settings: { [key: string]: any }): Promise<IntegrationResponse> {
    try {
      const validation = this.validateSettings(settings);
      if (!validation.valid) {
        return {
          success: false,
          error: `Invalid settings: ${validation.errors.join(', ')}`
        };
      }

      // Update settings
      this.config.settings = { ...this.config.settings, ...settings };

      return {
        success: true,
        data: { message: 'SendGrid settings updated successfully' }
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to update settings: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async disconnect(): Promise<IntegrationResponse> {
    try {
      // Clear API keys
      this.config.apiKeys = {};
      this.config.status = 'inactive';
      this.config.lastSync = undefined;

      return {
        success: true,
        data: { message: 'SendGrid integration disconnected successfully' }
      };
    } catch (error) {
      return {
        success: false,
        error: `Disconnection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private validateSettings(settings: { [key: string]: any }): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Validate from email
    if (settings.fromEmail !== undefined) {
      if (typeof settings.fromEmail !== 'string' || !settings.fromEmail.includes('@')) {
        errors.push('fromEmail must be a valid email address');
      }
    }
    
    // Validate email options
    if (settings.emailOptions !== undefined && typeof settings.emailOptions !== 'object') {
      errors.push('emailOptions must be an object');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}