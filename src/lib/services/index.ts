import { WAQIService } from './waqi-service';
import { WeatherService } from './weather-service';
import { SendGridService } from './sendgrid-service';
import type { IntegrationService, IntegrationType } from '../integrations';
import type { IntegrationConfig } from '../integrations';

// Create a stub service class for services not yet implemented
const createStubService = (): new (config: IntegrationConfig) => IntegrationService => {
  return class implements IntegrationService {
    constructor(config: IntegrationConfig) {}
    initialize(config: IntegrationConfig): Promise<any> { return Promise.resolve({ success: true }); }
    authenticate(apiKeys: any): Promise<any> { return Promise.resolve({ success: true }); }
    sync(data?: any): Promise<any> { return Promise.resolve({ success: true }); }
    validate(): Promise<any> { return Promise.resolve({ success: true }); }
    test(): Promise<any> { return Promise.resolve({ success: true }); }
    updateSettings(settings: any): Promise<any> { return Promise.resolve({ success: true }); }
    disconnect(): Promise<any> { return Promise.resolve({ success: true }); }
  };
};

// Register all available integration service classes
export const INTEGRATION_SERVICES: { [key in IntegrationType]: new (config: IntegrationConfig) => IntegrationService } = {
  waqi: WAQIService,
  openweathermap: WeatherService,
  
  // Stub services for integrations not yet implemented
  here: createStubService(),
  google: createStubService(),
  mapbox: createStubService(),
  twilio: createStubService(),
  sendgrid: SendGridService,
  slack: createStubService(),
  discord: createStubService(),
  notion: createStubService(),
  airtable: createStubService(),
  stripe: createStubService(),
  paypal: createStubService(),
  tesla: createStubService(),
  nest: createStubService(),
  ring: createStubService(),
  philips_hue: createStubService(),
  samsung_smartthings: createStubService(),
  amazon_alexa: createStubService(),
  google_home: createStubService(),
};

