
"use client";

import { useState } from "react";
import { Gauge } from "./gauge";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Sparkles, LoaderCircle, Leaf, AlertTriangle, Droplets, Waves, Ear, Forward } from "lucide-react";
import { getPollutionReductionTips, type PollutionReductionTipsOutput } from "@/ai/flows/pollution-reduction-tips";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Skeleton } from "./ui/skeleton";
import { Progress } from "./ui/progress";
import { NOISE_LEVELS, PH_LEVELS, TURBIDITY_LEVELS } from "@/lib/constants";
import { Separator } from "./ui/separator";

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
  const [tips, setTips] = useState<PollutionReductionTipsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGetTips = async () => {
    if (aqi === null) return;
    setIsLoading(true);
    setTips(null);
    try {
      const result = await getPollutionReductionTips({ aqi, dominantPollutant: dominantPollutant ?? undefined, ph: ph ?? undefined, turbidity: turbidity ?? undefined, noise: noise ?? undefined });
      setTips(result);
    } catch (error) {
      console.error("Error getting pollution reduction tips:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not fetch AI-powered insights. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getColor = (levels: { min: number, max: number, colorClass: string }[], value: number | null) => {
    if (value === null) return "bg-muted";
    const level = levels.find(l => value >= l.min && value <= l.max);
    return level ? level.colorClass : "bg-muted";
  };

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
            colorClass={getColor(PH_LEVELS, ph)}
          />
          <MetricCard
            icon={<Waves className="h-6 w-6 text-primary-foreground" />}
            title="Turbidity"
            value={turbidity}
            unit="NTU"
            progress={turbidity ?? 0}
            max={100}
            colorClass={getColor(TURBIDITY_LEVELS, turbidity)}
          />
          <MetricCard
            icon={<Ear className="h-6 w-6 text-primary-foreground" />}
            title="Noise Level"
            value={noise}
            unit="dB"
            progress={(noise ?? 0) / 120 * 100}
            max={120}
            colorClass={getColor(NOISE_LEVELS, noise)}
          />
        </div>
        
        <div className="md:col-span-2 w-full max-w-2xl text-center mx-auto">
          <Button onClick={handleGetTips} disabled={isLoading || aqi === null} size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-8 py-6 text-lg">
            {isLoading ? (
              <LoaderCircle className="mr-2 h-6 w-6 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-6 w-6" />
            )}
            Get AI-Powered Insights
          </Button>

          {isLoading && aqi && <p className="mt-4 text-muted-foreground animate-pulse">Generating insights for your environment...</p>}

          {tips && (
             <Alert className="mt-6 text-left bg-primary/5 border-primary/20 rounded-lg p-6">
              <Leaf className="h-5 w-5 text-primary" />
              <AlertTitle className="font-bold text-primary text-xl mb-2">{tips.title}</AlertTitle>
              <AlertDescription className="space-y-4">
                <p className="text-foreground/90">{tips.insight}</p>
                <Separator />
                <div>
                  <h4 className="font-semibold text-foreground flex items-center mb-2">
                    <Forward className="h-4 w-4 mr-2" />
                    What To Do Next:
                  </h4>
                  <ul className="space-y-2 list-disc pl-5 text-foreground/80">
                      {tips.nextSteps.map((step, index) => (
                          <li key={index}>{step}</li>
                      ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
