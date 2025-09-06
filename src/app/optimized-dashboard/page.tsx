"use client";

import { useState, useEffect, lazy, Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Lazy load heavy components
const AdaptiveDashboard = lazy(() =>
  import('@/components/adaptive-dashboard').then(module => ({ default: module.AdaptiveDashboard }))
);
const DashboardComponent = lazy(() =>
  import('@/components/optimized-dashboard').then(module => ({ default: module.OptimizedDashboard }))
);
const EmergencyCommandCenter = lazy(() =>
  import('@/components/emergency-command-center')
);

// Mock data interfaces
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

export default function OptimizedDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const { toast } = useToast();

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Mock data
      setSensorData({
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
      });
      
      setAlerts([
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
      ]);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setLastUpdated(new Date());
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleEmergencyTrigger = (type: string) => {
    toast({
      variant: 'destructive',
      title: 'Emergency Alert',
      description: `Emergency of type "${type}" has been triggered.`,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Loading Dashboard</CardTitle>
            <CardDescription>
              Please wait while we load your environmental data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Leaf className="h-8 w-8 text-green-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                EcoAlert Dashboard
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, EcoWarrior!
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Monitor your environment, stay informed, and take action for a healthier planet.
          </p>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
            <TabsTrigger value="command-center">
              <Shield className="h-4 w-4 mr-2" />
              Command Center
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Suspense fallback={<div>Loading adaptive dashboard...</div>}>
              <AdaptiveDashboard userId="anonymous" />
            </Suspense>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-6">
            <Suspense fallback={<div>Loading monitoring dashboard...</div>}>
              <DashboardComponent />
            </Suspense>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Active Alerts
                </CardTitle>
                <CardDescription>
                  Monitor and manage environmental alerts in your area.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {alerts.length > 0 ? (
                  <div className="space-y-4">
                    {alerts.map((alert) => (
                      <Alert key={alert.id} variant={alert.severity === 'critical' ? 'destructive' : 'default'}>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>{alert.title}</AlertTitle>
                        <AlertDescription>
                          {alert.message}
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {new Date(alert.timestamp).toLocaleString()}
                            </span>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleEmergencyTrigger(alert.type)}
                            >
                              Take Action
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
          </TabsContent>
          
          <TabsContent value="community" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  Community Impact
                </CardTitle>
                <CardDescription>
                  See how your community is making a difference together.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      1,247
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Active EcoWarriors
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      89
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Reports This Week
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      15
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Local Initiatives
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="command-center" className="space-y-6">
            <Suspense fallback={<div>Loading command center...</div>}>
              <EmergencyCommandCenter />
            </Suspense>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}