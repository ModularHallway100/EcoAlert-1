import type { IntegrationService, IntegrationConfig, IntegrationResponse, WeatherData } from '../integrations';
import type { Coordinates } from '../types';

// API Constants
const API_BASE_URL = 'https://api.openweathermap.org/data/2.5';
const API_TIMEOUT = 10000; // 10 seconds
const RATE_LIMIT_REQUESTS = 60; // 60 requests per minute
const RATE_LIMIT_WINDOW = 60 * 1000; // 60 seconds window

export class WeatherService implements IntegrationService {
  private config: IntegrationConfig;
  private rateLimiter: any;

  constructor(config: IntegrationConfig) {
    this.config = config;
    // Import RateLimiter dynamically for better compatibility
    import('../integrations').then(module => {
      this.rateLimiter = new module.RateLimiter(
        RATE_LIMIT_REQUESTS,
        RATE_LIMIT_WINDOW
      );
    }).catch(error => {
      console.error('Failed to load RateLimiter:', error);
      // Fallback to a simple rate limiter
      this.rateLimiter = {
        check: () => ({ allowed: true, remaining: RATE_LIMIT_REQUESTS, reset: Date.now() + RATE_LIMIT_WINDOW })
      };
    });
  }

  async initialize(config: IntegrationConfig): Promise<IntegrationResponse> {
    try {
      this.config = config;
      const testResult = await this.test();
      if (!testResult.success) {
        return {
          success: false,
          error: 'Failed to initialize Weather integration: Invalid API key'
        };
      }

      return {
        success: true,
        data: { message: 'Weather service initialized successfully' }
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
      const apiKey = apiKeys.OPENWEATHER_API_KEY;
      if (!apiKey) {
        return {
          success: false,
          error: 'OpenWeatherMap API key is required'
        };
      }

      // Validate API key format (basic check)
      if (apiKey.length < 10 || apiKey === 'YOUR_OPENWEATHER_API_KEY_HERE') {
        return {
          success: false,
          error: 'Invalid OpenWeatherMap API key format'
        };
      }

      // Test the API key with a simple call
      const url = `${API_BASE_URL}/weather?q=London&appid=${apiKey}&units=metric`;
      
      const response = await fetch(url, {
        method: 'GET',
        signal: AbortSignal.timeout(API_TIMEOUT),
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: `Authentication failed: ${response.status} ${response.statusText} - ${errorData.message || 'Unknown error'}`
        };
      }

      const data = await response.json();
      if (data.cod !== 200) {
        return {
          success: false,
          error: `Authentication failed: ${data.message || 'Unknown error'}`
        };
      }

      return {
        success: true,
        data: { message: 'OpenWeatherMap authentication successful' }
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

  async sync(data?: { location?: Coordinates; forecast?: boolean }): Promise<IntegrationResponse> {
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

      // Validate API key before making requests
      const apiKey = this.config.apiKeys.OPENWEATHER_API_KEY;
      if (!apiKey || apiKey === 'YOUR_OPENWEATHER_API_KEY_HERE') {
        console.error('WeatherService: Invalid or missing API key');
        return {
          success: false,
          error: 'OpenWeatherMap API key is invalid or missing'
        };
      }

      const location = data?.location || this.config.settings.defaultLocation || {
        latitude: 40.7128,
        longitude: -74.0060
      };

      const includeForecast = data?.forecast ?? this.config.settings.includeForecast ?? false;

      // Get current weather
      const currentWeatherUrl = `${API_BASE_URL}/weather?lat=${location.latitude}&lon=${location.longitude}&appid=${apiKey}&units=metric`;
      
      let currentResponse: Response;
      try {
        currentResponse = await fetch(currentWeatherUrl, {
          method: 'GET',
          signal: AbortSignal.timeout(API_TIMEOUT),
          headers: {
            'Accept': 'application/json'
          }
        });
      } catch (fetchError) {
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          console.error('WeatherService: Current weather request timed out');
          return {
            success: false,
            error: 'Weather API request timed out'
          };
        }
        throw fetchError;
      }

      if (!currentResponse.ok) {
        const errorData = await currentResponse.json().catch(() => ({}));
        console.error('WeatherService: Current weather request failed:', errorData);
        return {
          success: false,
          error: `Weather API request failed: ${currentResponse.status} ${currentResponse.statusText} - ${errorData.message || 'Unknown error'}`
        };
      }

      const currentData = await currentResponse.json();
      
      // Validate and transform current weather data
      if (!currentData.coord || !currentData.main || !currentData.weather || !currentData.wind || !currentData.dt) {
        console.error('WeatherService: Invalid current weather response structure');
        return {
          success: false,
          error: 'Invalid weather data structure received from API'
        };
      }
      
      const transformedData = this.transformWeatherData(currentData);

      // Get forecast if requested
      let forecast: any[] = [];
      if (includeForecast) {
        const forecastUrl = `${API_BASE_URL}/forecast?lat=${location.latitude}&lon=${location.longitude}&appid=${apiKey}&units=metric`;
        
        try {
          const forecastResponse = await fetch(forecastUrl, {
            method: 'GET',
            signal: AbortSignal.timeout(API_TIMEOUT),
            headers: {
              'Accept': 'application/json'
            }
          });

          if (forecastResponse.ok) {
            try {
              const forecastData = await forecastResponse.json();
              
              // Validate forecast response structure
              if (!forecastData.list || !Array.isArray(forecastData.list)) {
                console.error('WeatherService: Invalid forecast response structure');
              } else {
                forecast = this.transformForecastData(forecastData);
                transformedData.forecast = forecast;
              }
            } catch (transformError) {
              console.error('WeatherService: Failed to transform forecast data:', transformError);
            }
          } else {
            console.warn('WeatherService: Forecast request failed with status:', forecastResponse.status, forecastResponse.statusText);
          }
        } catch (fetchError) {
          if (fetchError instanceof Error && fetchError.name === 'AbortError') {
            console.warn('WeatherService: Forecast request timed out, continuing without forecast');
          } else {
            console.error('WeatherService: Forecast request failed:', fetchError);
            // Continue without forecast if it fails
          }
        }
      }

      console.log('WeatherService: Successfully synced weather data for location', location);
      return {
        success: true,
        data: transformedData,
        rateLimit: {
          remaining: rateLimitCheck.remaining,
          reset: rateLimitCheck.reset
        }
      };
    } catch (error) {
      console.error('WeatherService: Sync failed:', error);
      if (error instanceof Error) {
        return {
          success: false,
          error: `Sync failed: ${error.message}`
        };
      }
      return {
        success: false,
        error: 'Sync failed: Unknown error'
      };
    }
  }

  async validate(): Promise<IntegrationResponse> {
    try {
      // Check if we have required configuration
      if (!this.config.apiKeys.OPENWEATHER_API_KEY) {
        return {
          success: false,
          error: 'OpenWeatherMap API key is missing'
        };
      }

      // Validate API key format (basic check)
      if (this.config.apiKeys.OPENWEATHER_API_KEY === 'YOUR_OPENWEATHER_API_KEY_HERE' ||
          this.config.apiKeys.OPENWEATHER_API_KEY.length < 10) {
        return {
          success: false,
          error: 'OpenWeatherMap API key is invalid or not configured'
        };
      }

      return {
        success: true,
        data: { message: 'Weather configuration is valid' }
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
      // Validate API key before testing
      const apiKey = this.config.apiKeys.OPENWEATHER_API_KEY;
      if (!apiKey || apiKey === 'YOUR_OPENWEATHER_API_KEY_HERE') {
        console.error('WeatherService: Cannot test - invalid or missing API key');
        return {
          success: false,
          error: 'Cannot test - OpenWeatherMap API key is invalid or missing'
        };
      }

      // Use a simple test location
      const testLocation = { latitude: 40.7128, longitude: -74.0060 };
      console.log('WeatherService: Testing with location', testLocation);
      
      const result = await this.sync({ location: testLocation });
      
      if (result.success) {
        console.log('WeatherService: Test successful');
        return {
          success: true,
          data: { message: 'Weather service test successful' }
        };
      } else {
        console.error('WeatherService: Test failed:', result.error);
        return result;
      }
    } catch (error) {
      console.error('WeatherService: Test failed with exception:', error);
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
        data: { message: 'Weather settings updated successfully' }
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
        data: { message: 'Weather integration disconnected successfully' }
      };
    } catch (error) {
      return {
        success: false,
        error: `Disconnection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private transformWeatherData(data: any): WeatherData {
    // Defensive guard for required fields
    if (!data?.coord || !data?.main || !data?.weather?.[0] || !data?.dt) {
      throw new Error('Invalid weather data structure');
    }

    return {
      location: {
        latitude: data.coord.lat,
        longitude: data.coord.lon
      },
      city: data.name || 'Unknown',
      country: data.sys?.country || 'Unknown',
      temperature: Math.round(data.main.temp),
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      windSpeed: data.wind?.speed || 0,
      windDirection: data.wind?.deg || 0,
      visibility: data.visibility ? data.visibility / 1000 : 0, // Convert to km
      uvIndex: 0, // Not available in current weather endpoint
      condition: data.weather[0].main,
      icon: data.weather[0].icon,
      timestamp: new Date(data.dt * 1000).toISOString()
    };
  }

  private transformForecastData(data: any): Array<{
    date: Date;
    temperature: number;
    condition: string;
    icon: string;
  }> {
    if (!data?.list || !Array.isArray(data.list)) {
      console.warn('WeatherService: Invalid forecast data structure, returning empty array');
      return [];
    }
    
    try {
      return data.list.slice(0, 5).map((item: any) => {
        // Validate each forecast item
        if (!item?.dt || !item?.main?.temp || !item?.weather?.[0]) {
          console.warn('WeatherService: Invalid forecast item, skipping');
          return null;
        }
        
        return {
          date: new Date(item.dt * 1000),
          temperature: Math.round(item.main.temp),
          condition: item.weather[0].main,
          icon: item.weather[0].icon
        };
      }).filter((item: any): item is { date: Date; temperature: number; condition: string; icon: string } => item !== null);
    } catch (error) {
      console.error('WeatherService: Error transforming forecast data:', error);
      return [];
    }
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

    // Validate forecast settings
    if (settings.includeForecast !== undefined && typeof settings.includeForecast !== 'boolean') {
      errors.push('includeForecast must be a boolean');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}