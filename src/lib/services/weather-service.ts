import type { IntegrationService, IntegrationConfig, IntegrationResponse, WeatherData } from '../integrations';
import type { Coordinates } from '../types';

export class WeatherService implements IntegrationService {
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
          error: 'Failed to initialize Weather integration: Invalid API key'
        };
      }

      return {
        success: true,
        data: { message: 'Weather integration initialized successfully' }
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
      if (!apiKey || apiKey === 'YOUR_OPENWEATHER_API_KEY_HERE') {
        return {
          success: false,
          error: 'OpenWeatherMap API key is required'
        };
      }

      // Test the API key with a simple call
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=London&appid=${apiKey}&units=metric`,
        { method: 'GET' }
      );

      if (!response.ok) {
        return {
          success: false,
          error: `Authentication failed: ${response.status} ${response.statusText}`
        };
      }

      const data = await response.json();
      if (data.cod !== 200) {
        return {
          success: false,
          error: `Authentication failed: ${data.message}`
        };
      }

      return {
        success: true,
        data: { message: 'OpenWeatherMap authentication successful' }
      };
    } catch (error) {
      return {
        success: false,
        error: `Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`
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

      const location = data?.location || this.config.settings.defaultLocation || {
        latitude: 40.7128,
        longitude: -74.0060
      };

      const apiKey = this.config.apiKeys.OPENWEATHER_API_KEY;
      const includeForecast = data?.forecast ?? this.config.settings.includeForecast ?? false;

      // Get current weather
      const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${location.latitude}&lon=${location.longitude}&appid=${apiKey}&units=metric`;
      
      const currentResponse = await fetch(currentWeatherUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!currentResponse.ok) {
        return {
          success: false,
          error: `Weather API request failed: ${currentResponse.status} ${currentResponse.statusText}`
        };
      }

      const currentData = await currentResponse.json();
      const transformedData = this.transformWeatherData(currentData);

      // Get forecast if requested
      let forecast: any[] = [];
      if (includeForecast) {
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${location.latitude}&lon=${location.longitude}&appid=${apiKey}&units=metric`;
        
        const forecastResponse = await fetch(forecastUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        });

        if (forecastResponse.ok) {
          const forecastData = await forecastResponse.json();
          forecast = this.transformForecastData(forecastData);
          transformedData.forecast = forecast;
        }
      }

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
      if (!this.config.apiKeys.OPENWEATHER_API_KEY) {
        return {
          success: false,
          error: 'OpenWeatherMap API key is missing'
        };
      }

      // Check if key is not placeholder
      if (this.config.apiKeys.OPENWEATHER_API_KEY === 'YOUR_OPENWEATHER_API_KEY_HERE') {
        return {
          success: false,
          error: 'OpenWeatherMap API key is set to placeholder value'
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
      // Use a simple test location
      const testLocation = { latitude: 40.7128, longitude: -74.0060 };
      const result = await this.sync({ location: testLocation });
      
      if (result.success) {
        return {
          success: true,
          data: { message: 'Weather service test successful' }
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
    return {
      location: {
        latitude: data.coord.lat,
        longitude: data.coord.lon
      },
      city: data.name,
      country: data.sys.country,
      temperature: Math.round(data.main.temp),
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      windSpeed: data.wind.speed,
      windDirection: data.wind.deg || 0,
      visibility: data.visibility / 1000, // Convert to km
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
    return data.list.slice(0, 5).map((item: any) => ({
      date: new Date(item.dt * 1000),
      temperature: Math.round(item.main.temp),
      condition: item.weather[0].main,
      icon: item.weather[0].icon
    }));
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