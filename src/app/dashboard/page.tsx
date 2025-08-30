"use client";

import { useState, useEffect } from 'react';
import { Dashboard as DashboardComponent } from '@/components/dashboard';
import { AdaptiveDashboard } from '@/components/adaptive-dashboard';
import EmergencyCommandCenter from '@/components/emergency-command-center';
import { useAuth } from '@/components/auth-provider';
import { useSocket } from '@/components/socket-provider';
import { useAnalytics } from '@/components/analytics-provider';
import { useTrackFeature } from '@/components/analytics-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  HelpCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const { socket, isConnected, sensorData, alerts } = useSocket();
  const { trackEvent } = useAnalytics();
  const trackFeature = useTrackFeature('dashboard');
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Track dashboard view
  useEffect(() => {
    trackEvent('dashboard_view', {
      userId: user?.id,
      isAuthenticated: isAuthenticated,
    });
  }, [user, isAuthenticated, trackEvent]);

  // Track real-time updates
  useEffect(() => {
    if (socket && isConnected) {
      // Request initial data
      socket.emit('request_sensor_data');
      socket.emit('request_alerts');
    }
  }, [socket, isConnected]);

  // Handle incoming sensor data
  useEffect(() => {
    if (sensorData) {
      setLastUpdated(new Date());
      trackEvent('sensor_data_received', {
        aqi: sensorData.aqi,
        timestamp: sensorData.timestamp,
      });
    }
  }, [sensorData, trackEvent]);

  // Handle incoming alerts
  useEffect(() => {
    if (alerts.length > 0) {
      const latestAlert = alerts[0];
      toast({
        variant: latestAlert.severity === 'critical' ? 'destructive' : 'default',
        title: latestAlert.title,
        description: latestAlert.message,
      });
      
      trackEvent('alert_received', {
        severity: latestAlert.severity,
        type: latestAlert.type,
      });
    }
  }, [alerts, toast, trackEvent]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    trackFeature('tab_switch', { tab });
  };

  const handleEmergencyTrigger = (type: string) => {
    trackEvent('emergency_triggered', { type });
    toast({
      variant: 'destructive',
      title: 'Emergency Alert',
      description: `Emergency of type "${type}" has been triggered.`,
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please log in to access your dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = '/login'} className="w-full">
              Login
            </Button>
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
              {isConnected && (
                <Badge variant="outline" className="ml-3 text-green-600 border-green-600">
                  <div className="w-2 h-2 bg-green-600 rounded-full mr-1"></div>
                  Live
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-xs">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </Badge>
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
            Welcome back, {user?.basicInfo?.name || 'EcoWarrior'}!
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Monitor your environment, stay informed, and take action for a healthier planet.
          </p>
        </div>


        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
            <TabsTrigger value="pollution-map">
              <MapPin className="h-4 w-4 mr-2" />
              Pollution Map
            </TabsTrigger>
            <TabsTrigger value="command-center">
              <Shield className="h-4 w-4 mr-2" />
              Command Center
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <AdaptiveDashboard userId={user?.id} />
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-6">
            <DashboardComponent />
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
                    {alerts.map((alert, index) => (
                      <Alert key={index} variant={alert.severity === 'critical' ? 'destructive' : 'default'}>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>{alert.title}</AlertTitle>
                        <AlertDescription>
                          {alert.message}
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {alert.timestamp.toLocaleString()}
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
          <TabsContent value="pollution-map" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-500" />
                  Pollution Heatmap
                </CardTitle>
                <CardDescription>
                  View and analyze pollution levels across different areas with interactive heatmaps.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <Button onClick={() => window.location.href = '/pollution-map'} size="sm">
                        View Full Map
                      </Button>
                      <Button variant="outline" size="sm">
                        Export Data
                      </Button>
                    </div>
                    <Badge variant="outline">Real-time Updates</Badge>
                  </div>
                  
                  <div className="h-96 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-500 mb-2">Pollution Heatmap Preview</p>
                      <p className="text-sm text-gray-400">Click "View Full Map" for interactive features</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="command-center" className="space-y-6">
            <EmergencyCommandCenter />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
