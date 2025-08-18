"use client";

import { useState } from "react";
import { Gauge } from "./gauge";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Sparkles, LoaderCircle, Leaf, AlertTriangle } from "lucide-react";
import { getPollutionReductionTips } from "@/ai/flows/pollution-reduction-tips";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Skeleton } from "./ui/skeleton";

type PollutionMonitorProps = {
  aqi: number | null;
  loading: boolean;
  error: string | null;
};

export function PollutionMonitor({ aqi, loading, error }: PollutionMonitorProps) {
  const [tips, setTips] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGetTips = async () => {
    if (aqi === null) return;
    setIsLoading(true);
    setTips([]);
    try {
      const result = await getPollutionReductionTips({ aqi });
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

  return (
    <Card className="shadow-lg border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-primary">Live Air Quality Index (AQI)</CardTitle>
        <CardDescription>
          AQI based on your current location. Updates automatically.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-8">
        {loading && (
          <div className="flex flex-col items-center gap-4">
            <Skeleton className="w-64 h-64 md:w-80 md:h-80 rounded-full" />
            <p className="text-muted-foreground animate-pulse">Fetching local AQI data...</p>
          </div>
        )}
        {error && (
          <Alert variant="destructive" className="w-full max-w-md">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error Fetching Data</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {aqi !== null && !loading && !error && (
            <Gauge value={aqi} />
        )}
        <div className="w-full max-w-md text-center">
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
             <Alert className="mt-6 text-left bg-primary/5 border-primary/20">
              <Leaf className="h-5 w-5 text-primary" />
              <AlertTitle className="font-headline text-primary">Your Personalized Eco-Tips</AlertTitle>
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
