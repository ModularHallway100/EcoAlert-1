"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
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
  CheckCircle,
  Wifi,
  WifiOff,
  Smartphone,
  Monitor,
  Server,
  Database,
  Network,
  Plug,
  Battery,
  Signal
} from 'lucide-react';
import { detectAnomalies } from '@/ai/anomaly-detection';
import { predictPollutionLevels } from '@/ai/predictive-analytics';

interface SensorData {
  id: string;
  name: string;
  type: string;
  location: string;
  value: number;
  unit: string;
  status: 'online' | 'offline' | 'warning';
  lastUpdate: Date;
  battery?: number;
  signal?: number;
}

interface PollutionData {
  timestamp: Date;
  location: string;
  aqi: number;
  pm25: number;
  pm10: number;
  no2: number;
  so2: number;
  co: number;
  o3: number;
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
}

interface AlertData {
  id: string;
  type: 'warning' | 'danger' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  location: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  acknowledged: boolean;
}

interface SocketContextType {
  socket: any | null;
  isConnected?: boolean;
  sensorData: any;
  alerts: any[];
  connect?: () => void;
  disconnect?: () => void;
}

const getAQIColor = (aqi: number): string => {
  if (aqi <= 50) return 'bg-green-500';
  if (aqi <= 100) return 'bg-yellow-500';
  if (aqi <= 150) return 'bg-orange-500';
  if (aqi <= 200) return 'bg-red-500';
  if (aqi <= 300) return 'bg-purple-500';
  return 'bg-red-800';
};

const getAQILevel = (aqi: number): string => {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'online': return 'text-green-600';
    case 'offline': return 'text-red-600';
    case 'warning': return 'text-yellow-600';
    default: return 'text-gray-600';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'online': return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'offline': return <WifiOff className="h-4 w-4 text-red-600" />;
    case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    default: return <WifiOff className="h-4 w-4 text-gray-600" />;
  }
};

