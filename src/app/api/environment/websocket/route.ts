import { NextRequest, NextResponse } from 'next/server';

// Simple WebSocket server implementation for development
// In production, this would be replaced with a proper WebSocket server using libraries like ws or uWebSockets

interface WebSocketConnection {
  id: string;
  ws: any;
  lastPing: Date;
}

let connections: WebSocketConnection[] = [];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const connectionId = searchParams.get('connectionId') || crypto.randomUUID();

  // Create a mock WebSocket response for development
  // In production, you would upgrade the connection to a real WebSocket
  return NextResponse.json({
    success: true,
    connectionId,
    message: 'WebSocket endpoint available. Upgrade required for real-time connection.',
    endpoint: `/api/environment/websocket?connectionId=${connectionId}`,
    instructions: 'Use WebSocket client to connect to this endpoint for real-time sensor data.',
  });
}

// Helper function to broadcast data to all connected clients
export function broadcastSensorData(data: any) {
  // In production, this would send data to all WebSocket connections
  console.log('Broadcasting sensor data:', {
    timestamp: new Date().toISOString(),
    data: {
      sensorId: data.sensorId,
      aqi: data.readings.aqi,
      location: data.location,
      timestamp: data.readings.timestamp,
    },
  });

  // Simulate real-time broadcasting for development
  // In production, you would use actual WebSocket connections
  connections.forEach(connection => {
    if (connection.lastPing > new Date(Date.now() - 30000)) { // Only send to active connections
      try {
        connection.ws.send(JSON.stringify({
          type: 'sensor_data',
          data,
          timestamp: new Date().toISOString(),
        }));
      } catch (error) {
        console.error('Error broadcasting to client:', error);
        // Remove disconnected client
        connections = connections.filter(c => c.id !== connection.id);
      }
    }
  });
}

// Simulate receiving sensor data and broadcasting it
export async function simulateSensorData() {
  const mockData = {
    sensorId: `sensor-${Math.floor(Math.random() * 1000)}`,
    location: {
      latitude: 24.7136 + (Math.random() - 0.5) * 0.1,
      longitude: 46.6753 + (Math.random() - 0.5) * 0.1,
      address: 'Riyadh, Saudi Arabia',
    },
    readings: {
      aqi: Math.floor(Math.random() * 200) + 50,
      pm25: Math.random() * 50 + 10,
      pm10: Math.random() * 100 + 20,
      ozone: Math.random() * 100 + 20,
      nitrogenDioxide: Math.random() * 50 + 5,
      sulfurDioxide: Math.random() * 20 + 1,
      carbonMonoxide: Math.random() * 10 + 0.5,
      temperature: Math.random() * 20 + 20,
      humidity: Math.random() * 40 + 30,
      pressure: Math.random() * 50 + 980,
      timestamp: new Date(),
    },
    deviceInfo: {
      batteryLevel: Math.random() * 100,
      status: 'active' as const,
      lastMaintenance: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    },
  };

  broadcastSensorData(mockData);
  return mockData;
}

// Clean up inactive connections
export function cleanupInactiveConnections() {
  const now = new Date();
  connections = connections.filter(connection => {
    const isActive = connection.lastPing > new Date(now.getTime() - 60000); // 1 minute timeout
    if (!isActive) {
      console.log(`Cleaning up inactive connection: ${connection.id}`);
    }
    return isActive;
  });
}

// Get connection status
export function getConnectionStatus() {
  return {
    totalConnections: connections.length,
    activeConnections: connections.filter(c => 
      c.lastPing > new Date(Date.now() - 30000)
    ).length,
    connections: connections.map(c => ({
      id: c.id,
      lastPing: c.lastPing,
      isActive: c.lastPing > new Date(Date.now() - 30000),
    })),
  };
}

// Note: In a production environment, you would:
// 1. Use a proper WebSocket library (ws, uWebSockets, etc.)
// 2. Handle WebSocket upgrades properly
// 3. Implement connection pooling and load balancing
// 4. Add authentication and rate limiting
// 5. Implement proper error handling and reconnection logic