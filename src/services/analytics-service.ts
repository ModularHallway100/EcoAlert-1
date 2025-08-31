import { LRUCache } from 'lru-cache';
import { dataProcessor } from './data-processor';

// Cache for analytics results
const analyticsCache = new LRUCache<string, any>({
  ttl: 1000 * 60 * 15, // 15 minutes
  max: 1000, // Maximum 1000 cached analytics results
  allowStale: true,
});

// Define report types
export type ReportType = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'custom';
export type ReportFormat = 'pdf' | 'csv' | 'json' | 'xlsx';
export type MetricType = 'aqi' | 'pm25' | 'pm10' | 'ozone' | 'no2' | 'so2' | 'co' | 'temperature' | 'humidity' | 'pressure';

export interface ReportConfig {
  id: string;
  name: string;
  type: ReportType;
  format: ReportFormat;
  metrics: MetricType[];
  dateRange: {
    start: Date;
    end: Date;
  };
  filters: {
    sensorIds?: string[];
    locations?: Array<{ latitude: number; longitude: number; radius: number }>;
    dataQuality?: ('excellent' | 'good' | 'fair' | 'poor')[];
  };
  includeCharts: boolean;
  includePredictions: boolean;
  includeRecommendations: boolean;
}

export interface AnalyticsResult {
  period: {
    start: Date;
    end: Date;
  };
  summary: {
    totalReadings: number;
    averageAQI: number;
    maxAQI: number;
    minAQI: number;
    dataPoints: number;
    coverage: number;
  };
  metrics: {
    [key in MetricType]: {
      average: number;
      max: number;
      min: number;
      trend: 'increasing' | 'decreasing' | 'stable';
      changeRate: number;
      percentiles: { p25: number; p50: number; p75: number; p95: number; p99: number };
    };
  };
  trends: {
    aqiTrend: { direction: 'up' | 'down' | 'stable'; magnitude: number; prediction?: number };
    seasonalPatterns?: { month: number; aqi: number }[];
    dailyPatterns?: { hour: number; aqi: number }[];
  };
  alerts: {
    critical: number;
    warnings: number;
    info: number;
  };
  recommendations: string[];
  dataQuality: {
    excellent: number;
    good: number;
    fair: number;
    poor: number;
  };
}

export class AnalyticsService {
  private static instance: AnalyticsService;