export default function PollutionMonitor() {
  const [activeTab, setActiveTab] = useState('overview');
  const [sensors, setSensors] = useState<SensorData[]>([]);
  const [pollutionData, setPollutionData] = useState<PollutionData[]>([]);
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [timeRange, setTimeRange] = useState('24h');
  const [isConnected, setConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [anomalies, setAnomalies] = useState<PollutionData[]>([]);
  const [predictedData, setPredictedData] = useState<PollutionData[]>([]);

  const socket = useSocket();
  const { user } = useAuth();
  const { trackEvent } = useAnalytics();
  
  const refreshInterval = useRef<NodeJS.Timeout>();
  const chartRef = useRef<HTMLDivElement>(null);

  const fetchInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [sensorsRes, pollutionRes, alertsRes] = await Promise.all([
        fetch('/api/sensors'),
        fetch('/api/pollution'),
        fetch('/api/alerts')
      ]);
      
      const sensorsData = await sensorsRes.json() as SensorData[];
      const pollutionData = await pollutionRes.json() as PollutionData[];
      const alertsData = await alertsRes.json() as AlertData[];
      
      setSensors(sensorsData);
      setPollutionData(pollutionData);
      setAlerts(alertsData);
      setLastUpdate(new Date());
      // Fix type mismatch - convert pollution data to the right format
      const historicalData = pollutionData.map(data => ({
        time: data.timestamp.toISOString(),
        aqi: data.aqi,
        ph: 0, // placeholder
        turbidity: 0, // placeholder
        noise: 0 // placeholder
      }));
      const detectedAnomalies = detectAnomalies(historicalData, 2.5);
      // Convert back to the expected format
      const formattedAnomalies = detectedAnomalies.map(anomaly => ({
        timestamp: new Date(anomaly.time),
        location: 'Unknown',
        aqi: anomaly.aqi,
        pm25: 0,
        pm10: 0,
        no2: 0,
        so2: 0,
        co: 0,
        o3: 0,
        temperature: 0,
        humidity: 0,
        windSpeed: 0,
        windDirection: 'N'
      }));
      setAnomalies(formattedAnomalies);

      // Predict future pollution levels
      const predictedPollution = predictPollutionLevels(pollutionData, 5);
      setPredictedData(predictedPollution);
    } catch (error) {
      console.error('Error fetching initial data:', error);
      trackEvent('data_fetch_error', { error: (error as Error).message });
    } finally {
      setIsLoading(false);
    }
  }, [trackEvent, setAlerts, setAnomalies, setPollutionData, setSensors, setLastUpdate, setIsLoading, setPredictedData]);

  useEffect(() => {
    // trackFeature('pollution_monitor_viewed');
    
    if (socket) {
      setConnected(socket.isConnected);
      setConnectionStatus(socket.isConnected ? 'connected' : 'disconnected');
    }
    
    fetchInitialData();
    
    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
    };
  }, [socket, user, trackEvent, fetchInitialData, setConnectionStatus, setConnected, socket?.isConnected]);

  const refreshData = () => {
    fetchInitialData();
    trackEvent('manual_refresh', { component: 'pollution_monitor' });
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      await fetch(`/api/alerts/${alertId}/acknowledge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, acknowledged: true }
          : alert
      ));
      
      trackEvent('alert_acknowledged', { alertId });
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  const getSensorStatusCounts = () => {
    const counts = {
      online: 0,
      offline: 0,
      warning: 0,
      total: sensors.length
    };
    
    sensors.forEach(sensor => {
      counts[sensor.status]++;
    });
    
    return counts;
  };

  const getPollutionStats = () => {
    if (pollutionData.length === 0) {
      return { avgAqi: 0, maxAqi: 0, minAqi: 0, trend: 'stable' };
    }
    
    const aqiValues = pollutionData.map(d => d.aqi);
    const avgAqi = Math.round(aqiValues.reduce((a, b) => a + b, 0) / aqiValues.length);
    const maxAqi = Math.max(...aqiValues);
    const minAqi = Math.min(...aqiValues);
    
    const recent = pollutionData.slice(-10);
    const older = pollutionData.slice(-20, -10);
    
    if (recent.length > 0 && older.length > 0) {
      const recentAvg = recent.reduce((a, b) => a + b.aqi, 0) / recent.length;
      const olderAvg = older.reduce((a, b) => a + b.aqi, 0) / older.length;
      
      if (recentAvg > olderAvg + 5) return 'rising';
      if (recentAvg < olderAvg - 5) return 'falling';
    }
    
    return 'stable';
  };

  const getActiveAlerts = () => {
    return alerts.filter(alert => !alert.acknowledged);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'just now';
  };

  const statusCounts = getSensorStatusCounts();
  const pollutionStats = getPollutionStats();
  const activeAlerts = getActiveAlerts();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-gray-600">Loading pollution data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pollution Monitor</h1>
          <p className="text-gray-600">Real-time environmental monitoring and alerts</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm ${
            connectionStatus === 'connected' ? 'bg-green-100 text-green-800' :
            connectionStatus === 'connecting' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {connectionStatus === 'connected' ? <Wifi className="h-4 w-4" /> : 
             connectionStatus === 'connecting' ? <RefreshCw className="h-4 w-4 animate-spin" /> : 
             <WifiOff className="h-4 w-4" />}
            <span>{connectionStatus === 'connected' ? 'Connected' : 
                   connectionStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}</span>
          </div>
          <Button onClick={refreshData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {lastUpdate && (
        <div className="text-sm text-gray-500">
          Last updated: {formatRelativeTime(lastUpdate)}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sensors">Sensors</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Air Quality Index</CardTitle>
                <Gauge className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {typeof pollutionStats === 'object' ? pollutionStats.avgAqi : 'N/A'}
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`h-2 w-2 rounded-full ${
                    typeof pollutionStats === 'object' ? getAQIColor(pollutionStats.avgAqi) : 'bg-gray-400'
                  }`} />
                  <span className="text-xs text-muted-foreground">
                    {typeof pollutionStats === 'object' ? getAQILevel(pollutionStats.avgAqi) : 'N/A'}
                  </span>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Trend: {typeof pollutionStats === 'object' ? (
                    pollutionStats.trend === 'rising' ? (
                      <span className="text-red-600 flex items-center">
                        <ArrowUp className="h-3 w-3 mr-1" /> Rising
                      </span>
                    ) : pollutionStats.trend === 'falling' ? (
                      <span className="text-green-600 flex items-center">
                        <ArrowDown className="h-3 w-3 mr-1" /> Falling
                      </span>
                    ) : (
                      <span className="text-gray-600 flex items-center">
                        <Minus className="h-3 w-3 mr-1" /> Stable
                      </span>
                    )
                  ) : (
                    <span className="text-gray-600 flex items-center">
                      <Minus className="h-3 w-3 mr-1" /> No Data
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Sensors</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statusCounts.online}/{statusCounts.total}</div>
                <Progress value={(statusCounts.online / statusCounts.total) * 100} className="mt-2" />
                <div className="mt-2 text-xs text-muted-foreground">
                  {statusCounts.warning} warning, {statusCounts.offline} offline
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeAlerts.length}</div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {activeAlerts.filter(a => a.severity === 'critical').length} critical
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Coverage Area</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">Monitoring zones</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Pollution Readings</CardTitle>
                <CardDescription>Latest air quality measurements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pollutionData.slice(-5).map((data, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`h-3 w-3 rounded-full ${getAQIColor(data.aqi)}`} />
                        <div>
                          <p className="font-medium">{data.location}</p>
                          <p className="text-sm text-gray-500">{formatTime(data.timestamp)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{data.aqi}</p>
                        <p className="text-sm text-gray-500">AQI</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Alerts</CardTitle>
                <CardDescription>Latest environmental warnings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeAlerts.slice(0, 5).map((alert) => (
                    <Alert key={alert.id} className={`border-l-4 ${
                      alert.severity === 'critical' ? 'border-red-500' :
                      alert.severity === 'high' ? 'border-orange-500' :
                      alert.severity === 'medium' ? 'border-yellow-500' :
                      'border-blue-500'
                    }`}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle className="text-sm">{alert.title}</AlertTitle>
                      <AlertDescription className="text-xs">
                        <div className="flex justify-between items-start">
                          <div>
                            <p>{alert.message}</p>
                            <p className="mt-1 text-gray-500">{alert.location} • {formatTime(alert.timestamp)}</p>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => acknowledgeAlert(alert.id)}
                          >
                            Acknowledge
                          </Button>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                  {anomalies.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-lg font-semibold mb-2">Detected Anomalies</h3>
                      {anomalies.slice(0, 3).map((anomaly) => (
                        <Alert key={anomaly.timestamp.toISOString()} className="border-l-4 border-red-500">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertTitle className="text-sm">Anomaly Detected</AlertTitle>
                          <AlertDescription className="text-xs">
                            <p>AQI: {anomaly.aqi} in {anomaly.location} at {formatTime(anomaly.timestamp)}</p>
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sensors" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Sensor Network</h2>
              <p className="text-gray-600">Monitor and manage IoT sensors</p>
            </div>
            <div className="flex items-center space-x-2">
              <select 
                value={selectedLocation} 
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">All Locations</option>
                <option value="downtown">Downtown</option>
                <option value="industrial">Industrial Zone</option>
                <option value="residential">Residential Area</option>
                <option value="suburban">Suburban</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sensors.map((sensor) => (
              <Card key={sensor.id} className="relative">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{sensor.name}</CardTitle>
                  {getStatusIcon(sensor.status)}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Location</span>
                      <span className="text-sm font-medium">{sensor.location}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Type</span>
                      <Badge variant="outline" className="text-xs">{sensor.type}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Value</span>
                      <span className="text-sm font-bold">{sensor.value} {sensor.unit}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Last Update</span>
                      <span className="text-xs">{formatRelativeTime(sensor.lastUpdate)}</span>
                    </div>
                    {sensor.battery && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Battery</span>
                        <div className="flex items-center space-x-1">
                          <Battery className="h-3 w-3" />
                          <span className="text-xs">{sensor.battery}%</span>
                        </div>
                      </div>
                    )}
                    {sensor.signal && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Signal</span>
                        <div className="flex items-center space-x-1">
                          <Signal className="h-3 w-3" />
                          <span className="text-xs">{sensor.signal}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Pollution Trends</CardTitle>
                <CardDescription>Air quality over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div ref={chartRef} className="h-64 flex items-center justify-center border rounded-lg">
                  <div className="text-center text-gray-500">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                    <p>Chart visualization would appear here</p>
                    <p className="text-sm">AQI trends, pollutant levels, historical data</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
                <CardDescription>Pollution levels by location</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border rounded-lg">
                  <div className="text-center text-gray-500">
                    <MapPin className="h-12 w-12 mx-auto mb-2" />
                    <p>Map visualization would appear here</p>
                    <p className="text-sm">Heatmap, location markers, zone analysis</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detailed Analytics</CardTitle>
              <CardDescription>Comprehensive pollution analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">42</div>
                  <div className="text-sm text-gray-600">PM2.5 µg/m³</div>
                  <div className="text-xs text-green-600 mt-1">↓ 12% from last week</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">68</div>
                  <div className="text-sm text-gray-600">PM10 µg/m³</div>
                  <div className="text-xs text-red-600 mt-1">↑ 8% from last week</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">23</div>
                  <div className="text-sm text-gray-600">NO2 ppb</div>
                  <div className="text-xs text-green-600 mt-1">↓ 5% from last week</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">45</div>
                  <div className="text-sm text-gray-600">O3 ppb</div>
                  <div className="text-xs text-gray-600 mt-1">→ Stable</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Predicted Pollution Levels</CardTitle>
              <CardDescription>Forecasted air quality for the next 5 hours</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {predictedData.map((data, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`h-3 w-3 rounded-full ${getAQIColor(data.aqi)}`} />
                      <div>
                        <p className="font-medium">{data.location}</p>
                        <p className="text-sm text-gray-500">{formatTime(data.timestamp)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{data.aqi}</p>
                      <p className="text-sm text-gray-500">AQI</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Alert Management</h2>
              <p className="text-gray-600">Environmental warnings and notifications</p>
            </div>
            <div className="flex items-center space-x-2">
              <select 
                value={timeRange} 
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="1h">Last Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {alerts.map((alert) => (
              <Card key={alert.id} className={`relative ${
                alert.acknowledged ? 'opacity-60' : ''
              }`}>
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div className="flex items-center space-x-2">
                    {alert.severity === 'critical' && <AlertTriangle className="h-5 w-5 text-red-600" />}
                    {alert.severity === 'high' && <AlertTriangle className="h-5 w-5 text-orange-600" />}
                    {alert.severity === 'medium' && <AlertTriangle className="h-5 w-5 text-yellow-600" />}
                    {alert.severity === 'low' && <AlertTriangle className="h-5 w-5 text-blue-600" />}
                    <div>
                      <CardTitle className="text-sm">{alert.title}</CardTitle>
                      <CardDescription className="text-xs">
                        {alert.location} • {formatTime(alert.timestamp)}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={
                    alert.severity === 'critical' ? 'destructive' :
                    alert.severity === 'high' ? 'destructive' :
                    alert.severity === 'medium' ? 'default' :
                    'secondary'
                  }>
                    {alert.severity.toUpperCase()}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">{alert.message}</p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>Type: {alert.type}</span>
                      <span>•</span>
                      <span>ID: {alert.id}</span>
                    </div>
                    {!alert.acknowledged && (
                      <Button 
                        size="sm" 
                        onClick={() => acknowledgeAlert(alert.id)}
                      >
                        Acknowledge
                      </Button>
                    )}
                    {alert.acknowledged && (
                      <span className="text-xs text-green-600 flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Acknowledged
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
