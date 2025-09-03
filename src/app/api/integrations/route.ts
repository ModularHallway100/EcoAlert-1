import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import type { IntegrationConfig, IntegrationType, IntegrationResponse } from '@/lib/integrations';
import { validateIntegration } from '@/lib/integrations';
import { INTEGRATION_SERVICES as SERVICE_REGISTRY } from '@/lib/services';

// In-memory storage for integration configurations
const integrationsStorage = new Map<string, IntegrationConfig>();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as IntegrationType;
    const status = searchParams.get('status') as 'active' | 'inactive' | 'error';

    // Get all integrations or filter by type/status
    let integrations = Array.from(integrationsStorage.values());

    if (type) {
      integrations = integrations.filter(integration => integration.type === type);
    }
    
    if (status) {
      integrations = integrations.filter(integration => integration.status === status);
    }

    return NextResponse.json({
      success: true,
      data: integrations,
      count: integrations.length
    });

  } catch (error) {
    console.error('Error fetching integrations:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, apiKeys, settings } = body;

    // Validate input
    if (!name || !type || !apiKeys) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: name, type, and apiKeys'
      }, { status: 400 });
    }

    // Validate integration configuration
    const validation = validateIntegration({ name, type, apiKeys, settings: settings || {} });    if (!validation.valid) {
      return NextResponse.json({
        success: false,
        error: 'Invalid integration configuration',
        errors: validation.errors
      }, { status: 400 });
    }

    // Check if integration type is supported
    const ServiceClass = SERVICE_REGISTRY[type as keyof typeof SERVICE_REGISTRY];
    if (!ServiceClass) {
      return NextResponse.json({
        success: false,
        error: `Integration type '${type}' is not supported`
      }, { status: 400 });
    }

    // Create unique ID
    const id = `${type}-${Date.now()}`;
    
    // Create integration configuration
    const config: IntegrationConfig = {
      id,
      name,
      type,
      status: 'inactive',
      apiKeys,
      settings: settings || {},
      lastSync: undefined,
      rateLimit: {
        requests: 60,
        window: 60 // 60 seconds
      }
    };

    // Store integration
    integrationsStorage.set(id, config);

    // Initialize the integration service
    const service = new ServiceClass(config);
    const initResult = await service.initialize(config);

    if (!initResult.success) {
      // Mark as error if initialization failed
      config.status = 'error';
      integrationsStorage.set(id, config);
      
      return NextResponse.json({
        success: false,
        error: 'Failed to initialize integration',
        details: initResult.error
      }, { status: 400 });
    }

    // Mark as active if initialization succeeded
    config.status = 'active';
    integrationsStorage.set(id, config);

    return NextResponse.json({
      success: true,
      data: {
        id,
        name,
        type,
        status: 'active',
        settings: config.settings
      },
      message: 'Integration created successfully'
    });

  } catch (error) {
    console.error('Error creating integration:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Integration ID is required'
      }, { status: 400 });
    }

    // Find existing integration
    const existing = integrationsStorage.get(id);
    if (!existing) {
      return NextResponse.json({
        success: false,
        error: 'Integration not found'
      }, { status: 404 });
    }

    // Validate updates
    const validation = validateIntegration({ ...existing, ...updates });
    if (!validation.valid) {
      return NextResponse.json({
        success: false,
        error: 'Invalid integration configuration',
        errors: validation.errors
      }, { status: 400 });
    }

    // Update configuration
    const updatedConfig = { ...existing, ...updates };
    integrationsStorage.set(id, updatedConfig);

    // If API keys are being updated, re-authenticate
    if (updates.apiKeys) {
      const ServiceClass = SERVICE_REGISTRY[existing.type];
      if (ServiceClass) {
        const service = new ServiceClass(updatedConfig);
        const authResult = await service.authenticate(updates.apiKeys);
        
        if (!authResult.success) {
          updatedConfig.status = 'error';
          integrationsStorage.set(id, updatedConfig);
          
          return NextResponse.json({
            success: false,
            error: 'Authentication failed with new API keys',
            details: authResult.error
          }, { status: 400 });
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        id,
        name: updatedConfig.name,
        type: updatedConfig.type,
        status: updatedConfig.status,
        settings: updatedConfig.settings
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

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Integration ID is required'
      }, { status: 400 });
    }

    // Find and remove integration
    const existing = integrationsStorage.get(id);
    if (!existing) {
      return NextResponse.json({
        success: false,
        error: 'Integration not found'
      }, { status: 404 });
    }

    const ServiceClass = SERVICE_REGISTRY[existing.type];
    if (ServiceClass) {
      const service = new ServiceClass(existing);
      try {
        await service.disconnect();
      } catch (disconnectError) {
        console.error(`Failed to disconnect integration ${id}:`, disconnectError);
        // Continue with deletion even if disconnect fails, but log the error
      }
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