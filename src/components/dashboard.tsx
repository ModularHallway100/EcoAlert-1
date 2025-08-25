
"use client";

import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PollutionMonitor } from "./pollution-monitor";
import { EmergencyAlerts } from "./emergency-alerts";
import { ReportsGraphs } from "./reports-graphs";
import { EmergencyDialog } from "./emergency-dialog";
import { Learn } from "./learn";
import { Settings } from "./settings";
import { LineChart, AlertTriangle, Wind, BookOpen, Settings as SettingsIcon } from "lucide-react";
import type { HistoricalData, Emergency, AlertSettings } from "@/lib/types";
import { AQI_HAZARDOUS_THRESHOLD, MAX_HISTORY_LENGTH } from "@/lib/constants";
import { useEnvironmentalData } from "@/hooks/use-aqi";
import { ThemeToggle } from "./theme-toggle";

export function Dashboard() {
  const { aqi, dominantPollutant, ph, turbidity, noise, loading, error } = useEnvironmentalData();
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);
  const [emergency, setEmergency] = useState<Emergency>({
    type: null,
    active: false,
  });
  const [alertSettings, setAlertSettings] = useState<AlertSettings>({
    notificationsEnabled: false,
    aqiThreshold: AQI_HAZARDOUS_THRESHOLD,
    phMinThreshold: 6.0,
    phMaxThreshold: 8.0,
    turbidityThreshold: 50,
    noiseThreshold: 90,
  });
  const [notificationPermission, setNotificationPermission] = useState('default');

  useEffect(() => {
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const triggerEmergency = useCallback((type: string, message?: string) => {
    setEmergency({ type, active: true });
    if (alertSettings.notificationsEnabled && notificationPermission === 'granted') {
        new Notification('EcoAlert: Emergency', {
            body: message || `An emergency of type "${type}" has been triggered.`,
            icon: '/favicon.ico'
        });
    }
  }, [alertSettings.notificationsEnabled, notificationPermission]);

  useEffect(() => {
    if (aqi === null || ph === null || turbidity === null || noise === null) return;
    
    const prevAqi = historicalData.length > 0 ? historicalData[historicalData.length - 1].aqi : 0;

    setHistoricalData((prevHistory) => {
      const newEntry = {
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        aqi: aqi,
        ph: ph,
        turbidity: turbidity,
        noise: noise
      };
      const updatedHistory = [...prevHistory, newEntry];
      return updatedHistory.slice(-MAX_HISTORY_LENGTH);
    });

    if (aqi > alertSettings.aqiThreshold && prevAqi <= alertSettings.aqiThreshold) {
      triggerEmergency("High Pollution Detected", `AQI has exceeded your threshold of ${alertSettings.aqiThreshold}.`);
    }
     if ((ph < alertSettings.phMinThreshold || ph > alertSettings.phMaxThreshold)) {
      triggerEmergency("Water Quality Alert", `Water pH (${ph}) is outside your safe range of ${alertSettings.phMinThreshold}-${alertSettings.phMaxThreshold}.`);
    }
    if (turbidity > alertSettings.turbidityThreshold) {
      triggerEmergency("Water Quality Alert", `Water turbidity (${turbidity} NTU) has exceeded your threshold of ${alertSettings.turbidityThreshold} NTU.`);
    }
    if (noise > alertSettings.noiseThreshold) {
      triggerEmergency("Noise Pollution Alert", `Noise level (${noise} dB) has exceeded your threshold of ${alertSettings.noiseThreshold} dB.`);
    }

  }, [aqi, ph, turbidity, noise, triggerEmergency, alertSettings]);


  return (
    <div className="w-full max-w-4xl mx-auto">
      <header className="text-center mb-8 relative">
        <h1 className="text-4xl md:text-5xl font-bold text-primary">
          EcoAlert
        </h1>
        <p className="text-muted-foreground mt-2">
          Your Real-Time Environmental Guardian
        </p>
        <div className="absolute top-0 right-0">
            <ThemeToggle />
        </div>
      </header>
      <Tabs defaultValue="monitor" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-primary/10 rounded-lg">
          <TabsTrigger value="monitor" className="py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Wind className="mr-2 h-5 w-5" />
            <span className="hidden md:inline">Monitor</span>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <AlertTriangle className="mr-2 h-5 w-5" />
            <span className="hidden md:inline">Alerts</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <LineChart className="mr-2 h-5 w-5" />
            <span className="hidden md:inline">Reports</span>
          </TabsTrigger>
          <TabsTrigger value="learn" className="py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <BookOpen className="mr-2 h-5 w-5" />
            <span className="hidden md:inline">Learn</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <SettingsIcon className="mr-2 h-5 w-5" />
            <span className="hidden md:inline">Settings</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="monitor" className="mt-6">
          <PollutionMonitor 
            aqi={aqi} 
            dominantPollutant={dominantPollutant}
            ph={ph}
            turbidity={turbidity}
            noise={noise}
            loading={loading} 
            error={error} />
        </TabsContent>
        <TabsContent value="alerts" className="mt-6">
          <EmergencyAlerts onTriggerEmergency={triggerEmergency} />
        </TabsContent>
        <TabsContent value="reports" className="mt-6">
          <ReportsGraphs data={historicalData} />
        </TabsContent>
        <TabsContent value="learn" className="mt-6">
          <Learn />
        </TabsContent>
        <TabsContent value="settings" className="mt-6">
          <Settings 
            settings={alertSettings} 
            onSettingsChange={setAlertSettings} 
            notificationPermission={notificationPermission}
            setNotificationPermission={setNotificationPermission}
            />
        </TabsContent>
      </Tabs>
      <EmergencyDialog
        emergency={emergency}
        onOpenChange={(isOpen) => setEmergency((e) => ({ ...e, active: isOpen }))}
      />
    </div>
  );
}
