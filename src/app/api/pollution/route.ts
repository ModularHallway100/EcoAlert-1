import { NextResponse } from 'next/server';
import type { PollutionDataPoint } from '@/lib/pollution-types';
import type { Coordinates } from '@/lib/types';
import { POLLUTANTS } from '@/lib/constants';

// Simulation constants
const SIMULATION_CYCLE_TIME = 60 * 1000; // 60 seconds for a full cycle

// Simulate a wave pattern for a given range with more realistic variations
const simulateWave = (min: number, max: number, offset: number = 0): number => {
    const now = Date.now();
    const cycleProgress = ((now + offset) % SIMULATION_CYCLE_TIME) / SIMULATION_CYCLE_TIME; // 0 to 1
    const wave = Math.sin(cycleProgress * Math.PI * 2); // -1 to 1
    const scaledWave = (wave + 1) / 2; // 0 to 1
    
    // Add some random variation for realism
    const randomFactor = 0.9 + Math.random() * 0.2; // 0.9 to 1.1
    const value = min + scaledWave * (max - min) * randomFactor;
    
    // Ensure value stays within bounds
    return Math.max(min, Math.min(max, value));
};

// Simulate more realistic daily patterns
const simulateDailyPattern = (min: number, max: number, hourOffset: number = 0): number => {
    const now = Date.now();
    const hour = ((now / (1000 * 60 * 60)) + hourOffset) % 24; // Current hour (0-23)
    
    // Create a realistic daily pattern (e.g., higher pollution during rush hours)
    const dailyPattern = Math.sin((hour - 6) * Math.PI / 12); // Peak at 6 PM
    const normalizedPattern = (dailyPattern + 1) / 2; // 0 to 1
    
    // Add some random variation
    const randomFactor = 0.9 + Math.random() * 0.2;
    const value = min + normalizedPattern * (max - min) * randomFactor;
    
    return Math.max(min, Math.min(max, value));
};

// Simulate a grid of pollution data points
const generatePollutionData = (center: Coordinates, radius: number = 10000, count: number = 100): PollutionDataPoint[] => {
  const data: PollutionDataPoint[] = [];
  
  for (let i = 0; i < count; i++) {
    // Generate random points within the radius
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * radius;
    
    const latitude = center.latitude + (distance / 111000) * Math.cos(angle); // Convert meters to degrees (approximate)
    const longitude = center.longitude + (distance / 111000) * Math.sin(angle);
    
    // Base AQI with location-based variation
    const baseAQI = simulateDailyPattern(30, 180, (latitude + longitude) * 10000);
    const aqiVariation = Math.sin(latitude * 10) * 30 + Math.cos(longitude * 10) * 20;
    const aqi = Math.max(10, Math.min(500, baseAQI + aqiVariation + (Math.random() - 0.5) * 40));
    
    // Generate pollutant values based on AQI
    const pm25 = Math.max(0, aqi * 0.7 + (Math.random() - 0.5) * 20);
    const pm10 = Math.max(0, aqi * 0.9 + (Math.random() - 0.5) * 30);
    const o3 = Math.max(0, aqi * 0.5 + (Math.random() - 0.5) * 40);
    const no2 = Math.max(0, aqi * 0.6 + (Math.random() - 0.5) * 30);
    const so2 = Math.max(0, aqi * 0.2 + (Math.random() - 0.5) * 15);
    const co = Math.max(0, aqi * 0.3 + (Math.random() - 0.5) * 25);
    
    data.push({
      id: `point-${i}-${Date.now()}`,
      location: { latitude, longitude },
      aqi: Math.round(aqi),
      pm25: Math.round(pm25),
      pm10: Math.round(pm10),
      o3: Math.round(o3),
      no2: Math.round(no2),
      so2: Math.round(so2),
      co: Math.round(co),
      timestamp: new Date().toISOString(),
      source: 'simulated'
    });
  }
  
  return data;
};

