"use client";

import { useState, useEffect, lazy, Suspense, memo, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Activity,
  Cloud,
  Droplets,
  Volume2,
  Bell,
  Leaf,
  RefreshCw,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';

// Lazy load heavy components (using proper lazy import format)
const ChartComponent = lazy(() => import('react').then(mod => {
  const { default: ChartFallback } = {
    default: ({ type, dataKey }: { type: string; dataKey: string }) => (
      <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Chart ({type}) would go here</p>
      </div>
    )
  };
  return { default: ChartFallback };
}));

const MapComponent = lazy(() => import('react').then(mod => {
  const { default: MapFallback } = {
    default: () => (
      <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Interactive map would go here</p>
      </div>
    )
  };
  return { default: MapFallback };
}));

// Memoized components for better performance
const SensorCard = memo(({ title, value, unit, icon: Icon, color, progress }: {
  title: string;
  value: number | string;
  unit: string;
  icon: React.ElementType;
  color: string;
  progress?: number;
}) => (
  <Card className={`${color} bg-opacity-10`}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 opacity-80" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">
        {value} {unit}
      </div>
      {progress !== undefined && (
        <Progress value={progress} className="mt-2" />
      )}
    </CardContent>
  </Card>
));

SensorCard.displayName = 'SensorCard';

const AlertItem = memo(({ alert }: { alert: any }) => (
  <Alert variant={alert.severity === 'critical' ? 'destructive' : 'default'}>
    <AlertTriangle className="h-4 w-4" />
    <AlertTitle className="flex items-center justify-between">
      <span>{alert.title}</span>
      <Badge variant="outline" className={getSeverityColor(alert.severity)}>
        {alert.severity.toUpperCase()}
      </Badge>
    </AlertTitle>
    <AlertDescription>
      {alert.message}
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {new Date(alert.timestamp).toLocaleString()}
        </span>
        <Button
          size="sm"
          variant="outline"
        >
          View Details
        </Button>
      </div>
    </AlertDescription>
  </Alert>
));

AlertItem.displayName = 'AlertItem';

// Helper functions
function getSeverityColor(severity: string) {
  switch (severity) {
    case 'low': return 'text-blue-600';
    case 'moderate': return 'text-yellow-600';
    case 'high': return 'text-orange-600';
    case 'critical': return 'text-red-600';
    default: return 'text-gray-600';
  }
}

function getAQIDescription(aqi: number): string {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}

function getNoiseDescription(noise: number): string {
  if (noise <= 50) return 'Quiet';
  if (noise <= 70) return 'Moderate';
  if (noise <= 85) return 'Loud';
  return 'Very Loud';
}

interface OptimizedDashboardProps {
  userId?: string;
}

interface SensorData {
  aqi: number;
  pm25: number;
  pm10: number;
  co2: number;
  o3: number;
  no2: number;
  so2: number;
  temperature: number;
  humidity: number;
  ph: number;
  turbidity: number;
  noise: number;
  timestamp: string;
}

interface AlertData {
  id: string;
  type: 'air' | 'water' | 'noise' | 'general';
  severity: 'low' | 'moderate' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  location: { latitude: number; longitude: number };
  resolved: boolean;
}

export function OptimizedDashboard({ userId }: OptimizedDashboardProps) {
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use useMemo for expensive calculations
  const memoizedSensorStats = useMemo(() => {
    if (!sensorData) return null;
    
    return {
      aqiColor: sensorData.aqi <= 50 ? 'text-green-600' : 
                sensorData.aqi <= 100 ? 'text-yellow-600' : 
                sensorData.aqi <= 150 ? 'text-orange-600' : 
                sensorData.aqi <= 200 ? 'text-red-600' : 'text-purple-600',
      aqiBackground: sensorData.aqi <= 50 ? 'bg-green-100 dark:bg-green-900/20' :
                     sensorData.aqi <= 100 ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                     sensorData.aqi <= 150 ? 'bg-orange-100 dark:bg-orange-900/20' :
                     sensorData.aqi <= 200 ? 'bg-red-100 dark:bg-red-900/20' : 'bg-purple-100 dark:bg-purple-900/20',
      aqiProgress: (sensorData.aqi / 300) * 100,
      noiseProgress: (sensorData.noise / 120) * 100,
      phProgress: (sensorData.ph / 14) * 100,
    };
  }, [sensorData]);

  // Optimize data fetching with useEffect
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Simulate API call with timeout
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Generate mock data
        const mockSensorData: SensorData = {
          aqi: Math.floor(Math.random() * 200) + 20,
          pm25: Math.floor(Math.random() * 50) + 5,
          pm10: Math.floor(Math.random() * 100) + 10,
          co2: Math.floor(Math.random() * 1000) + 400,
          o3: Math.floor(Math.random() * 100) + 20,
          no2: Math.floor(Math.random() * 50) + 10,
          so2: Math.floor(Math.random() * 20) + 5,
          temperature: Math.floor(Math.random() * 30) + 10,
          humidity: Math.floor(Math.random() * 60) + 30,
          ph: parseFloat((Math.random() * 4 + 6).toFixed(1)),
          turbidity: Math.floor(Math.random() * 20) + 5,
          noise: Math.floor(Math.random() * 80) + 40,
          timestamp: new Date().toISOString(),
        };

        const mockAlerts: AlertData[] = [
          {
            id: '1',
            type: 'air',
            severity: 'moderate',
            title: 'Elevated PM2.5 Levels',
            message: 'Air quality has decreased in your area. Consider limiting outdoor activities.',
            timestamp: new Date().toISOString(),
            location: { latitude: 40.7128, longitude: -74.0060 },
            resolved: false,
          },
          {
            id: '2',
            type: 'noise',
            severity: 'low',
            title: 'Noise Pollution Alert',
            message: 'High noise levels detected in downtown area.',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            location: { latitude: 40.7589, longitude: -73.9851 },
            resolved: false,
          },
        ];

        setSensorData(mockSensorData);
        setAlerts(mockAlerts);
      } catch (err) {
        setError('Failed to load dashboard data. Please try again later.');
        console.error('Dashboard data fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Optimized refresh function
  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update timestamp
      if (sensorData) {
        setSensorData({
          ...sensorData,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (err) {
      setError('Failed to refresh data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
            <div className="mt-2">
              <Button onClick={handleRefresh} size="sm">
                Try Again
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Environmental Monitoring</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Real-time data and insights for your area
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {memoizedSensorStats && (
          <>
            <SensorCard
              title="Air Quality Index"
              value={sensorData?.aqi || '--'}
              unit=""
              icon={Cloud}
              color={memoizedSensorStats.aqiBackground}
              progress={memoizedSensorStats.aqiProgress}
            />
            <SensorCard
              title="Water Quality"
              value={sensorData?.ph || '--'}
              unit=""
              icon={Droplets}
              color="bg-gradient-to-r from-blue-500 to-blue-600"
              progress={memoizedSensorStats.phProgress}
            />
            <SensorCard
              title="Noise Level"
              value={sensorData?.noise || '--'}
              unit=""
              icon={Volume2}
              color="bg-gradient-to-r from-purple-500 to-purple-600"
              progress={memoizedSensorStats.noiseProgress}
            />
            <SensorCard
              title="Active Alerts"
              value={alerts.length}
              unit=""
              icon={Bell}
              color="bg-gradient-to-r from-orange-500 to-orange-600"
              progress={alerts.length * 10}
            />
          </>
        )}
      </div>

      {/* Charts and Map */}
      <Suspense fallback={<div className="h-64 flex items-center justify-center">Loading charts...</div>}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Environmental Trends</CardTitle>
              <CardDescription>24-hour data visualization</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartComponent type="line" dataKey="aqi" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Location Overview</CardTitle>
              <CardDescription>Environmental data by location</CardDescription>
            </CardHeader>
            <CardContent>
              <MapComponent />
            </CardContent>
          </Card>
        </div>
      </Suspense>

      {/* Detailed Monitoring */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sensor Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              Sensor Readings
            </CardTitle>
            <CardDescription>
              Detailed environmental measurements from your area
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sensorData && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">PM2.5</span>
                    <span className="font-medium">{sensorData.pm25} µg/m³</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">PM10</span>
                    <span className="font-medium">{sensorData.pm10} µg/m³</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">CO₂</span>
                    <span className="font-medium">{sensorData.co2} ppm</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">O₃</span>
                    <span className="font-medium">{sensorData.o3} ppb</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Temperature</span>
                    <span className="font-medium">{sensorData.temperature}°C</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Humidity</span>
                    <span className="font-medium">{sensorData.humidity}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Turbidity</span>
                    <span className="font-medium">{sensorData.turbidity} NTU</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Last Updated</span>
                    <span className="font-medium text-xs">
                      {sensorData.timestamp ? new Date(sensorData.timestamp).toLocaleTimeString() : '--'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Predictive Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Predictive Analytics
            </CardTitle>
            <CardDescription>
              AI-powered forecasts and recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="h-32 flex items-center justify-center">Loading predictions...</div>}>
              <ChartComponent type="bar" dataKey="predictions" />
            </Suspense>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Active Alerts
          </CardTitle>
          <CardDescription>
            Monitor and manage environmental alerts in your area
          </CardDescription>
        </CardHeader>
        <CardContent>
          {alerts.length > 0 ? (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <AlertItem key={alert.id} alert={alert} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Leaf className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300">
                No active alerts. Your environment is within safe parameters.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Export optimized component as default
export default OptimizedDashboard;