import { NextRequest, NextResponse } from 'next/server';
import type { IntegrationConfig, IntegrationType, IntegrationResponse } from '@/lib/integrations';
import { checkIntegrationHealth } from '@/lib/integrations';
import { INTEGRATION_SERVICES as SERVICE_REGISTRY } from '@/lib/services';

// In-memory storage for integration configurations
const integrationsStorage = new Map<string, IntegrationConfig>();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Find integration
    const integration = integrationsStorage.get(id);
    if (!integration) {
      return NextResponse.json({
        success: false,
        error: 'Integration not found'
      }, { status: 404 });
    }

    // Check integration health
    const health = await checkIntegrationHealth(integration);

    const response = {
      success: true,
      data: {
        id: integration.id,
        name: integration.name,
        type: integration.type,
        status: integration.status,
        settings: integration.settings,
        lastSync: integration.lastSync,
        health,
        rateLimit: integration.rateLimit
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching integration:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { action, data } = body;

    // Find integration
    const integration = integrationsStorage.get(id);
    if (!integration) {
      return NextResponse.json({
        success: false,
        error: 'Integration not found'
      }, { status: 404 });
    }

    // Get service class
    const ServiceClass = SERVICE_REGISTRY[integration.type as keyof typeof SERVICE_REGISTRY];
    if (!ServiceClass) {
      return NextResponse.json({
        success: false,
        error: `Integration service not found for type: ${integration.type}`
      }, { status: 400 });
    }

    // Create service instance
    const service = new ServiceClass(integration);

    let result: IntegrationResponse;

    switch (action) {
      case 'sync':
        // Sync data from external service
        result = await service.sync(data);
        
        if (result.success) {
          // Update last sync time
          integration.lastSync = new Date();
          integrationsStorage.set(id, integration);

          return NextResponse.json({
            success: true,
            data: {
              ...result.data,
              lastSync: integration.lastSync
            },
            message: 'Data synced successfully'
          });
        } else {
          // Mark integration as error if sync failed
          integration.status = 'error';
          integrationsStorage.set(id, integration);

          return NextResponse.json({
            success: false,
            error: 'Sync failed',
            details: result.error
          }, { status: 400 });
        }

      case 'test':
        // Test the integration
        result = await service.test();
        return NextResponse.json(result);

      case 'validate':
        // Validate configuration
        result = await service.validate();
        return NextResponse.json(result);

      case 'health':
        // Check integration health
        const health = await checkIntegrationHealth(integration);
        return NextResponse.json({
          success: true,
          data: health
        });

      default:
        return NextResponse.json({
          success: false,
          error: `Unknown action: ${action}`
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Error performing integration action:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { settings, status } = body;

    // Find integration
    const integration = integrationsStorage.get(id);
    if (!integration) {
      return NextResponse.json({
        success: false,
        error: 'Integration not found'
      }, { status: 404 });
    }

    // Get service class
    const ServiceClass = SERVICE_REGISTRY[integration.type as keyof typeof SERVICE_REGISTRY];
    if (!ServiceClass) {
      return NextResponse.json({
        success: false,
        error: `Integration service not found for type: ${integration.type}`
      }, { status: 400 });
    }

    // Create service instance
    const service = new ServiceClass(integration);

    let updatedIntegration = { ...integration };

    // Update settings if provided
    if (settings) {
      const result = await service.updateSettings(settings);
      if (!result.success) {
        return NextResponse.json({
          success: false,
          error: 'Failed to update settings',
          details: result.error
        }, { status: 400 });
      }
      updatedIntegration.settings = { ...integration.settings, ...settings };
    }

    // Update status if provided
    if (status && ['active', 'inactive', 'error'].includes(status)) {
      updatedIntegration.status = status;
    }

    // Save updated integration
    integrationsStorage.set(id, updatedIntegration);

    return NextResponse.json({
      success: true,
      data: {
        id: updatedIntegration.id,
        name: updatedIntegration.name,
        type: updatedIntegration.type,
        status: updatedIntegration.status,
        settings: updatedIntegration.settings,
        lastSync: updatedIntegration.lastSync
      },
      message: 'Integration updated successfully'
    });

  } catch (error) {
    console.error('Error updating integration:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Find integration
    const integration = integrationsStorage.get(id);
    if (!integration) {
      return NextResponse.json({
        success: false,
        error: 'Integration not found'
      }, { status: 404 });
    }

    // Get service class
    const ServiceClass = SERVICE_REGISTRY[integration.type as keyof typeof SERVICE_REGISTRY];
    if (!ServiceClass) {
      return NextResponse.json({
        success: false,
        error: `Integration service not found for type: ${integration.type}`
      }, { status: 400 });
    }

    // Create service instance
    const service = new ServiceClass(integration);

    // Disconnect integration
    const result = await service.disconnect();
    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: 'Failed to disconnect integration',
        details: result.error
      }, { status: 400 });
    }

    // Remove from storage
    integrationsStorage.delete(id);

    return NextResponse.json({
      success: true,
      message: 'Integration deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting integration:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}