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

    if (!id || typeof id !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Invalid integration ID'
      }, { status: 400 });
    }

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

    switch (action) {
      case 'sync':
        // Sync data from external service
        const result = await service.sync(data);
        
        if (result.success) {
         // Re-fetch to ensure we have the latest version
         const currentIntegration = integrationsStorage.get(id);
         if (!currentIntegration) {
           return NextResponse.json({
             success: false,
             error: 'Integration not found'
           }, { status: 404 });
         }
          // Update last sync time
          currentIntegration.lastSync = new Date();
          integrationsStorage.set(id, currentIntegration);
   
          return NextResponse.json({
            success: true,
            data: {
              ...result.data,
              lastSync: currentIntegration.lastSync
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

      case 'validate':
        // Validate configuration
        const validateResult = await service.validate();
        return NextResponse.json(validateResult);

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

    let updatedIntegration = { ...integration };

    // Update settings if provided
    if (settings) {
      const service = new ServiceClass(updatedIntegration);
      const result = await service.updateSettings(settings);
      if (!result.success) {
        return NextResponse.json({
          success: false,
          error: 'Failed to update settings',
          details: result.error
        }, { status: 400 });
      }
      // Use the service-returned settings if present, otherwise fall back to merging
      updatedIntegration.settings =
        result.data?.settings || { ...integration.settings, ...settings };
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