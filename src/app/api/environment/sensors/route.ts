import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Define schema for sensor data validation
const sensorDataSchema = z.object({
  sensorId: z.string(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
    address: z.string().optional(),
  }),
  readings: z.object({
    aqi: z.number().min(0).max(500),
    pm25: z.number().min(0),
    pm10: z.number().min(0),
    ozone: z.number().min(0),
    nitrogenDioxide: z.number().min(0),
    sulfurDioxide: z.number().min(0),
    carbonMonoxide: z.number().min(0),
    temperature: z.number().optional(),
    humidity: z.number().min(0).max(100).optional(),
    pressure: z.number().optional(),
    timestamp: z.date().optional(),
  }),
  deviceInfo: z.object({
    batteryLevel: z.number().min(0).max(100).optional(),
    status: z.enum(['active', 'inactive', 'maintenance', 'error']),
    lastMaintenance: z.date().optional(),
  }).optional(),
});

// In-memory storage for development (replace with database in production)
let sensorReadings: any[] = [];
const MAX_READINGS = 10000; // Limit memory usage

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = sensorDataSchema.parse(body);

    // Add timestamp if not provided
    const reading = {
      ...validatedData,
      id: crypto.randomUUID(),
      receivedAt: new Date(),
      readings: {
        ...validatedData.readings,
        timestamp: validatedData.readings.timestamp || new Date(),
      },
    };

    // Store the reading (in production, this would go to a database)
    sensorReadings.push(reading);
    
    // Keep only the most recent readings to manage memory
    if (sensorReadings.length > MAX_READINGS) {
      sensorReadings = sensorReadings.slice(-MAX_READINGS);
    }

    // Log the reading (in production, this would go to a logging service)
    console.log(`Received sensor reading from ${validatedData.sensorId} at ${new Date().toISOString()}`);

    // Return success response
    return NextResponse.json(
      { 
        success: true, 
        id: reading.id,
        message: 'Sensor data received successfully' 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error processing sensor data:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Validation failed',
          details: error.errors 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sensorId = searchParams.get('sensorId');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Filter readings by sensor ID if specified
    let filteredReadings = sensorReadings;
    if (sensorId) {
      filteredReadings = sensorReadings.filter(reading => reading.sensorId === sensorId);
    }

    // Apply pagination
    const paginatedReadings = filteredReadings
      .slice(offset, offset + limit)
      .sort((a, b) => b.receivedAt.getTime() - a.receivedAt.getTime());

    return NextResponse.json({
      success: true,
      data: paginatedReadings,
      pagination: {
        total: filteredReadings.length,
        limit,
        offset,
        hasMore: offset + limit < filteredReadings.length,
      },
    });

  } catch (error) {
    console.error('Error fetching sensor data:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}