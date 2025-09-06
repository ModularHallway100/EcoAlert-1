import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import type { IntegrationConfig, IntegrationType, IntegrationResponse } from '@/lib/integrations';
import { validateIntegration } from '@/lib/integrations';
import { INTEGRATION_SERVICES as SERVICE_REGISTRY } from '@/lib/services';

// Service Manager for managing service instances
class ServiceManager {
  private services = new Map<string, any>();
  private connections = new Map<string, any>();
  
  /**
   * Get or create a service instance
   */
    async getService(type: IntegrationType, config: IntegrationConfig): Promise<any> {
    const key = `${type}-${config.id}`;
    
    if (!this.services.has(key)) {
      const ServiceClass = SERVICE_REGISTRY[type];
      if (!ServiceClass) {
        throw new Error(`Service class not found for type: ${type}`);
      }
      
      const service = new ServiceClass(config);
      this.services.set(key, service);
      
      // Initialize the service
      await this.initializeService(service, config);
    }
    
    return this.services.get(key);
  }
  
  /**
   * Initialize a service and store connection
   */
  private async initializeService(service: any, config: IntegrationConfig): Promise<void> {
    try {
      const initResult = await service.initialize(config);
      if (!initResult.success) {
        throw new Error(`Service initialization failed: ${initResult.error}`);
      }
      
      // Store connection if available
      if (service.connection) {
        this.connections.set(config.id, service.connection);
      }
    } catch (error) {
      console.error(`Failed to initialize service for ${config.id}:`, error);
      throw error;
    }
  }
  
  /**
   * Get connection for an integration
   */
  getConnection(id: string): any {
    return this.connections.get(id);
  }
  
  /**
   * Update service configuration
   */
  async updateService(type: IntegrationType, config: IntegrationConfig, updates: Partial<IntegrationConfig>): Promise<void> {
    const key = `${type}-${config.id}`;
    const service = this.services.get(key);
    
    if (service) {
      if (updates.apiKeys) {
        // Re-authenticate with new API keys
        const authResult = await service.authenticate(updates.apiKeys);
        if (!authResult.success) {
          throw new Error(`Authentication failed: ${authResult.error}`);
        }
      }
      
      // Update service configuration if method exists
      if (service.updateSettings) {
        await service.updateSettings(updates.settings || {});
      }
    }
  }
  
  /**
   * Disconnect and cleanup service
   */
  async disconnectService(type: IntegrationType, config: IntegrationConfig): Promise<void> {
    const key = `${type}-${config.id}`;
    const service = this.services.get(key);
    
    if (service) {
      try {
        if (service.disconnect) {
          await service.disconnect();
        }
        
        // Close connection if available
        const connection = this.connections.get(config.id);
        if (connection && connection.end) {
          connection.end();
        }
      } catch (error) {
        console.error(`Failed to disconnect service for ${config.id}:`, error);
        // Continue with cleanup even if disconnect fails
      } finally {
        const configId = key.split('-').slice(1).join('-');
        this.services.delete(key);
        this.connections.delete(config.id);
      }
    }
  }
  
  /**
   * Cleanup all services (for server shutdown)
   */
  async cleanupAll(): Promise<void> {
    const disconnectPromises: Promise<void>[] = [];
    
    for (const [key, service] of this.services.entries()) {
      try {
        if (service.disconnect) {
          disconnectPromises.push(service.disconnect());
        }
        
        // Close connection if available
        const configId = key.split('-')[1];
        const connection = this.connections.get(configId);
        if (connection && connection.end) {
          connection.end();
        }
      } catch (error) {
        console.error(`Failed to disconnect service ${key}:`, error);
      }
    }
    
    // Wait for all disconnect operations to complete
    await Promise.all(disconnectPromises);
    
    // Clear registries
    this.services.clear();
    this.connections.clear();
  }
}

// Global service manager instance
const serviceManager = new ServiceManager();

// TODO: Replace with persistent storage (database, file-based, or external service)
// For now, use in-memory storage which will be lost on server restart
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
      message: process.env.NODE_ENV === 'development'
        ? (error instanceof Error ? error.message : 'Unknown error')
        : 'An unexpected error occurred'
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

    try {
      // Use service manager to initialize
      await serviceManager.getService(type, config);
      
      // Mark as active if initialization succeeded
      config.status = 'active';
      integrationsStorage.set(id, config);
    } catch (initError) {
      // Mark as error if initialization failed
      config.status = 'error';
      integrationsStorage.set(id, config);
      
      return NextResponse.json({
        success: false,
        error: 'Failed to initialize integration',
        details: initError instanceof Error ? initError.message : 'Unknown error'
      }, { status: 400 });
    }

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
      message: process.env.NODE_ENV === 'development'
        ? (error instanceof Error ? error.message : 'Unknown error')
        : 'An unexpected error occurred'
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

    try {
      // Use service manager to update
      await serviceManager.updateService(existing.type, existing, updates);
    } catch (updateError) {
      updatedConfig.status = 'error';
      integrationsStorage.set(id, updatedConfig);
      
      return NextResponse.json({
        success: false,
        error: 'Failed to update integration',
        details: updateError instanceof Error ? updateError.message : 'Unknown error'
      }, { status: 400 });
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
      message: process.env.NODE_ENV === 'development'
        ? (error instanceof Error ? error.message : 'Unknown error')
        : 'An unexpected error occurred'
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

    try {
      // Use service manager to disconnect
      await serviceManager.disconnectService(existing.type, existing);
    } catch (disconnectError) {
      console.error(`Failed to disconnect integration ${id}:`, disconnectError);
      // Continue with deletion even if disconnect fails, but log the error
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
      message: process.env.NODE_ENV === 'development'
        ? (error instanceof Error ? error.message : 'Unknown error')
        : 'An unexpected error occurred'
    }, { status: 500 });
  }
}

// Handle server shutdown cleanup
if (typeof process !== 'undefined' && process.on) {
  const handleShutdown = async (signal: string) => {
    console.log(`Received ${signal}, cleaning up service instances...`);
    try {
      await serviceManager.cleanupAll();
    } catch (error) {
      console.error('Error during cleanup:', error);
    } finally {
      process.exit(0);
    }
  };

  process.on('SIGTERM', async () => {
    await handleShutdown('SIGTERM');
  });

  process.on('SIGINT', async () => {
    await handleShutdown('SIGINT');
  });
}

// Handle server shutdown cleanup
if (typeof process !== 'undefined') {
  process.on('SIGTERM', async () => {
    console.log('Received SIGTERM, cleaning up service instances...');
    await serviceManager.cleanupAll();
    process.exit(0);
  });
  
  process.on('SIGINT', async () => {
    console.log('Received SIGINT, cleaning up service instances...');
    await serviceManager.cleanupAll();
    process.exit(0);
  });
}