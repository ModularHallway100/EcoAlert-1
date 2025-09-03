import type { IntegrationService, IntegrationConfig, IntegrationResponse, WeatherData } from '../integrations';
import type { Coordinates } from '../types';

export class WAQIService implements IntegrationService {
  private config: IntegrationConfig;
  private rateLimiter: any;

  constructor(config: IntegrationConfig) {
    this.config = config;
    this.rateLimiter = new (require('../integrations').RateLimiter)(
      60, // 60 requests per minute
      60 * 1000 // 60 seconds window
    );
  }

  async initialize(config: IntegrationConfig): Promise<IntegrationResponse> {
    try {
      this.config = config;
      
      // Test the API key
      const testResult = await this.test();
      if (!testResult.success) {
        return {
          success: false,
          error: 'Failed to initialize WAQI integration: Invalid API key'
        };
      }

      return {
        success: true,
        data: { message: 'WAQI integration initialized successfully' }
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
      const token = apiKeys.WAQI_API_TOKEN;
      if (!token || token === 'YOUR_WAQI_API_TOKEN_HERE') {
        return {
          success: false,
          error: 'WAQI API token is required'
        };
      }

      // Test the token with a simple API call
      const baseUrl = 'https://api.waqi.info/feed/geo:40.7128;-74.0060/';
      const urlParams = new URLSearchParams({
        format: 'json',
        token: token
      });
      const url = `${baseUrl}?${urlParams.toString()}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        return {
          success: false,
          error: `Authentication failed: ${response.status} ${response.statusText}`
        };
      }

      const data = await response.json();
      if (data.status !== 'ok') {
        return {
          success: false,
          error: `Authentication failed: ${data.data}`
        };
      }

      return {
        success: true,
        data: { message: 'WAQI authentication successful' }
      };
    } catch (error) {
      return {
        success: false,
        error: `Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async sync(data?: { location?: Coordinates }): Promise<IntegrationResponse> {
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

      const location = data?.location || {
        latitude: 40.7128,
        longitude: -74.0060
      };

      // Validate that the WAQI API token is configured
      if (!this.config.apiKeys?.WAQI_API_TOKEN) {
        return {
          success: false,
          error: 'WAQI API token not configured'
        };
      }

      const token = this.config.apiKeys.WAQI_API_TOKEN;
      const baseUrl = `https://api.waqi.info/feed/geo:${location.latitude};${location.longitude}/`;
      const urlParams = new URLSearchParams({
        format: 'json',
        token: token
      });
      const url = `${baseUrl}?${urlParams.toString()}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      let response: Response;
      try {
        response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          },
          signal: controller.signal
        });

        if (!response.ok) {
          return {
            success: false,
            error: `API request failed: ${response.status} ${response.statusText}`
          };
        }
      } finally {
        clearTimeout(timeout);
      }

      const result = await response.json();
      
      if (result.status !== 'ok') {
        return {
          success: false,
          error: `API returned error: ${result.data}`
        };
      }

      // Transform WAQI data to our format
      const transformedData = this.transformWAQIData(result.data);

      return {
        success: true,
        data: transformedData,
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
      if (!this.config.apiKeys.WAQI_API_TOKEN) {
        return {
          success: false,
          error: 'WAQI API token is missing'
        };
      }

      // Check if token is not placeholder
      if (this.config.apiKeys.WAQI_API_TOKEN === 'YOUR_WAQI_API_TOKEN_HERE') {
        return {
          success: false,
          error: 'WAQI API token is set to placeholder value'
        };
      }

      return {
        success: true,
        data: { message: 'WAQI configuration is valid' }
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
      // Use a simple test location
      const testLocation = { latitude: 40.7128, longitude: -74.0060 };
      const result = await this.sync({ location: testLocation });
      
      if (result.success) {
        return {
          success: true,
          data: { message: 'WAQI service test successful' }
        };
      } else {
        return result;
      }
    } catch (error) {
      return {
        success: false,
        error: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async updateSettings(settings: { [key: string]: any }): Promise<IntegrationResponse> {
    try {
      // Validate new settings
      const validation = this.validateSettings(settings);
      if (!validation.valid) {
        return {
          success: false,
          error: `Invalid settings: ${validation.errors.join(', ')}`
        };
      }

      // Update configuration
      this.config.settings = { ...this.config.settings, ...settings };

      return {
        success: true,
        data: { message: 'Settings updated successfully' }
      };
    } catch (error) {
      return {
        success: false,
        error: `Settings update failed: ${error instanceof Error ? error.message : 'Unknown error'}`
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
        data: { message: 'WAQI integration disconnected successfully' }
      };
    } catch (error) {
      return {
        success: false,
        error: `Disconnection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private transformWAQIData(waqiData: any): any {
    const data = waqiData?.data;

    if (!data || !data.city || !data.city.coord) {
      throw new Error('Invalid WAQI response structure');
    }

    return {
      location: {
        latitude: data.city.coord?.lat ?? 0,
        longitude: data.city.coord?.lon ?? 0,
        city: data.city?.name ?? 'Unknown',
        country: data.city?.country ?? 'Unknown'
      },
      aqi: data.aqi,
      dominantPollutant: data.dominentpol || 'N/A',
      pollutants: {
        pm25: data.iaqi?.pm25?.v,
        pm10: data.iaqi?.pm10?.v,
        o3: data.iaqi?.o3?.v,
        no2: data.iaqi?.no2?.v,
        so2: data.iaqi?.so2?.v,
        co: data.iaqi?.co?.v
      },
      weather: {
        temperature: data.iaqi?.temp?.v,
        pressure: data.iaqi?.pressure?.v,
        humidity: data.iaqi?.humidity?.v,
        windSpeed: data.iaqi?.wind?.v,
        windDirection: data.iaqi?.wind?.deg || 0
      },
      timestamp: data.time.iso,
      source: 'waqi'
    };
  }
  private validateSettings(settings: { [key: string]: any }): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Validate cache settings
    if (settings.cacheTTL !== undefined && (typeof settings.cacheTTL !== 'number' || settings.cacheTTL < 0)) {
      errors.push('cacheTTL must be a positive number');
    }
    
    // Validate refresh interval
    if (settings.refreshInterval !== undefined && (typeof settings.refreshInterval !== 'number' || settings.refreshInterval < 1000)) {
      errors.push('refreshInterval must be at least 1000ms');
    }
    
    // Validate default location
    if (settings.defaultLocation) {
      const { latitude, longitude } = settings.defaultLocation;
      if (typeof latitude !== 'number' || typeof longitude !== 'number') {
        errors.push('defaultLocation must have numeric latitude and longitude');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}