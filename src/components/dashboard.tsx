"use client";

import { useState, useEffect } from 'react';
import { useSocket } from '@/components/socket-provider';
import { useAuth } from '@/components/auth-provider';
import { useAnalytics } from '@/components/analytics-provider';
import { useTrackFeature } from '@/components/analytics-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Activity,
  MapPin,
  Users,
  TrendingUp,
  AlertTriangle,
  Shield,
  Zap,
  Leaf,
  Cloud,
  Droplets,
  Volume2,
  Bell,
  Settings,
  HelpCircle,
  Thermometer,
  Wind,
  Gauge,
  Calendar,
  Clock,
  BarChart3,
  PieChart,
  LineChart,
  ArrowUp,
  ArrowDown,
  Minus,
  RefreshCw,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

interface CommunityData {
  activeUsers: number;
  reportsThisWeek: number;
  localInitiatives: number;
  leaderboard: Array<{
    id: string;
    name: string;
    points: number;
    avatar: string;
  }>;
}

interface PredictiveData {
  aqiForecast: Array<{
    time: string;
    value: number;
    confidence: number;
  }>;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  recommendations: string[];
}

export function Dashboard() {
  const { user } = useAuth();
  const { socket, isConnected, sensorData, alerts } = useSocket();
  const { trackEvent } = useAnalytics();
  const trackFeature = useTrackFeature('dashboard');
  const { toast } = useToast();

  const [sensorDataLocal, setSensorDataLocal] = useState<SensorData | null>(null);
  const [alertsLocal, setAlertsLocal] = useState<AlertData[]>([]);
  const [communityData, setCommunityData] = useState<CommunityData | null>(null);
  const [predictiveData, setPredictiveData] = useState<PredictiveData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');

  // Initialize data
  useEffect(() => {
    if (socket && isConnected) {
      // Request initial data
      socket.emit('request_sensor_data');
      socket.emit('request_alerts');
      socket.emit('request_community_data');
      socket.emit('request_predictive_data');
    }

    // Simulate loading and data fetching
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Generate mock data for demonstration
      generateMockData();
    }, 1500);

    return () => clearTimeout(timer);
  }, [socket, isConnected]);

  // Handle incoming sensor data
  useEffect(() => {
    if (sensorData) {
      setSensorDataLocal(sensorData);
      trackEvent('sensor_data_received', {
        aqi: sensorData.aqi,
        timestamp: sensorData.timestamp,
      });
    }
  }, [sensorData, trackEvent]);

  // Handle incoming alerts
  useEffect(() => {
    if (alerts.length > 0) {
      setAlertsLocal(alerts);
      const latestAlert = alerts[0];
      toast({
        variant: latestAlert.severity === 'critical' ? 'destructive' : 'default',
        title: latestAlert.title,
        description: latestAlert.message,
      });
    }
  }, [alerts, toast]);

  const generateMockData = () => {
    // Mock sensor data
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

    // Mock alerts
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

    // Mock community data
    const mockCommunityData: CommunityData = {
      activeUsers: 1247,
      reportsThisWeek: 89,
      localInitiatives: 15,
      leaderboard: [
        { id: '1', name: 'EcoWarrior42', points: 2450, avatar: '/avatars/1.png' },
        { id: '2', name: 'GreenGuardian', points: 1980, avatar: '/avatars/2.png' },
        { id: '3', name: 'NatureLover', points: 1750, avatar: '/avatars/3.png' },
        { id: '4', name: 'CleanAirAdvocate', points: 1620, avatar: '/avatars/4.png' },
        { id: '5', name: 'PlanetProtector', points: 1500, avatar: '/avatars/5.png' },
      ],
    };

    // Mock predictive data
    const mockPredictiveData: PredictiveData = {
      aqiForecast: Array.from({ length: 24 }, (_, i) => ({
        time: `${i}:00`,
        value: Math.floor(Math.random() * 100) + 30,
        confidence: Math.random() * 0.3 + 0.7,
      })),
      riskLevel: 'moderate',
      recommendations: [
        'Consider using air purifier indoors',
        'Limit outdoor exercise during peak hours',
        'Stay hydrated and monitor symptoms',
        'Check local air quality before planning activities'
      ],
    };

    setSensorDataLocal(mockSensorData);
    setAlertsLocal(mockAlerts);
    setCommunityData(mockCommunityData);
    setPredictiveData(mockPredictiveData);
  };

  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return 'text-green-600';
    if (aqi <= 100) return 'text-yellow-600';
    if (aqi <= 150) return 'text-orange-600';
    if (aqi <= 200) return 'text-red-600';
    return 'text-purple-600';
  };

  const getAQIBackground = (aqi: number) => {
    if (aqi <= 50) return 'bg-green-100 dark:bg-green-900/20';
    if (aqi <= 100) return 'bg-yellow-100 dark:bg-yellow-900/20';
    if (aqi <= 150) return 'bg-orange-100 dark:bg-orange-900/20';
    if (aqi <= 200) return 'bg-red-100 dark:bg-red-900/20';
    return 'bg-purple-100 dark:bg-purple-900/20';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-blue-600';
      case 'moderate': return 'text-yellow-600';
      case 'high': return 'text-orange-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    generateMockData();
    trackFeature('refresh_data');
    setTimeout(() => setIsLoading(false), 1000);
  };

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
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className={`${getAQIBackground(sensorDataLocal?.aqi || 0)}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Air Quality Index</CardTitle>
            <Cloud className="h-4 w-4 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getAQIColor(sensorDataLocal?.aqi || 0)}`}>
              {sensorDataLocal?.aqi || '--'}
            </div>
            <p className="text-xs opacity-80">
              {sensorDataLocal?.aqi ? getAQIDescription(sensorDataLocal.aqi) : 'Loading...'}
            </p>
            <Progress value={(sensorDataLocal?.aqi || 0) / 300 * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Water Quality</CardTitle>
            <Droplets className="h-4 w-4 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sensorDataLocal?.ph ? sensorDataLocal.ph : '--'}
            </div>
            <p className="text-xs opacity-80">
              pH Level
            </p>
            <Progress value={parseFloat(sensorDataLocal?.ph?.toString() || '7') / 14 * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Noise Level</CardTitle>
            <Volume2 className="h-4 w-4 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sensorDataLocal?.noise || '--'}
            </div>
            <p className="text-xs opacity-80">
              {sensorDataLocal?.noise ? getNoiseDescription(sensorDataLocal.noise) : 'Loading...'}
            </p>
            <Progress value={(sensorDataLocal?.noise || 0) / 120 * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <Bell className="h-4 w-4 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {alertsLocal.length}
            </div>
            <p className="text-xs opacity-80">
              {alertsLocal.length > 0 ? 'Attention needed' : 'All clear'}
            </p>
            <Progress value={alertsLocal.length * 10} className="mt-2" />
          </CardContent>
        </Card>
      </div>

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
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">PM2.5</span>
                  <span className="font-medium">{sensorDataLocal?.pm25 || '--'} µg/m³</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">PM10</span>
                  <span className="font-medium">{sensorDataLocal?.pm10 || '--'} µg/m³</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">CO₂</span>
                  <span className="font-medium">{sensorDataLocal?.co2 || '--'} ppm</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">O₃</span>
                  <span className="font-medium">{sensorDataLocal?.o3 || '--'} ppb</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Temperature</span>
                  <span className="font-medium">{sensorDataLocal?.temperature || '--'}°C</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Humidity</span>
                  <span className="font-medium">{sensorDataLocal?.humidity || '--'}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Turbidity</span>
                  <span className="font-medium">{sensorDataLocal?.turbidity || '--'} NTU</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Last Updated</span>
                  <span className="font-medium text-xs">
                    {sensorDataLocal?.timestamp ? new Date(sensorDataLocal.timestamp).toLocaleTimeString() : '--'}
                  </span>
                </div>
              </div>
            </div>
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
            {predictiveData && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Risk Level</span>
                  <Badge variant={predictiveData.riskLevel === 'critical' ? 'destructive' : 
                                 predictiveData.riskLevel === 'high' ? 'default' : 
                                 predictiveData.riskLevel === 'moderate' ? 'secondary' : 'outline'}>
                    {predictiveData.riskLevel.charAt(0).toUpperCase() + predictiveData.riskLevel.slice(1)}
                  </Badge>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-2">24-Hour Forecast</p>
                  <div className="space-y-2">
                    {predictiveData.aqiForecast.slice(0, 6).map((forecast, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span>{forecast.time}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{forecast.value}</span>
                          <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${forecast.value / 300 * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Recommendations</p>
                  <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                    {predictiveData.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
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
          {alertsLocal.length > 0 ? (
            <div className="space-y-4">
              {alertsLocal.map((alert) => (
                <Alert key={alert.id} variant={alert.severity === 'critical' ? 'destructive' : 'default'}>
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

// Helper functions
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
