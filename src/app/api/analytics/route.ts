import { NextRequest, NextResponse } from 'next/server';
import { dataProcessor } from '@/services/data-processor';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sensorId = searchParams.get('sensorId');
    const latitude = searchParams.get('latitude');
    const longitude = searchParams.get('longitude');
    const radius = searchParams.get('radius');
    const includeTrends = searchParams.get('includeTrends') === 'true';
    const includePredictions = searchParams.get('includePredictions') === 'true';

    // Get system health overview
    const systemHealth = dataProcessor.getSystemHealth();

    if (sensorId) {
      // Get analytics for a specific sensor
      const analytics = dataProcessor.getSensorAnalytics(sensorId);
      
      if (!analytics) {
        return NextResponse.json({
          success: false,
          error: 'Sensor not found or no data available',
        }, { status: 404 });
      }

      const response = {
        success: true,
        data: analytics,
        systemHealth,
      };

      return NextResponse.json(response);
    } else if (latitude && longitude) {
      // Get analytics for sensors in a specific area
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      const rad = radius ? parseFloat(radius) : 10; // Default 10km radius

      if (isNaN(lat) || isNaN(lng)) {
        return NextResponse.json({
          success: false,
          error: 'Invalid latitude or longitude',
        }, { status: 400 });
      }

      const areaAnalytics = dataProcessor.getAreaAnalytics(lat, lng, rad);
      
      // Calculate area-wide statistics
      const totalSensors = areaAnalytics.length;
      const averageAQI = totalSensors > 0 
        ? Math.round(areaAnalytics.reduce((sum, a) => sum + a.stats.averageAQI, 0) / totalSensors)
        : 0;
      
      const maxAQI = totalSensors > 0 
        ? Math.max(...areaAnalytics.map(a => a.stats.averageAQI))
        : 0;
      
      const minAQI = totalSensors > 0 
        ? Math.min(...areaAnalytics.map(a => a.stats.averageAQI))
        : 0;

      const response = {
        success: true,
        data: {
          area: {
            center: { latitude: lat, longitude: lng },
            radius: rad,
            totalSensors,
          },
          statistics: {
            averageAQI,
            maxAQI,
            minAQI,
          },
          sensors: includeTrends ? areaAnalytics : areaAnalytics.map(a => ({
            sensorId: a.sensorId,
            location: a.location,
            stats: a.stats,
          })),
        },
        systemHealth,
      };

      return NextResponse.json(response);
    } else {
      // Get overall analytics for all sensors
      const allAnalytics = Array.from(dataProcessor.getSystemHealth().totalSensors > 0 
        ? Array.from(dataProcessor['analyticsData'].values())
        : []
      );

      // Calculate overall statistics
      const totalSensors = allAnalytics.length;
      const averageAQI = totalSensors > 0 
        ? Math.round(allAnalytics.reduce((sum, a) => sum + a.stats.averageAQI, 0) / totalSensors)
        : 0;
      
      const maxAQI = totalSensors > 0 
        ? Math.max(...allAnalytics.map(a => a.stats.averageAQI))
        : 0;
      
      const minAQI = totalSensors > 0 
        ? Math.min(...allAnalytics.map(a => a.stats.averageAQI))
        : 0;

      // Group by AQI category for better insights
      const aqiCategories = {
        good: allAnalytics.filter(a => a.stats.averageAQI <= 50).length,
        moderate: allAnalytics.filter(a => a.stats.averageAQI > 50 && a.stats.averageAQI <= 100).length,
        unhealthySensitive: allAnalytics.filter(a => a.stats.averageAQI > 100 && a.stats.averageAQI <= 150).length,
        unhealthy: allAnalytics.filter(a => a.stats.averageAQI > 150 && a.stats.averageAQI <= 200).length,
        veryUnhealthy: allAnalytics.filter(a => a.stats.averageAQI > 200 && a.stats.averageAQI <= 300).length,
        hazardous: allAnalytics.filter(a => a.stats.averageAQI > 300).length,
      };

      const response = {
        success: true,
        data: {
          overview: {
            totalSensors,
            averageAQI,
            maxAQI,
            minAQI,
            aqiCategories,
          },
          systemHealth,
          recentSensors: allAnalytics
            .sort((a, b) => b.stats.lastUpdate.getTime() - a.stats.lastUpdate.getTime())
            .slice(0, 10),
        },
      };

      return NextResponse.json(response);
    }

  } catch (error) {
    console.error('Error fetching analytics:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Process sensor data through the data processor
    const result = await dataProcessor.processSensorData(body);
    
    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error,
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: result.analytics,
      message: 'Sensor data processed successfully',
    });

  } catch (error) {
    console.error('Error processing analytics data:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');

    const cleanedCount = dataProcessor.cleanupOldData(days);

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${cleanedCount} old sensor records older than ${days} days`,
    });

  } catch (error) {
    console.error('Error cleaning up analytics data:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}