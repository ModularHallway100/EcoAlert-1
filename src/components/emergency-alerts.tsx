"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EMERGENCY_TYPES, AQI_LEVELS, PH_LEVELS, TURBIDITY_LEVELS, NOISE_LEVELS } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Bell, CheckCircle, Clock, MapPin } from "lucide-react";
import Image from 'next/image';

interface ActiveAlert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  resolved: boolean;
}

type EmergencyAlertsProps = {
  onTriggerEmergency: (type: string) => void;
  aqi: number | null;
  ph: number | null;
  turbidity: number | null;
  noise: number | null;
};


export function EmergencyAlerts({ onTriggerEmergency, aqi, ph, turbidity, noise }: EmergencyAlertsProps) {
  const [activeAlerts, setActiveAlerts] = useState<ActiveAlert[]>([]);
  const [recentlyResolved, setRecentlyResolved] = useState<ActiveAlert[]>([]);
  const { toast } = useToast();

  // Check for environmental conditions that trigger alerts
  useEffect(() => {
    const newAlerts: ActiveAlert[] = [];
    const now = new Date();

    // Check AQI levels
    if (aqi !== null) {
      const aqiLevel = AQI_LEVELS.find(level => aqi >= level.min && aqi <= level.max);
      if (aqiLevel && aqi >= 151) { // Unhealthy or worse
        newAlerts.push({
          id: `aqi-${now.getTime()}`,
          type: 'High Pollution Detected',
          severity: aqi >= 301 ? 'critical' : aqi >= 201 ? 'high' : 'medium',
          message: `Air quality is ${aqiLevel.level} (AQI: ${aqi}). ${aqi >= 301 ? 'Immediate action required.' : aqi >= 201 ? 'Stay indoors and limit exposure.' : 'Sensitive groups should limit outdoor activities.'}`,
          timestamp: now,
          resolved: false
        });
      }
    }

    // Check pH levels
    if (ph !== null) {
      const phLevel = PH_LEVELS.find(level => ph >= level.min && ph <= level.max);
      if (phLevel && (phLevel.level === 'Danger' || phLevel.level === 'Caution')) {
        newAlerts.push({
          id: `ph-${now.getTime()}`,
          type: 'Water Quality Alert',
          severity: phLevel.level === 'Danger' ? 'high' : 'medium',
          message: `Water pH is ${phLevel.level} level (${ph}). ${phLevel.level === 'Danger' ? 'Avoid using tap water.' : 'Monitor water quality closely.'}`,
          timestamp: now,
          resolved: false
        });
      }
    }

    // Check turbidity levels
    if (turbidity !== null) {
      const turbidityLevel = TURBIDITY_LEVELS.find(level => turbidity >= level.min && turbidity <= level.max);
      if (turbidityLevel && turbidityLevel.level !== 'Safe') {
        newAlerts.push({
          id: `turbidity-${now.getTime()}`,
          type: 'Water Quality Alert',
          severity: turbidityLevel.level === 'Danger' ? 'high' : 'medium',
          message: `Water turbidity is ${turbidityLevel.level} (${turbidity} NTU). ${turbidityLevel.level === 'Danger' ? 'Consider alternative water sources.' : 'Water may appear cloudy.'}`,
          timestamp: now,
          resolved: false
        });
      }
    }

    // Check noise levels
    if (noise !== null) {
      const noiseLevel = NOISE_LEVELS.find(level => noise >= level.min && noise <= level.max);
      if (noiseLevel && noiseLevel.level !== 'Safe') {
        newAlerts.push({
          id: `noise-${now.getTime()}`,
          type: 'Noise Pollution Alert',
          severity: noiseLevel.level === 'Danger' ? 'high' : 'medium',
          message: `Noise level is ${noiseLevel.level} (${noise} dB). ${noiseLevel.level === 'Danger' ? 'Use hearing protection.' : 'Consider noise reduction measures.'}`,
          timestamp: now,
          resolved: false
        });
      }
    }

    // Add new alerts
    if (newAlerts.length > 0) {
      setActiveAlerts((prev: ActiveAlert[]) => {
        // Remove resolved alerts older than 1 hour
        const filtered = prev.filter((alert: ActiveAlert) =>
          !alert.resolved || (now.getTime() - alert.timestamp.getTime()) < 60 * 60 * 1000
        );
        
        // Add new alerts, avoiding duplicates
        const existingTypes = filtered.map((a: ActiveAlert) => a.type);
        const uniqueNewAlerts = newAlerts.filter((a: ActiveAlert) => !existingTypes.includes(a.type));
        
        return [...filtered, ...uniqueNewAlerts];
      });

      // Show toast notifications for new alerts
      newAlerts.forEach((alert: ActiveAlert) => {
        toast({
          variant: alert.severity === 'critical' ? 'destructive' : 'default',
          title: alert.type,
          description: alert.message,
        });
      });
    }

    // Clean up old resolved alerts
    const oneHourAgo = now.getTime() - 60 * 60 * 1000;
    setRecentlyResolved((prev: ActiveAlert[]) =>
      prev.filter((alert: ActiveAlert) => alert.timestamp.getTime() > oneHourAgo)
    );

  }, [aqi, ph, turbidity, noise, toast]);

  const resolveAlert = (alertId: string) => {
    setActiveAlerts((prev: ActiveAlert[]) =>
      prev.map((alert: ActiveAlert) =>
        alert.id === alertId
          ? { ...alert, resolved: true }
          : alert
      )
    );
    
    const alert = activeAlerts.find((a: ActiveAlert) => a.id === alertId);
    if (alert) {
      setRecentlyResolved((prev: ActiveAlert[]) => [alert, ...prev]);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Active Alerts */}
      {activeAlerts.filter((alert: ActiveAlert) => !alert.resolved).length > 0 && (
        <Card className="shadow-xl rounded-xl border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="text-2xl text-red-600 dark:text-red-400 flex items-center gap-2">
              <Bell className="h-6 w-6" />
              Active Alerts ({activeAlerts.filter((a: ActiveAlert) => !a.resolved).length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeAlerts.filter((alert: ActiveAlert) => !alert.resolved).map((alert: ActiveAlert) => (
                <Alert key={alert.id} variant={getSeverityColor(alert.severity)} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="h-4 w-4" />
                        <h4 className="font-semibold">{alert.type}</h4>
                        <span className={`${getSeverityBadgeColor(alert.severity)} text-white text-xs px-2 py-1 rounded-full`}>
                          {alert.severity.toUpperCase()}
                        </span>
                      </div>
                      <AlertDescription className="text-sm">
                        {alert.message}
                      </AlertDescription>
                      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {alert.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => resolveAlert(alert.id)}
                    >
                      Resolve
                    </Button>
                  </div>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Manual Emergency Triggers */}
        <Card className="shadow-xl rounded-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Emergency Scenarios</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Test emergency scenarios to see how the system responds.
            </p>
            <div className="grid grid-cols-1 gap-3">
              {EMERGENCY_TYPES.slice(0, 4).map((emergency) => (
                <Button
                  key={emergency.type}
                  variant="outline"
                  className="p-4 rounded-lg text-left justify-start"
                  onClick={() => onTriggerEmergency(emergency.type)}
                >
                  <emergency.icon className="mr-3 h-5 w-5 text-red-500" />
                  <div>
                    <div className="font-medium">{emergency.type}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {emergency.message.substring(0, 50)}...
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Safety Information */}
        <Card className="shadow-xl rounded-xl flex flex-col">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Safety Resources</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col flex-grow justify-between">
            <div className="relative w-full h-40 rounded-lg overflow-hidden mb-4">
               <Image
                  src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop"
                  alt="Environmental Safety"
                  fill
                  className="object-cover"
               />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Emergency Preparedness</p>
                  <p className="text-xs text-muted-foreground">
                    Create an emergency kit with essentials for environmental hazards.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <MapPin className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Local Resources</p>
                  <p className="text-xs text-muted-foreground">
                    Know your local emergency contacts and evacuation routes.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recently Resolved Alerts */}
      {recentlyResolved.length > 0 && (
        <Card className="shadow-xl rounded-xl">
          <CardHeader>
            <CardTitle className="text-xl text-green-600 dark:text-green-400">Recently Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentlyResolved.slice(0, 3).map((alert: ActiveAlert) => (
                <div key={alert.id} className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950/20 rounded">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">{alert.type}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Resolved {alert.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
