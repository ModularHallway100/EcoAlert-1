"use client";

import { useState } from "react";
import { Gauge } from "./gauge";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Sparkles, LoaderCircle, Leaf, AlertTriangle, Droplets, Waves, Ear } from "lucide-react";
import { getPollutionReductionTips } from "@/ai/flows/pollution-reduction-tips";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Skeleton } from "./ui/skeleton";
import { Progress } from "./ui/progress";

type PollutionMonitorProps = {
  aqi: number | null;
  dominantPollutant: string | null;
  ph: number | null;
  turbidity: number | null;
  noise: number | null;
  loading: boolean;
  error: string | null;
};

const MetricCard = ({ icon, title, value, unit, progress, max, colorClass }: { icon: React.ReactNode, title: string, value: number | null, unit: string, progress: number, max: number, colorClass: string }) => {
  return (
    <div className="flex items-center space-x-4">
      <div className={`p-3 rounded-full ${colorClass}`}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-baseline">
          <p className="font-semibold">{title}</p>
          <p className="text-xl font-bold font-headline">{value !== null ? `${value} ${unit}` : '...'}</p>
        </div>
        <Progress value={progress} className="h-2 mt-1" indicatorClassName={colorClass} />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>0</span>
          <span>{max}</span>
        </div>
      </div>
    </div>
  )
}

export function PollutionMonitor({ aqi, dominantPollutant, ph, turbidity, noise, loading, error }: PollutionMonitorProps) {
  const [tips, setTips] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGetTips = async () => {
    if (aqi === null) return;
    setIsLoading(true);
    setTips([]);
    try {
      const result = await getPollutionReductionTips({ aqi, dominantPollutant: dominantPollutant ?? undefined });
      setTips(result.tips);
    } catch (error) {
      console.error("Error getting pollution reduction tips:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not fetch pollution reduction tips. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPhColor = (value: number | null) => {
    if (value === null) return "bg-muted";
    if (value >= 6.5 && value <= 7.5) return "bg-green-500";
    if (value >= 6 && value < 6.5 || value > 7.5 && value <= 8) return "bg-yellow-500";
    return "bg-red-500";
  }

  const getTurbidityColor = (value: number | null) => {
    if (value === null) return "bg-muted";
    if (value <= 25) return "bg-green-500";
    if (value <= 50) return "bg-yellow-500";
    return "bg-red-500";
  }

  const getNoiseColor = (value: number | null) => {
    if (value === null) return "bg-muted";
    if (value <= 70) return "bg-green-500";
    if (value <= 90) return "bg-yellow-500";
    return "bg-red-500";
  }


  return (
    <Card className="shadow-lg rounded-lg">
      <CardHeader>
        <CardTitle className="text-2xl text-primary">Live Environmental Monitor</CardTitle>
        <CardDescription>
          Simulated sensor data, updated every 5 seconds.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="flex flex-col items-center">
          {loading && (
            <div className="flex flex-col items-center gap-4">
              <Skeleton className="w-64 h-64 md:w-80 md:h-80 rounded-full" />
              <p className="text-muted-foreground animate-pulse">Initializing sensors...</p>
            </div>
          )}
          {error && (
            <Alert variant="destructive" className="w-full max-w-md">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Simulation Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {aqi !== null && !loading && !error && (
              <Gauge value={aqi} />
          )}
        </div>

        <div className="space-y-6">
          <MetricCard
            icon={<Droplets className="h-6 w-6 text-primary-foreground" />}
            title="Water pH Level"
            value={ph}
            unit=""
            progress={(ph ?? 0) / 14 * 100}
            max={14}
            colorClass={getPhColor(ph)}
          />
          <MetricCard
            icon={<Waves className="h-6 w-6 text-primary-foreground" />}
            title="Turbidity"
            value={turbidity}
            unit="NTU"
            progress={turbidity ?? 0}
            max={100}
            colorClass={getTurbidityColor(turbidity)}
          />
          <MetricCard
            icon={<Ear className="h-6 w-6 text-primary-foreground" />}
            title="Noise Level"
            value={noise}
            unit="dB"
            progress={(noise ?? 0) / 120 * 100}
            max={120}
            colorClass={getNoiseColor(noise)}
          />
        </div>
        
        <div className="md:col-span-2 w-full max-w-md text-center mx-auto">
          <Button onClick={handleGetTips} disabled={isLoading || aqi === null} size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-8 py-6 text-lg">
            {isLoading ? (
              <LoaderCircle className="mr-2 h-6 w-6 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-6 w-6" />
            )}
            Get AI-Powered Reduction Tips
          </Button>

          {isLoading && aqi && <p className="mt-4 text-muted-foreground animate-pulse">Generating tips for AQI {Math.round(aqi)}...</p>}

          {tips.length > 0 && (
             <Alert className="mt-6 text-left bg-primary/5 border-primary/20 rounded-lg">
              <Leaf className="h-5 w-5 text-primary" />
              <AlertTitle className="font-bold text-primary">Your Personalized Eco-Tips</AlertTitle>
              <AlertDescription>
                <ul className="mt-2 space-y-2 list-disc pl-5 text-foreground/90">
                    {tips.map((tip, index) => (
                        <li key={index}>{tip}</li>
                    ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
