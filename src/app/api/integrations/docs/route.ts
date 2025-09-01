import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      title: 'EcoAlert Integration API Documentation',
      version: '1.0.0',
      description: 'API for managing third-party integrations in EcoAlert',
      baseUrl: 'https://ecoalert.app/api',
      endpoints: {
        integrations: {
          'GET /api/integrations': {
            summary: 'Get all integrations',
            description: 'Retrieve a list of all configured integrations',
            parameters: {
              query: [
                {
                  name: 'type',
                  type: 'string',
                  required: false,
                  description: 'Filter by integration type (e.g., waqi, openweathermap)'
                },
                {
                  name: 'status',
                  type: 'string',
                  required: false,
                  description: 'Filter by status (active, inactive, error)'
                }
              ]
            },
            responses: {
              '200': {
                description: 'Success',
                body: {
                  success: true,
                  data: 'Array of integration configurations',
                  count: 'Number of integrations returned'
                }
              }
            }
          },
          'POST /api/integrations': {
            summary: 'Create a new integration',
            description: 'Add a new third-party integration configuration',
            request: {
              body: {
                name: 'Integration name (required)',
                type: 'Integration type (required)',
                apiKeys: 'Object with API keys (required)',
                settings: 'Additional settings (optional)'
              }
            },
            responses: {
              '201': {
                description: 'Integration created successfully',
                body: {
                  success: true,
                  data: {
                    id: 'Integration ID',
                    name: 'Integration name',
                    type: 'Integration type',
                    status: 'Integration status',
                    settings: 'Integration settings'
                  },
                  message: 'Integration created successfully'
                }
              }
            }
          },
          'PUT /api/integrations': {
            summary: 'Update an integration',
            description: 'Update an existing integration configuration',
            request: {
              body: {
                id: 'Integration ID (required)',
                name: 'Integration name (optional)',
                type: 'Integration type (optional)',
                apiKeys: 'API keys (optional)',
                settings: 'Additional settings (optional)'
              }
            },
            responses: {
              '200': {
                description: 'Integration updated successfully',
                body: {
                  success: true,
                  data: 'Updated integration configuration',
                  message: 'Integration updated successfully'
                }
              }
            }
          },
          'DELETE /api/integrations': {
            summary: 'Delete an integration',
            description: 'Remove an integration configuration',
            parameters: {
              query: [
                {
                  name: 'id',
                  type: 'string',
                  required: true,
                  description: 'Integration ID to delete'
                }
              ]
            },
            responses: {
              '200': {
                description: 'Integration deleted successfully',
                body: {
                  success: true,
                  message: 'Integration deleted successfully'
                }
              }
            }
          }
        },
        integration: {
          'GET /api/integrations/[id]': {
            summary: 'Get integration details',
            description: 'Retrieve detailed information about a specific integration',
            parameters: {
              path: [
                {
                  name: 'id',
                  type: 'string',
                  required: true,
                  description: 'Integration ID'
                }
              ]
            },
            responses: {
              '200': {
                description: 'Success',
                body: {
                  success: true,
                  data: {
                    id: 'Integration ID',
                    name: 'Integration name',
                    type: 'Integration type',
                    status: 'Integration status',
                    settings: 'Integration settings',
                    lastSync: 'Last sync timestamp',
                    health: {
                      status: 'healthy | unhealthy | degraded',
                      responseTime: 'Response time in ms',
                      error: 'Error message if any'
                    },
                    rateLimit: {
                      requests: 'Max requests per window',
                      window: 'Window size in seconds'
                    }
                  }
                }
              }
            }
          },
          'POST /api/integrations/[id]': {
            summary: 'Perform integration action',
            description: 'Perform actions on a specific integration',
            parameters: {
              path: [
                {
                  name: 'id',
                  type: 'string',
                  required: true,
                  description: 'Integration ID'
                }
              ]
            },
            request: {
              body: {
                action: 'Action to perform (sync, test, validate, health)',
                data: 'Additional data for the action (optional)'
              }
            },
            responses: {
              '200': {
                description: 'Action completed successfully',
                body: {
                  success: true,
                  data: 'Action result data',
                  message: 'Action completed successfully'
                }
              }
            }
          },
          'PUT /api/integrations/[id]': {
            summary: 'Update integration settings',
            description: 'Update settings for a specific integration',
            parameters: {
              path: [
                {
                  name: 'id',
                  type: 'string',
                  required: true,
                  description: 'Integration ID'
                }
              ]
            },
            request: {
              body: {
                settings: 'Settings to update',
                status: 'New status (optional)'
              }
            },
            responses: {
              '200': {
                description: 'Integration updated successfully',
                body: {
                  success: true,
                  data: 'Updated integration configuration',
                  message: 'Integration updated successfully'
                }
              }
            }
          },
          'DELETE /api/integrations/[id]': {
            summary: 'Delete integration',
            description: 'Delete a specific integration',
            parameters: {
              path: [
                {
                  name: 'id',
                  type: 'string',
                  required: true,
                  description: 'Integration ID'
                }
              ]
            },
            responses: {
              '200': {
                description: 'Integration deleted successfully',
                body: {
                  success: true,
                  message: 'Integration deleted successfully'
                }
              }
            }
          }
        },
        webhooks: {
          'POST /api/integrations/webhooks': {
            summary: 'Handle webhook events',
            description: 'Handle incoming webhook events from third-party services',
            parameters: {
              query: [
                {
                  name: 'integrationId',
                  type: 'string',
                  required: true,
                  description: 'Integration ID'
                }
              ]
            },
            headers: {
              'x-webhook-signature': 'Webhook signature for verification'
            },
            request: {
              body: {
                integrationId: 'Integration ID',
                eventType: 'Type of event (aqi_update, weather_alert, sensor_reading, etc.)',
                data: 'Event payload data',
                timestamp: 'Event timestamp',
                signature: 'Event signature'
              }
            },
            responses: {
              '200': {
                description: 'Webhook processed successfully',
                body: {
                  success: true,
                  message: 'Webhook processed',
                  data: 'Processing result'
                }
              }
            }
          },
          'PUT /api/integrations/webhooks': {
            summary: 'Store webhook secret',
            description: 'Store webhook secret signature verification',
            request: {
              body: {
                integrationId: 'Integration ID',
                secret: 'Webhook secret'
              }
            },
            responses: {
              '200': {
                description: 'Webhook secret stored successfully',
                body: {
                  success: true,
                  message: 'Webhook secret stored successfully'
                }
              }
            }
          },
          'DELETE /api/integrations/webhooks': {
            summary: 'Remove webhook secret',
            description: 'Remove webhook secret for an integration',
            parameters: {
              query: [
                {
                  name: 'integrationId',
                  type: 'string',
                  required: true,
                  description: 'Integration ID'
                }
              ]
            },
            responses: {
              '200': {
                description: 'Webhook secret removed successfully',
                body: {
                  success: true,
                  message: 'Webhook secret removed successfully'
                }
              }
            }
          }
        }
      },
      integrationTypes: [
        {
          type: 'waqi',
          name: 'World Air Quality Index',
          description: 'Real-time air quality data from WAQI API',
          requiredApiKeys: ['WAQI_API_TOKEN'],
          features: ['Current AQI', 'Pollutant levels', 'Location-based data'],
          rateLimit: '60 requests per minute'
        },
        {
          type: 'openweathermap',
          name: 'OpenWeatherMap',
          description: 'Weather data and forecasts from OpenWeatherMap',
          requiredApiKeys: ['OPENWEATHER_API_KEY'],
          features: ['Current weather', '5-day forecast', 'Weather alerts'],
          rateLimit: '60 requests per minute'
        }
      ],
      eventTypes: [
        'aqi_update - Air quality index updates',
        'weather_alert - Weather alert notifications',
        'sensor_reading - IoT sensor data',
        'emergency_alert - Emergency notifications',
        'notification_delivered - Notification delivery confirmations',
        'data_sync_completed - Data sync completion notifications'
      ],
      authentication: 'API key authentication required for all endpoints',
      rateLimits: {
        default: '100 requests per minute',
        integrations: '60 requests per minute',
        webhooks: 'Unlimited (with proper signature verification)'
      }
    }
  });
}