// Calculate heatmap grid cells
const generateHeatmapGrid = (data: PollutionDataPoint[], gridSize: number = 50): { 
  cells: Array<{ 
    bounds: { north: number; south: number; east: number; west: number; };
    center: Coordinates;
    value: number;
    count: number;
  }>;
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
} => {
  if (data.length === 0) {
    return {
      cells: [],
      minLat: 0,
      maxLat: 0,
      minLng: 0,
      maxLng: 0
    };
  }
  
  const lats = data.map(p => p.location.latitude);
  const lngs = data.map(p => p.location.longitude);
  
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  
  const latStep = (maxLat - minLat) / gridSize;
  const lngStep = (maxLng - minLng) / gridSize;
  
  const cells = [];
  
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const north = minLat + i * latStep;
      const south = minLat + (i + 1) * latStep;
      const west = minLng + j * lngStep;
      const east = minLng + (j + 1) * lngStep;
      
      // Find data points within this cell
      const cellData = data.filter(p => 
        p.location.latitude >= north && 
        p.location.latitude <= south && 
        p.location.longitude >= west && 
        p.location.longitude <= east
      );
      
      if (cellData.length > 0) {
        const avgValue = cellData.reduce((sum, p) => sum + p.aqi, 0) / cellData.length;
        
        cells.push({
          bounds: { north, south, east, west },
          center: {
            latitude: north + latStep / 2,
            longitude: west + lngStep / 2
          },
          value: Math.round(avgValue),
          count: cellData.length
        });
      }
    }
  }
  
  return {
    cells,
    minLat,
    maxLat,
    minLng,
    maxLng
  };
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radius = searchParams.get('radius');
    const count = searchParams.get('count');
    const format = searchParams.get('format'); // 'points' or 'heatmap'
    
    const center: Coordinates = {
      latitude: lat ? parseFloat(lat) : 40.7128, // Default to NYC
      longitude: lng ? parseFloat(lng) : -74.0060
    };
    
    const radiusMeters = radius ? parseInt(radius) : 10000; // 10km default
    const pointCount = count ? parseInt(count) : 100;
    
    // Generate pollution data
    const pollutionData = generatePollutionData(center, radiusMeters, pointCount);
    
    // Add some "hotspots" with higher pollution
    for (let i = 0; i < 3; i++) {
      const hotspotLat = center.latitude + (Math.random() - 0.5) * 0.02;
      const hotspotLng = center.longitude + (Math.random() - 0.5) * 0.02;
      const hotspotAQI = 200 + Math.random() * 100;
      
      pollutionData.push({
        id: `hotspot-${i}-${Date.now()}`,
        location: { latitude: hotspotLat, longitude: hotspotLng },
        aqi: Math.round(hotspotAQI),
        pm25: Math.round(hotspotAQI * 0.8 + (Math.random() - 0.5) * 30),
        pm10: Math.round(hotspotAQI * 1.0 + (Math.random() - 0.5) * 40),
        o3: Math.round(hotspotAQI * 0.6 + (Math.random() - 0.5) * 50),
        no2: Math.round(hotspotAQI * 0.7 + (Math.random() - 0.5) * 40),
        so2: Math.round(hotspotAQI * 0.3 + (Math.random() - 0.5) * 20),
        co: Math.round(hotspotAQI * 0.4 + (Math.random() - 0.5) * 30),
        timestamp: new Date().toISOString(),
        source: 'simulated'
      });
    }
    
    // Return data in requested format
    if (format === 'heatmap') {
      const { cells } = generateHeatmapGrid(pollutionData);
      
      return NextResponse.json({
        type: 'heatmap',
        center,
        radius: radiusMeters,
        cells,
        metadata: {
          totalPoints: pollutionData.length,
          gridSize: cells.length,
          timestamp: new Date().toISOString()
        }
      }, {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=300',
        }
      });
    } else {
      // Return individual data points
      return NextResponse.json({
        type: 'points',
        center,
        radius: radiusMeters,
        points: pollutionData,
        metadata: {
          totalPoints: pollutionData.length,
          timestamp: new Date().toISOString()
        }
      }, {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=300',
        }
      });
    }
    
  } catch (error) {
    console.error('Pollution API Error:', error);
    return NextResponse.json({ 
      message: 'Error fetching pollution data',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 500 
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, data } = body;
    
    switch (action) {
      case 'report_pollution':
        // Handle user pollution report
        return NextResponse.json({
          success: true,
          message: 'Pollution report submitted',
          reportId: `report-${Date.now()}`
        });
        
      case 'get_history':
        // Handle historical data request
        const { startDate, endDate, location } = data;
        return NextResponse.json({
          type: 'history',
          data: [], // Would return historical data
          metadata: {
            startDate,
            endDate,
            location
          }
        });
        
      default:
        return NextResponse.json({ 
          message: 'Unknown action' 
        }, { 
          status: 400 
        });
    }
    
  } catch (error) {
    console.error('Pollution API Error:', error);
    return NextResponse.json({ 
      message: 'Error processing request',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 500 
    });
  }
}