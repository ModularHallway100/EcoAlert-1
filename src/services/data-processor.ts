import { LRUCache } from 'lru-cache';
import { z } from 'zod';

// Define schemas for data validation
const sensorReadingSchema = z.object({
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
    timestamp: z.date(),
  }),
  deviceInfo: z.object({
    batteryLevel: z.number().min(0).max(100).optional(),
    status: z.enum(['active', 'inactive', 'maintenance', 'error']),
    lastMaintenance: z.date().optional(),
  }).optional(),
});

// Cache configuration
const cache = new LRUCache<string, any>({
  ttl: 1000 * 60 * 5, // 5 minutes
  max: 500, // Maximum 500 cached items
  allowStale: true,
});

// Analytics data structure
interface AnalyticsData {
  sensorId: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  stats: {
    averageAQI: number;
    maxAQI: number;
    minAQI: number;
    readingsCount: number;
    lastUpdate: Date;
    dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
  };
  trends: {
    aqiTrend: 'increasing' | 'decreasing' | 'stable';
    changeRate: number;
    prediction?: number;
  };
}

export class DataProcessor {
  private static instance: DataProcessor;
  private analyticsData: Map<string, AnalyticsData> = new Map();
  private processingQueue: Array<{
    data: any;
    resolve: (value: any) => void;
    reject: (reason?: any) => void;
  }> = [];
  private isProcessing = false;

  private constructor() {}

  public static getInstance(): DataProcessor {
    if (!DataProcessor.instance) {
      DataProcessor.instance = new DataProcessor();
    }
    return DataProcessor.instance;
  }

