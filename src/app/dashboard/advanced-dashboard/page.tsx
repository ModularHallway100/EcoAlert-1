"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RealTimeSensorMonitor } from '@/components/real-time-sensor-monitor';
import { 
  Activity, 
  AlertTriangle, 
  BarChart3, 
  Battery, 
  MapPin, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Globe,
  Users,
  Zap,
  Shield,
  Database,
  Wifi,
  Clock,
  Thermometer,
  Droplets,
  Gauge
} from 'lucide-react';

interface SystemHealth {
  totalSensors: number;
  activeSensors: number;
  healthPercentage: number;
  uptime: string;
}

interface AreaAnalytics {
  area: {
    center: { latitude: number; longitude: number };
    radius: number;
    totalSensors: number;
  };
  statistics: {
    averageAQI: number;
    maxAQI: number;
    minAQI: number;
  };
  sensors: Array<{
    sensorId: string;
    location: { latitude: number; longitude: number; address?: string };
    stats: {
      averageAQI: number;
      maxAQI: number;
      minAQI: number;
      readingsCount: number;
      lastUpdate: Date;
      dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
    };
  }>;
}

interface OverviewData {
  overview: {
    totalSensors: number;
    averageAQI: number;
    maxAQI: number;
    minAQI: number;
    aqiCategories: {
      good: number;
      moderate: number;
      unhealthySensitive: number;
      unhealthy: number;
      veryUnhealthy: number;
      hazardous: number;
    };
  };
  systemHealth: SystemHealth;
}

export default function AdvancedDashboard() {
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const [areaAnalytics, setAreaAnalytics] = useState<AreaAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedArea, setSelectedArea] = useState({ lat: 24.7136, lng: 46.6753, radius: 10 });

  // Fetch system health and overview data
  const fetchDashboardData = async () => {
    try {
      const [healthResponse, overviewResponse] = await Promise.all([
        fetch('/api/analytics'),
        fetch('/api/analytics')
      ]);

      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        if (healthData.success) {
          setSystemHealth(healthData.data.systemHealth);
          setOverviewData(healthData.data);
        }
      }

      if (overviewResponse.ok) {
        const overviewData = await overviewResponse.json();
        if (overviewData.success) {
          setOverviewData(overviewData.data);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  // Fetch area analytics
  const fetchAreaAnalytics = async (lat: number, lng: number, radius: number) => {
    try {
      const response = await fetch(`/api/analytics?latitude=${lat}&longitude=${lng}&radius=${radius}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAreaAnalytics(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching area analytics:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await Promise.all([fetchDashboardData(), fetchAreaAnalytics(selectedArea.lat, selectedArea.lng, selectedArea.radius)]);
      setIsLoading(false);
    };

    fetchData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [selectedArea]);

  const getAQICategory = (aqi: number) => {
    if (aqi <= 50) return { category: 'Good', color: 'text-green-600', bgColor: 'bg-green-50' };
    if (aqi <= 100) return { category: 'Moderate', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
    if (aqi <= 150) return { category: 'Unhealthy for Sensitive Groups', color: 'text-orange-600', bgColor: 'bg-orange-50' };
    if (aqi <= 200) return { category: 'Unhealthy', color: 'text-red-600', bgColor: 'bg-red-50' };
    if (aqi <= 300) return { category: 'Very Unhealthy', color: 'text-purple-600', bgColor: 'bg-purple-50' };
    return { category: 'Hazardous', color: 'text-red-800', bgColor: 'bg-red-100' };
  };

  const handleAreaChange = (lat: number, lng: number, radius: number) => {
    setSelectedArea({ lat, lng, radius });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Advanced Dashboard</h1>
            <p className="text-gray-600">Comprehensive environmental monitoring and analytics</p>
          </div>
          <Button onClick={fetchDashboardData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* System Health Overview */}
        {systemHealth && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sensors</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemHealth.totalSensors}</div>
                <p className="text-xs text-muted-foreground">Environmental sensors deployed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Sensors</CardTitle>
                <Wifi className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{systemHealth.activeSensors}</div>
                <p className="text-xs text-muted-foreground">Currently transmitting data</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Health</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemHealth.healthPercentage}%</div>
                <Progress value={systemHealth.healthPercentage} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Uptime</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemHealth.uptime}</div>
                <p className="text-xs text-muted-foreground">Service availability</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="realtime">Real-Time Monitor</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="area">Area Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {overviewData && (
              <>
                {/* AQI Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quality Index Overview</CardTitle>
                    <CardDescription>Air quality distribution across all sensors</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {overviewData.overview.aqiCategories.good}
                        </div>
                        <div className="text-sm text-gray-600">Good</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">
                          {overviewData.overview.aqiCategories.moderate}
                        </div>
                        <div className="text-sm text-gray-600">Moderate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {overviewData.overview.aqiCategories.unhealthySensitive}
                        </div>
                        <div className="text-sm text-gray-600">Unhealthy (Sensitive)</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {overviewData.overview.aqiCategories.unhealthy}
                        </div>
                        <div className="text-sm text-gray-600">Unhealthy</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {overviewData.overview.aqiCategories.veryUnhealthy}
                        </div>
                        <div className="text-sm text-gray-600">Very Unhealthy</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-800">
                          {overviewData.overview.aqiCategories.hazardous}
                        </div>
                        <div className="text-sm text-gray-600">Hazardous</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Average AQI
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{overviewData.overview.averageAQI}</div>
                      <div className="text-sm text-gray-600">
                        {getAQICategory(overviewData.overview.averageAQI).category}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Maximum AQI
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-red-600">{overviewData.overview.maxAQI}</div>
                      <div className="text-sm text-gray-600">
                        {getAQICategory(overviewData.overview.maxAQI).category}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingDown className="h-5 w-5" />
                        Minimum AQI
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-green-600">{overviewData.overview.minAQI}</div>
                      <div className="text-sm text-gray-600">
                        {getAQICategory(overviewData.overview.minAQI).category}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="realtime">
            <RealTimeSensorMonitor />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Analytics</CardTitle>
                <CardDescription>Detailed sensor analytics and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                  <p>Advanced analytics interface coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="area" className="space-y-4">
            {areaAnalytics && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Area Analysis</CardTitle>
                    <CardDescription>
                      Environmental data for area centered at {areaAnalytics.area.center.latitude.toFixed(4)}, {areaAnalytics.area.center.longitude.toFixed(4)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{areaAnalytics.area.totalSensors}</div>
                        <div className="text-sm text-gray-600">Sensors in area</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{areaAnalytics.statistics.averageAQI}</div>
                        <div className="text-sm text-gray-600">Average AQI</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{areaAnalytics.statistics.maxAQI}</div>
                        <div className="text-sm text-gray-600">Maximum AQI</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Sensor Details</CardTitle>
                    <CardDescription>Detailed information for each sensor in the area</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {areaAnalytics.sensors.map((sensor) => {
                        const aqiInfo = getAQICategory(sensor.stats.averageAQI);
                        return (
                          <div key={sensor.sensorId} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <div className="font-medium">{sensor.sensorId}</div>
                              <div className="text-sm text-gray-600">
                                <MapPin className="inline h-4 w-4 mr-1" />
                                {sensor.location.address || `${sensor.location.latitude.toFixed(4)}, ${sensor.location.longitude.toFixed(4)}`}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`text-lg font-bold ${aqiInfo.color}`}>
                                {sensor.stats.averageAQI} AQI
                              </div>
                              <div className="text-sm text-gray-600">
                                {aqiInfo.category}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}