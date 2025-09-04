import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/integrations';
import type { WebhookPayload } from '@/lib/integrations';

// TODO: Replace with persistent storage (database, Redis, or environment variables)
// For now, use a database or external secret management service
const webhookSecrets = new Map<string, string>();

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const integrationId = searchParams.get('integrationId');

    if (!integrationId) {
      return NextResponse.json({
        success: false,
        error: 'Integration ID is required'
      }, { status: 400 });
    }

    // Get webhook secret from storage
    const secret = webhookSecrets.get(integrationId);
    if (!secret) {
      return NextResponse.json({
        success: false,
        error: 'Webhook secret not found for integration'
      }, { status: 404 });
    }

    // Get request signature
    const signature = request.headers.get('x-webhook-signature') || '';
    if (!signature) {
      return NextResponse.json({
        success: false,
        error: 'Webhook signature is required'
      }, { status: 400 });
    }

    // Parse and verify request body
    const rawBody = await request.text();

    // Verify signature
    const isValid = verifyWebhookSignature(rawBody, signature, secret);
    if (!isValid) {
      return NextResponse.json({
        success: false,
        error: 'Invalid webhook signature'
      }, { status: 401 });
    }

    // Parse payload after signature verification
    let payload: WebhookPayload;
    try {
      payload = JSON.parse(rawBody);
    } catch (parseError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid JSON payload'
      }, { status: 400 });
    }

    // Process the webhook based on integration type and event type
    const result = await processWebhook(payload);

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Store webhook secret for an integration
export async function PUT(request: NextRequest) {
  try {
    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid JSON in request body'
      }, { status: 400 });
    }

    const { integrationId, secret } = body;
    if (!integrationId || !secret) {
      return NextResponse.json({
        success: false,
        error: 'Integration ID and secret are required'
      }, { status: 400 });
    }

    // Validate secret format/length
    if (typeof secret !== 'string' || secret.length < 10) {
      return NextResponse.json({
        success: false,
        error: 'Secret must be a string with at least 10 characters'
      }, { status: 400 });
    }

    // Store webhook secret
    webhookSecrets.set(integrationId, secret);

    return NextResponse.json({
      success: true,
      message: 'Webhook secret stored successfully'
    });

  } catch (error) {
    console.error('Error storing webhook secret:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
// Remove webhook secret for an integration
export async function DELETE(request: NextRequest) {
  try {
    // Add authentication check here
    // const isAuthorized = await verifyApiKey(request);
    // if (!isAuthorized) {
    //   return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    // }

    const { searchParams } = new URL(request.url);
    const integrationId = searchParams.get('integrationId');

    if (!integrationId) {
      return NextResponse.json({
        success: false,
        error: 'Integration ID is required'
      }, { status: 400 });
    }

    // Remove webhook secret
    webhookSecrets.delete(integrationId);

    return NextResponse.json({
      success: true,
      message: 'Webhook secret removed successfully'
    });

  } catch (error) {
    console.error('Error removing webhook secret:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
// Process webhook payload based on integration type and event type
async function processWebhook(payload: WebhookPayload): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    const { integrationId, eventType, data } = payload;

    switch (eventType) {
      case 'aqi_update':
        // Process air quality update
        return {
          success: true,
          message: 'Air quality update processed',
          data: {
            integrationId,
            timestamp: payload.timestamp,
            aqi: data.aqi,
            location: data.location
          }
        };

      case 'weather_alert':
        // Process weather alert
        return {
          success: true,
          message: 'Weather alert processed',
          data: {
            integrationId,
            timestamp: payload.timestamp,
            alertType: data.alertType,
            severity: data.severity,
            message: data.message,
            location: data.location
          }
        };

      case 'sensor_reading':
        // Process sensor reading
        return {
          success: true,
          message: 'Sensor reading processed',
          data: {
            integrationId,
            timestamp: payload.timestamp,
            sensorId: data.sensorId,
            reading: data.reading,
            unit: data.unit
          }
        };

      case 'emergency_alert':
        // Process emergency alert
        return {
          success: true,
          message: 'Emergency alert processed',
          data: {
            integrationId,
            timestamp: payload.timestamp,
            alertType: data.alertType,
            severity: data.severity,
            message: data.message,
            location: data.location,
            coordinates: data.coordinates
          }
        };

      case 'notification_delivered':
        // Process notification delivery confirmation
        return {
          success: true,
          message: 'Notification delivery confirmed',
          data: {
            integrationId,
            timestamp: payload.timestamp,
            notificationId: data.notificationId,
            recipient: data.recipient,
            status: data.status
          }
        };

      case 'data_sync_completed':
        // Process data sync completion
        return {
          success: true,
          message: 'Data sync completed',
          data: {
            integrationId,
            timestamp: payload.timestamp,
            syncId: data.syncId,
            recordsProcessed: data.recordsProcessed,
            duration: data.duration
          }
        };

      default:
        // Unknown event type
        console.warn(`Unknown event type: ${eventType} for integration: ${integrationId}`);
        return {
          success: true,
          message: 'Webhook processed (unknown event type)',
          data: {
            integrationId,
            eventType,
            timestamp: payload.timestamp
          }
        };
    }

  } catch (error) {
    console.error('Error processing webhook payload:', error);
    return {
      success: false,
      message: 'Failed to process webhook payload',
      data: {
        integrationId: payload.integrationId,
        eventType: payload.eventType,
        timestamp: payload.timestamp,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
}