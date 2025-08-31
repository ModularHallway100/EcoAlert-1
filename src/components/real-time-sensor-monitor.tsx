"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Activity, AlertTriangle, Battery, MapPin, RefreshCw, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface SensorData {
  sensorId: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  readings: {
    aqi: number;
    pm25: number;
    pm10: number;
    ozone: number;
    nitrogenDioxide: number;
    sulfurDioxide: number;
    carbonMonoxide: number;
    temperature?: number;
    humidity?: number;
    pressure?: number;
    timestamp: Date;
  };
  deviceInfo?: {
    batteryLevel?: number;
    status: 'active' | 'inactive' | 'maintenance' | 'error';
    lastMaintenance?: Date;
  };
}

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

interface RealTimeSensorMonitorProps {
  autoRefresh?: boolean;
  refreshInterval?: number;
  maxSensors?: number;
}

export function RealTimeSensorMonitor({
  autoRefresh = true,
  refreshInterval = 5000,
  maxSensors = 10,
}: RealTimeSensorMonitorProps) {
  const [sensors, setSensors] = useState<SensorData[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const refreshTimeoutRef = useRef<NodeJS.Timeout>();

  // Get AQI category and color
  const getAQICategory = (aqi: number): { category: string; color: string; bgColor: string } => {
    if (aqi <= 50) {
      return { category: 'Good', color: 'text-green-600', bgColor: 'bg-green-50' };
    } else if (aqi <= 100) {
      return { category: 'Moderate', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
    } else if (aqi <= 150) {
      return { category: 'Unhealthy for Sensitive Groups', color: 'text-orange-600', bgColor: 'bg-orange-50' };
    } else if (aqi <= 200) {
      return { category: 'Unhealthy', color: 'text-red-600', bgColor: 'bg-red-50' };
    } else if (aqi <= 300) {
      return { category: 'Very Unhealthy', color: 'text-purple-600', bgColor: 'bg-purple-50' };
    } else {
      return { category: 'Hazardous', color: 'text-red-800', bgColor: 'bg-red-100' };
    }
  };

  // Get trend icon
  const getTrendIcon = (trend: 'increasing' | 'decreasing' | 'stable') => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'inactive':
        return 'bg-gray-500';
      case 'maintenance':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Fetch sensor data
  const fetchSensorData = useCallback(async () => {
    try {
      const response = await fetch('/api/environment/sensors?limit=20');
      if (!response.ok) {
        throw new Error('Failed to fetch sensor data');
      }
      const data = await response.json();
      setSensors(data.data.slice(0, maxSensors));
    } catch (error) {
      console.error('Error fetching sensor data:', error);
    }
  }, [maxSensors]);

  // Fetch analytics data
  const fetchAnalyticsData = useCallback(async () => {
    try {
      const response = await fetch('/api/analytics');
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      const data = await response.json();
      if (data.success && data.data.recentSensors) {
        setAnalytics(data.data.recentSensors.slice(0, maxSensors));
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    }
  }, [maxSensors]);

  // Simulate real-time data updates
  const simulateRealTimeData = useCallback(() => {
    const mockData: SensorData = {
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
        status: 'active',
        lastMaintenance: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      },
    };

    setSensors(prev => {
      const existingIndex = prev.findIndex(s => s.sensorId === mockData.sensorId);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = mockData;
        return updated;
      }
      return [mockData, ...prev].slice(0, maxSensors);
    });

    setLastUpdate(new Date());
  }, [maxSensors]);

  // Connect to WebSocket
  const connectToWebSocket = useCallback(() => {
    // In a real implementation, you would connect to a WebSocket server here
    // For now, we'll simulate real-time updates with setInterval
    setIsConnected(true);
    setConnectionError(null);

    // Simulate WebSocket connection
    if (autoRefresh) {
      refreshTimeoutRef.current = setInterval(() => {
        simulateRealTimeData();
      }, refreshInterval);
    }
  }, [autoRefresh, refreshInterval, simulateRealTimeData]);

  // Disconnect from WebSocket
  const disconnectFromWebSocket = useCallback(() => {
    setIsConnected(false);
    if (refreshTimeoutRef.current) {
      clearInterval(refreshTimeoutRef.current);
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
  }, []);

  // Reconnect with exponential backoff
  const reconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    const delay = Math.min(1000 * Math.pow(2, 3), 30000); // Max 30 seconds
    reconnectTimeoutRef.current = setTimeout(() => {
      connectToWebSocket();
    }, delay);
  }, [connectToWebSocket]);

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([fetchSensorData(), fetchAnalyticsData()]);
      setIsLoading(false);
      connectToWebSocket();
    };

    initializeData();

    return () => {
      disconnectFromWebSocket();
    };
  }, [fetchSensorData, fetchAnalyticsData, connectToWebSocket, disconnectFromWebSocket]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnectFromWebSocket();
    };
  }, [disconnectFromWebSocket]);

  const handleRefresh = () => {
    fetchSensorData();
    fetchAnalyticsData();
    simulateRealTimeData();
  };

  const toggleAutoRefresh = () => {
    if (isConnected) {
      disconnectFromWebSocket();
    } else {
      connectToWebSocket();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p>Loading sensor data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Real-Time Sensor Monitor</h2>
          <p className="text-gray-600">Live environmental monitoring from IoT sensors</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={isConnected ? "default" : "outline"}
            size="sm"
            onClick={toggleAutoRefresh}
          >
            <Activity className={`h-4 w-4 mr-2 ${isConnected ? 'animate-pulse' : ''}`} />
            {isConnected ? 'Connected' : 'Disconnected'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Connection Status */}
      {connectionError && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {connectionError}
          </AlertDescription>
        </Alert>
      )}

      {/* Last Update */}
      {lastUpdate && (
        <div className="text-sm text-gray-600">
          Last update: {lastUpdate.toLocaleTimeString()}
        </div>
      )}

      {/* Sensor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sensors.map((sensor) => {
          const aqiInfo = getAQICategory(sensor.readings.aqi);
          const analyticsData = analytics.find(a => a.sensorId === sensor.sensorId);
          
          return (
            <Card key={sensor.sensorId} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{sensor.sensorId}</CardTitle>
                  <Badge className={aqiInfo.color}>
                    {sensor.readings.aqi} AQI
                  </Badge>
                </div>
                <CardDescription className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {sensor.location.address || `${sensor.location.latitude.toFixed(4)}, ${sensor.location.longitude.toFixed(4)}`}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* AQI Category */}
                <div className={`${aqiInfo.bgColor} p-3 rounded-lg`}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{aqiInfo.category}</span>
                    <div className="flex items-center gap-1">
                      {analyticsData && getTrendIcon(analyticsData.trends.aqiTrend)}
                      <span className="text-sm text-gray-600">
                        {analyticsData && `${analyticsData.trends.changeRate > 0 ? '+' : ''}${analyticsData.trends.changeRate}%`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Readings */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">PM2.5:</span>
                    <span className="ml-1 font-medium">{sensor.readings.pm25.toFixed(1)} µg/m³</span>
                  </div>
                  <div>
                    <span className="text-gray-600">PM10:</span>
                    <span className="ml-1 font-medium">{sensor.readings.pm10.toFixed(1)} µg/m³</span>
                  </div>
                  <div>
                    <span className="text-gray-600">O₃:</span>
                    <span className="ml-1 font-medium">{sensor.readings.ozone.toFixed(1)} ppb</span>
                  </div>
                  <div>
                    <span className="text-gray-600">NO₂:</span>
                    <span className="ml-1 font-medium">{sensor.readings.nitrogenDioxide.toFixed(1)} ppb</span>
                  </div>
                </div>

                <Separator />

                {/* Device Info */}
                {sensor.deviceInfo && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status:</span>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(sensor.deviceInfo.status)}`} />
                        <span className="text-sm capitalize">{sensor.deviceInfo.status}</span>
                      </div>
                    </div>
                    
                    {sensor.deviceInfo.batteryLevel !== undefined && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Battery:</span>
                        <div className="flex items-center gap-2">
                          <Battery className="h-4 w-4" />
                          <Progress value={sensor.deviceInfo.batteryLevel} className="w-20" />
                          <span className="text-sm">{Math.round(sensor.deviceInfo.batteryLevel)}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Timestamp */}
                <div className="text-xs text-gray-500">
                  Updated: {sensor.readings.timestamp.toLocaleTimeString()}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {sensors.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No sensor data available. Make sure the sensors are active and connected.
        </div>
      )}
    </div>
  );
}