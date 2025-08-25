
"use client";

import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PollutionMonitor } from "./pollution-monitor";
import { EmergencyAlerts } from "./emergency-alerts";
import { ReportsGraphs } from "./reports-graphs";
import { EmergencyDialog } from "./emergency-dialog";
import { Learn } from "./learn";
import { LineChart, AlertTriangle, Wind, BookOpen } from "lucide-react";
import type { HistoricalData, Emergency } from "@/lib/types";
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

  const triggerEmergency = useCallback((type: string) => {
    setEmergency({ type, active: true });
  }, []);

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

    if (aqi > AQI_HAZARDOUS_THRESHOLD && prevAqi <= AQI_HAZARDOUS_THRESHOLD) {
      triggerEmergency("High Pollution Detected");
    }
  }, [aqi, ph, turbidity, noise, triggerEmergency]);


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
        <TabsList className="grid w-full grid-cols-4 bg-primary/10 rounded-lg">
          <TabsTrigger value="monitor" className="py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Wind className="mr-2 h-5 w-5" />
            <span className="hidden md:inline">Pollution Monitor</span>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <AlertTriangle className="mr-2 h-5 w-5" />
            <span className="hidden md:inline">Emergency Alerts</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <LineChart className="mr-2 h-5 w-5" />
            <span className="hidden md:inline">Reports & Graphs</span>
          </TabsTrigger>
          <TabsTrigger value="learn" className="py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <BookOpen className="mr-2 h-5 w-5" />
            <span className="hidden md:inline">Learn</span>
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
      </Tabs>
      <EmergencyDialog
        emergency={emergency}
        onOpenChange={(isOpen) => setEmergency((e) => ({ ...e, active: isOpen }))}
      />
    </div>
  );
}