  // Process incoming sensor data with validation and caching
  public async processSensorData(data: unknown): Promise<{
    success: boolean;
    id?: string;
    error?: string;
    analytics?: AnalyticsData;
  }> {
    try {
      // Validate incoming data
      const validatedData = sensorReadingSchema.parse(data);
      const id = crypto.randomUUID();

      // Check cache for recent data from the same sensor
      const cacheKey = `sensor:${validatedData.sensorId}:${Math.floor(validatedData.readings.timestamp.getTime() / 60000)}`;
      const cached = cache.get(cacheKey);
      
      if (cached) {
        return {
          success: true,
          id,
          analytics: cached,
        };
      }

      // Add to processing queue
      return new Promise((resolve, reject) => {
        this.processingQueue.push({
          data: validatedData,
          resolve,
          reject,
        });
        
        if (!this.isProcessing) {
          this.processQueue();
        }
      });

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Process the data queue asynchronously
  private async processQueue(): Promise<void> {
    if (this.processingQueue.length === 0) {
      this.isProcessing = false;
      return;
    }

    this.isProcessing = true;
    
    while (this.processingQueue.length > 0) {
      const item = this.processingQueue.shift();
      if (!item) continue;

      try {
        const analytics = this.generateAnalytics(item.data);
        item.resolve({
          success: true,
          id: crypto.randomUUID(),
          analytics,
        });

        // Cache the analytics data
        const cacheKey = `sensor:${item.data.sensorId}:${Math.floor(item.data.readings.timestamp.getTime() / 60000)}`;
        cache.set(cacheKey, analytics);

      } catch (error) {
        item.reject(error);
      }
    }

    this.isProcessing = false;
  }

  // Generate analytics from sensor data
  private generateAnalytics(data: z.infer<typeof sensorReadingSchema>): AnalyticsData {
    const existingAnalytics = this.analyticsData.get(data.sensorId);
    
    const newStats = {
      averageAQI: data.readings.aqi,
      maxAQI: data.readings.aqi,
      minAQI: data.readings.aqi,
      readingsCount: 1,
      lastUpdate: data.readings.timestamp,
      dataQuality: this.calculateDataQuality(data) as 'excellent' | 'good' | 'fair' | 'poor',
    };

    if (existingAnalytics) {
      // Update existing analytics
      const totalReadings = existingAnalytics.stats.readingsCount + 1;
      newStats.averageAQI = Math.round(
        ((existingAnalytics.stats.averageAQI * existingAnalytics.stats.readingsCount) + data.readings.aqi) / totalReadings
      );
      newStats.maxAQI = Math.max(existingAnalytics.stats.maxAQI, data.readings.aqi);
      newStats.minAQI = Math.min(existingAnalytics.stats.minAQI, data.readings.aqi);
      newStats.readingsCount = totalReadings;
      newStats.lastUpdate = data.readings.timestamp;
    }

    const trends = this.calculateTrends(data.sensorId, newStats);
    
    const analytics: AnalyticsData = {
      sensorId: data.sensorId,
      location: data.location,
      stats: newStats,
      trends,
    };

    // Store analytics data
    this.analyticsData.set(data.sensorId, analytics);
    
    return analytics;
  }

  // Calculate data quality based on sensor readings and device status
  private calculateDataQuality(data: z.infer<typeof sensorReadingSchema>): string {
    let score = 100;

    // Check for missing readings
    const missingReadings = [
      data.readings.pm25 === undefined,
      data.readings.pm10 === undefined,
      data.readings.ozone === undefined,
      data.readings.nitrogenDioxide === undefined,
    ].filter(Boolean).length;
    
    score -= missingReadings * 10;

    // Check device status
    if (data.deviceInfo?.status === 'error') {
      score -= 50;
    } else if (data.deviceInfo?.status === 'maintenance') {
      score -= 20;
    }

    // Check battery level
    if (data.deviceInfo?.batteryLevel && data.deviceInfo.batteryLevel < 20) {
      score -= 15;
    }

    if (score >= 90) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 50) return 'fair';
    return 'poor';
  }

  // Calculate trends from historical data
  private calculateTrends(sensorId: string, stats: any): AnalyticsData['trends'] {
    const historicalData = Array.from(this.analyticsData.values()).filter(
      data => data.sensorId === sensorId
    );

    if (historicalData.length < 3) {
      return {
        aqiTrend: 'stable',
        changeRate: 0,
      };
    }

    // Get recent readings to calculate trend
    const recentReadings = historicalData
      .sort((a, b) => b.stats.lastUpdate.getTime() - a.stats.lastUpdate.getTime())
      .slice(0, 5);

    const readings = recentReadings.map(r => r.stats.averageAQI);
    const change = readings[readings.length - 1] - readings[0];
    const changeRate = change / readings[0] * 100;

    let trend: 'increasing' | 'decreasing' | 'stable';
    if (Math.abs(changeRate) < 5) {
      trend = 'stable';
    } else if (changeRate > 0) {
      trend = 'increasing';
    } else {
      trend = 'decreasing';
    }

    // Simple prediction (linear regression)
    const prediction = readings[readings.length - 1] + (change * 0.5);

    return {
      aqiTrend: trend,
      changeRate: Math.round(changeRate * 100) / 100,
      prediction: Math.round(prediction),
    };
  }

  // Get analytics for a specific sensor
  public getSensorAnalytics(sensorId: string): AnalyticsData | null {
    return this.analyticsData.get(sensorId) || null;
  }

  // Get analytics for all sensors in a specific area
  public getAreaAnalytics(
    latitude: number,
    longitude: number,
    radius: number = 10 // kilometers
  ): AnalyticsData[] {
    return Array.from(this.analyticsData.values()).filter(analytics => {
      const distance = this.calculateDistance(
        latitude,
        longitude,
        analytics.location.latitude,
        analytics.location.longitude
      );
      return distance <= radius;
    });
  }

  // Calculate distance between two coordinates using Haversine formula
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Get overall system health
  public getSystemHealth() {
    const totalSensors = this.analyticsData.size;
    const activeSensors = Array.from(this.analyticsData.values()).filter(
      data => data.stats.dataQuality === 'excellent' || data.stats.dataQuality === 'good'
    ).length;

    return {
      totalSensors,
      activeSensors,
      healthPercentage: Math.round((activeSensors / totalSensors) * 100),
      uptime: '99.9%', // Mock uptime for development
    };
  }

  // Cleanup old data
  public cleanupOldData(olderThan: number = 7): number {
    const cutoffDate = new Date(Date.now() - olderThan * 24 * 60 * 60 * 1000);
    let cleanedCount = 0;

    for (const [sensorId, analytics] of this.analyticsData.entries()) {
      if (analytics.stats.lastUpdate < cutoffDate) {
        this.analyticsData.delete(sensorId);
        cleanedCount++;
      }
    }

    // Also clean cache
    cache.clear();

    return cleanedCount;
  }
}

// Export singleton instance
export const dataProcessor = DataProcessor.getInstance();