  private constructor() {}

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  // Generate analytics report
  public async generateReport(config: ReportConfig): Promise<{
    success: boolean;
    result?: AnalyticsResult;
    error?: string;
    cacheKey?: string;
  }> {
    try {
      // Generate cache key
      const cacheKey = this.generateCacheKey(config);
      
      // Check cache first
      const cached = analyticsCache.get(cacheKey);
      if (cached) {
        return {
          success: true,
          result: cached,
          cacheKey,
        };
      }

      // Generate analytics
      const result = await this.calculateAnalytics(config);
      
      // Cache the result
      analyticsCache.set(cacheKey, result);
      
      return {
        success: true,
        result,
        cacheKey,
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Calculate analytics based on configuration
  private async calculateAnalytics(config: ReportConfig): Promise<AnalyticsResult> {
    // Get all sensor data within the date range
    const allData = this.getSensorDataInRange(config.dateRange.start, config.dateRange.end);
    
    // Apply filters
    const filteredData = this.applyFilters(allData, config.filters);
    
    // Calculate summary statistics
    const summary = this.calculateSummary(filteredData);
    
    // Calculate metrics
    const metrics = this.calculateMetrics(filteredData, config.metrics);
    
    // Calculate trends
    const trends = await this.calculateTrends(filteredData, config);
    
    // Generate alerts
    const alerts = this.generateAlerts(filteredData);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(summary, trends, alerts);
    
    // Calculate data quality distribution
    const dataQuality = this.calculateDataQuality(filteredData);
    
    return {
      period: config.dateRange,
      summary,
      metrics,
      trends,
      alerts,
      recommendations,
      dataQuality,
    };
  }

  // Generate cache key for analytics
  private generateCacheKey(config: ReportConfig): string {
    const filterString = JSON.stringify(config.filters);
    return `analytics:${config.type}:${config.dateRange.start.toISOString()}:${config.dateRange.end.toISOString()}:${filterString}`;
  }

  // Get sensor data within date range (mock implementation)
  private getSensorDataInRange(startDate: Date, endDate: Date): any[] {
    // In a real implementation, this would query the database
    const mockData = [];
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    for (let i = 0; i < Math.min(daysDiff * 24, 1000); i++) {
      mockData.push({
        sensorId: `sensor-${Math.floor(Math.random() * 100)}`,
        readings: {
          aqi: Math.floor(Math.random() * 200) + 50,
          pm25: Math.random() * 50 + 10,
          pm10: Math.random() * 100 + 20,
          ozone: Math.random() * 100 + 20,
          no2: Math.random() * 50 + 5,
          so2: Math.random() * 20 + 1,
          co: Math.random() * 10 + 0.5,
          temperature: Math.random() * 20 + 20,
          humidity: Math.random() * 40 + 30,
          pressure: Math.random() * 50 + 980,
        },
        timestamp: new Date(startDate.getTime() + i * 60 * 60 * 1000),
        location: {
          latitude: 24.7136 + (Math.random() - 0.5) * 0.1,
          longitude: 46.6753 + (Math.random() - 0.5) * 0.1,
        },
        deviceInfo: {
          status: Math.random() > 0.1 ? 'active' : 'maintenance',
          batteryLevel: Math.random() * 100,
        },
      });
    }
    
    return mockData;
  }

  // Apply filters to sensor data
  private applyFilters(data: any[], filters: ReportConfig['filters']): any[] {
    let filtered = [...data];
    
    if (filters.sensorIds && filters.sensorIds.length > 0) {
      filtered = filtered.filter(item => filters.sensorIds!.includes(item.sensorId));
    }
    
    if (filters.locations && filters.locations.length > 0) {
      filtered = filtered.filter(item => {
        return filters.locations!.some(location => {
          const distance = this.calculateDistance(
            item.location.latitude,
            item.location.longitude,
            location.latitude,
            location.longitude
          );
          return distance <= location.radius;
        });
      });
    }
    
    if (filters.dataQuality && filters.dataQuality.length > 0) {
      filtered = filtered.filter(item => {
        const quality = this.assessDataQuality(item);
        return filters.dataQuality!.includes(quality);
      });
    }
    
    return filtered;
  }

  // Calculate summary statistics
  private calculateSummary(data: any[]) {
    if (data.length === 0) {
      return {
        totalReadings: 0,
        averageAQI: 0,
        maxAQI: 0,
        minAQI: 0,
        dataPoints: 0,
        coverage: 0,
      };
    }

    const aqiValues = data.map(d => d.readings.aqi);
    return {
      totalReadings: data.length,
      averageAQI: Math.round(aqiValues.reduce((sum, aqi) => sum + aqi, 0) / aqiValues.length),
      maxAQI: Math.max(...aqiValues),
      minAQI: Math.min(...aqiValues),
      dataPoints: data.length,
      coverage: Math.round((data.length / (data.length * 1.2)) * 100), // Mock coverage calculation
    };
  }

  // Calculate metrics statistics
  private calculateMetrics(data: any[], requestedMetrics: MetricType[]) {
    const metrics: AnalyticsResult['metrics'] = {} as any;
    
    requestedMetrics.forEach(metric => {
      const values = data.map(d => d.readings[metric]).filter(v => v !== undefined);
      
      if (values.length > 0) {
        const sorted = values.sort((a, b) => a - b);
        const trend = this.calculateTrend(values);
        
        metrics[metric] = {
          average: Math.round(values.reduce((sum, val) => sum + val, 0) / values.length),
          max: Math.max(...values),
          min: Math.min(...values),
          trend: trend.trend,
          changeRate: trend.changeRate,
          percentiles: {
            p25: sorted[Math.floor(sorted.length * 0.25)],
            p50: sorted[Math.floor(sorted.length * 0.5)],
            p75: sorted[Math.floor(sorted.length * 0.75)],
            p95: sorted[Math.floor(sorted.length * 0.95)],
            p99: sorted[Math.floor(sorted.length * 0.99)],
          },
        };
      } else {
        metrics[metric] = {
          average: 0,
          max: 0,
          min: 0,
          trend: 'stable',
          changeRate: 0,
          percentiles: { p25: 0, p50: 0, p75: 0, p95: 0, p99: 0 },
        };
      }
    });
    
    return metrics;
  }

  // Calculate trends
  private async calculateTrends(data: any[], config: ReportConfig): Promise<AnalyticsResult['trends']> {
    const aqiValues = data.map(d => d.readings.aqi);
    const aqiTrend = this.calculateTrend(aqiValues);
    
    // Generate seasonal patterns (mock data)
    const seasonalPatterns = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      aqi: Math.floor(Math.random() * 100) + 50,
    }));
    
    // Generate daily patterns (mock data)
    const dailyPatterns = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      aqi: Math.floor(Math.random() * 50) + 50,
    }));
    
    return {
      aqiTrend: {
        direction: aqiTrend.trend === 'increasing' ? 'up' : aqiTrend.trend === 'decreasing' ? 'down' : 'stable',
        magnitude: Math.abs(aqiTrend.changeRate),
        prediction: config.includePredictions ? aqiTrend.changeRate > 0 
          ? aqiValues[aqiValues.length - 1] + (aqiTrend.changeRate * 5) 
          : aqiValues[aqiValues.length - 1] + (aqiTrend.changeRate * 5) : undefined,
      },
      seasonalPatterns,
      dailyPatterns,
    };
  }

  // Calculate trend for a metric
  private calculateTrend(values: number[]) {
    if (values.length < 2) {
      return { trend: 'stable' as const, changeRate: 0 };
    }
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    
    const changeRate = ((secondAvg - firstAvg) / firstAvg) * 100;
    
    let trend: 'increasing' | 'decreasing' | 'stable';
    if (Math.abs(changeRate) < 5) {
      trend = 'stable';
    } else if (changeRate > 0) {
      trend = 'increasing';
    } else {
      trend = 'decreasing';
    }
    
    return { trend, changeRate: Math.round(changeRate * 100) / 100 };
  }

  // Generate alerts based on data
  private generateAlerts(data: any[]) {
    const critical = data.filter(d => d.readings.aqi > 200).length;
    const warnings = data.filter(d => d.readings.aqi > 100 && d.readings.aqi <= 200).length;
    const info = data.filter(d => d.deviceInfo?.status === 'maintenance').length;
    
    return { critical, warnings, info };
  }

  // Generate recommendations based on analytics
  private generateRecommendations(summary: any, trends: any, alerts: any): string[] {
    const recommendations: string[] = [];
    
    // AQI-based recommendations
    if (summary.averageAQI > 100) {
      recommendations.push('Consider implementing air quality improvement measures in high-pollution areas');
    }
    
    // Trend-based recommendations
    if (trends.aqiTrend.direction === 'up' && trends.aqiTrend.magnitude > 10) {
      recommendations.push('Air quality is deteriorating - investigate pollution sources and implement mitigation strategies');
    }
    
    // Alert-based recommendations
    if (alerts.critical > 0) {
      recommendations.push('Critical air quality levels detected - activate emergency response protocols');
    }
    
    if (alerts.warnings > 0) {
      recommendations.push('Multiple sensors showing elevated pollution levels - monitor closely and issue public advisories');
    }
    
    // Sensor maintenance recommendations
    if (alerts.info > 0) {
      recommendations.push('Schedule maintenance for sensors showing maintenance status');
    }
    
    return recommendations;
  }

  // Calculate data quality distribution
  private calculateDataQuality(data: any[]) {
    const qualityCounts = { excellent: 0, good: 0, fair: 0, poor: 0 };
    
    data.forEach(item => {
      const quality = this.assessDataQuality(item);
      qualityCounts[quality]++;
    });
    
    return qualityCounts;
  }

  // Assess data quality of a reading
  private assessDataQuality(item: any): 'excellent' | 'good' | 'fair' | 'poor' {
    let score = 100;
    
    // Check for missing readings
    const missingReadings = [
      item.readings.pm25 === undefined,
      item.readings.pm10 === undefined,
      item.readings.ozone === undefined,
      item.readings.no2 === undefined,
    ].filter(Boolean).length;
    
    score -= missingReadings * 10;
    
    // Check device status
    if (item.deviceInfo?.status === 'error') {
      score -= 50;
    } else if (item.deviceInfo?.status === 'maintenance') {
      score -= 20;
    }
    
    // Check battery level
    if (item.deviceInfo?.batteryLevel && item.deviceInfo.batteryLevel < 20) {
      score -= 15;
    }
    
    if (score >= 90) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 50) return 'fair';
    return 'poor';
  }

  // Calculate distance between two coordinates
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

  // Export analytics to different formats
  public exportAnalytics(result: AnalyticsResult, format: ReportFormat): string {
    switch (format) {
      case 'json':
        return JSON.stringify(result, null, 2);
      
      case 'csv':
        return this.exportToCSV(result);
      
      case 'pdf':
        // In a real implementation, you would use a PDF library like jsPDF or Puppeteer
        return 'PDF export functionality would be implemented here';
      
      case 'xlsx':
        // In a real implementation, you would use a library like xlsx
        return 'Excel export functionality would be implemented here';
      
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  // Export to CSV format
  private exportToCSV(result: AnalyticsResult): string {
    const headers = ['Metric', 'Average', 'Max', 'Min', 'P25', 'P50', 'P75', 'P95', 'P99', 'Trend', 'Change Rate'];
    const rows = [headers.join(',')];
    
    Object.entries(result.metrics).forEach(([metric, data]: [string, any]) => {
      const row = [
        metric,
        data.average,
        data.max,
        data.min,
        data.percentiles.p25,
        data.percentiles.p50,
        data.percentiles.p75,
        data.percentiles.p95,
        data.percentiles.p99,
        data.trend,
        data.changeRate,
      ];
      rows.push(row.join(','));
    });
    
    return rows.join('\n');
  }

  // Get cached analytics
  public getCachedAnalytics(cacheKey: string): any | null {
    return analyticsCache.get(cacheKey) || null;
  }

  // Clear analytics cache
  public clearCache(): void {
    analyticsCache.clear();
  }

  // Get cache statistics
  public getCacheStats(): { totalItems: number; hitRate: string | number; memoryUsage: string } {
    return {
      totalItems: analyticsCache.size,
      hitRate: 'N/A', // Would need to track hits/misses in a real implementation
      memoryUsage: `${Math.round(analyticsCache.size * 100 / 1000)}% of limit`,
    };
  }
}

// Export singleton instance
export const analyticsService = AnalyticsService.getInstance();