// Service information metadata
export const INTEGRATION_SERVICE_INFO: { [key in IntegrationType]: {
  name: string;
  description: string;
  requiredApiKeys: string[];
  features: string[];
  rateLimit: string;
} } = {
  waqi: {
    name: 'World Air Quality Index',
    description: 'Real-time air quality data and pollution monitoring',
    requiredApiKeys: ['WAQI_API_KEY'],
    features: ['Air quality index', 'Pollution levels', 'Health recommendations'],
    rateLimit: '60 requests per minute'
  },
  openweathermap: {
    name: 'OpenWeatherMap',
    description: 'Weather forecasts and current conditions',
    requiredApiKeys: ['OPENWEATHER_API_KEY'],
    features: ['Current weather', 'Forecasts', 'Historical data'],
    rateLimit: '60 requests per minute'
  },
  here: {
    name: 'HERE Maps',
    description: 'Mapping, routing, and location services',
    requiredApiKeys: ['HERE_APP_ID', 'HERE_APP_CODE'],
    features: ['Maps', 'Routing', 'Geocoding'],
    rateLimit: '1200 requests per day'
  },
  google: {
    name: 'Google Maps',
    description: 'Comprehensive mapping and location services',
    requiredApiKeys: ['GOOGLE_MAPS_API_KEY'],
    features: ['Maps', 'Routes', 'Places', 'Geocoding'],
    rateLimit: '50 requests per second'
  },
  mapbox: {
    name: 'Mapbox',
    description: 'Customizable maps and location data',
    requiredApiKeys: ['MAPBOX_ACCESS_TOKEN'],
    features: ['Custom maps', 'Routing', 'Search'],
    rateLimit: '600 requests per minute'
  },
  twilio: {
    name: 'Twilio',
    description: 'SMS and voice notifications',
    requiredApiKeys: ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN'],
    features: ['SMS messaging', 'Voice calls', 'WhatsApp'],
    rateLimit: '100 requests per second'
  },
  sendgrid: {
    name: 'SendGrid',
    description: 'Email delivery and marketing',
    requiredApiKeys: ['SENDGRID_API_KEY'],
    features: ['Email delivery', 'Templates', 'Analytics'],
    rateLimit: '100 requests per second'
  },
  slack: {
    name: 'Slack',
    description: 'Team communication and notifications',
    requiredApiKeys: ['SLACK_BOT_TOKEN'],
    features: ['Messaging', 'Notifications', 'File sharing'],
    rateLimit: '1 request per second'
  },
  discord: {
    name: 'Discord',
    description: 'Community notifications and chat',
    requiredApiKeys: ['DISCORD_BOT_TOKEN'],
    features: ['Messaging', 'Notifications', 'Commands'],
    rateLimit: '5 requests per second'
  },
  notion: {
    name: 'Notion',
    description: 'Data logging and documentation',
    requiredApiKeys: ['NOTION_INTEGRATION_TOKEN'],
    features: ['Database management', 'Pages', 'Users'],
    rateLimit: '3 requests per second'
  },
  airtable: {
    name: 'Airtable',
    description: 'Database and spreadsheet integration',
    requiredApiKeys: ['AIRTABLE_API_KEY'],
    features: ['Tables', 'Forms', 'Automations'],
    rateLimit: '5 requests per second'
  },
  stripe: {
    name: 'Stripe',
    description: 'Payment processing and billing',
    requiredApiKeys: ['STRIPE_SECRET_KEY'],
    features: ['Payments', 'Subscriptions', 'Invoices'],
    rateLimit: '100 requests per second'
  },
  paypal: {
    name: 'PayPal',
    description: 'Online payment processing',
    requiredApiKeys: ['PAYPAL_CLIENT_ID', 'PAYPAL_CLIENT_SECRET'],
    features: ['Payments', 'Subscriptions', 'Payouts'],
    rateLimit: '50 requests per second'
  },
  tesla: {
    name: 'Tesla',
    description: 'Electric vehicle data and control',
    requiredApiKeys: ['TESLA_ACCESS_TOKEN'],
    features: ['Vehicle status', 'Charging control', 'Location'],
    rateLimit: '10 requests per minute'
  },
  nest: {
    name: 'Nest',
    description: 'Smart home monitoring and control',
    requiredApiKeys: ['GOOGLE_HOME_ACCESS_TOKEN'],
    features: ['Climate control', 'Security', 'Automation'],
    rateLimit: '10 requests per minute'
  },
  ring: {
    name: 'Ring',
    description: 'Security cameras and doorbells',
    requiredApiKeys: ['RING_ACCESS_TOKEN'],
    features: ['Video monitoring', 'Motion detection', 'Alerts'],
    rateLimit: '10 requests per minute'
  },
  philips_hue: {
    name: 'Philips Hue',
    description: 'Smart lighting control',
    requiredApiKeys: ['HUE_BRIDGE_IP', 'HUE_USERNAME'],
    features: ['Lighting control', 'Scenes', 'Scheduling'],
    rateLimit: '10 requests per minute'
  },
  samsung_smartthings: {
    name: 'Samsung SmartThings',
    description: 'Smart home automation',
    requiredApiKeys: ['SMARTTHINGS_ACCESS_TOKEN'],
    features: ['Device control', 'Automation', 'Scenes'],
    rateLimit: '50 requests per minute'
  },
  amazon_alexa: {
    name: 'Amazon Alexa',
    description: 'Voice assistant integration',
    requiredApiKeys: ['ALEXA_CLIENT_ID', 'ALEXA_CLIENT_SECRET'],
    features: ['Voice commands', 'Routines', 'Skills'],
    rateLimit: '60 requests per minute'
  },
  google_home: {
    name: 'Google Home',
    description: 'Google Assistant integration',
    requiredApiKeys: ['GOOGLE_HOME_ACCESS_TOKEN'],
    features: ['Voice commands', 'Routines', 'Home automation'],
    rateLimit: '60 requests per minute'
  }
};

// Get service information by type
export const getServiceInfo = (type: IntegrationType): {
  name: string;
  description: string;
  requiredApiKeys: string[];
  features: string[];
  rateLimit: string;
} | null => {
  return INTEGRATION_SERVICE_INFO[type] || null;
};

// Initialize all available services
export const initializeServices = () => {
  // This function can be used to perform any initialization
  // that needs to happen when services are first loaded
  console.log('Integration services initialized');
  return true;
};