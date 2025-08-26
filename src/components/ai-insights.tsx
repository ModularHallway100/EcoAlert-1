
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, TrendingDown, ShieldCheck, AlertTriangle, Leaf } from "lucide-react";
import { Badge } from "./ui/badge";

const weeklyInsights = {
  title: "Your Weekly Environmental Summary",
  priority: "Medium",
  summary: "This week saw a slight improvement in overall air quality, with AQI levels averaging in the 'Moderate' range. However, two significant noise pollution spikes were detected during evening rush hours on Tuesday and Thursday. Water quality remained stable and within safe limits.",
  trends: [
    {
      metric: "Air Quality (AQI)",
      change: -12,
      description: "Average AQI decreased, indicating better air quality compared to last week.",
      Icon: TrendingDown,
      color: "text-green-500"
    },
    {
      metric: "Noise Pollution",
      change: 8,
      description: "Peak noise levels were higher than usual, especially on weekdays.",
      Icon: TrendingUp,
      color: "text-red-500"
    },
    {
      metric: "Water Quality",
      change: 0,
      description: "Water pH and Turbidity levels were consistent and stayed within the safe range.",
      Icon: ShieldCheck,
      color: "text-blue-500"
    }
  ],
  recommendation: {
    title: "Recommendation for Next Week",
    text: "Consider using noise-cancelling headphones during your evening commute or exploring quieter routes. Since air quality is improving, it's a good time for outdoor activities during off-peak hours.",
    Icon: Leaf
  }
};

export function AIInsights() {
    const priorityVariant = {
        'High': 'destructive',
        'Medium': 'secondary',
        'Low': 'default'
    } as const;

  return (
    <Card className="shadow-xl rounded-xl w-full max-w-3xl mx-auto bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl text-primary flex items-center">
          <Leaf className="mr-3 h-7 w-7" />
          AI Environmental Insights
        </CardTitle>
        <CardDescription>
          An AI-generated summary of your environmental data from the past week.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Card className="bg-background/70">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium text-primary">{weeklyInsights.title}</CardTitle>
                <Badge variant={priorityVariant[weeklyInsights.priority as keyof typeof priorityVariant] || 'default'}>{weeklyInsights.priority} Priority</Badge>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">{weeklyInsights.summary}</p>
            </CardContent>
        </Card>
        
        <div>
            <h3 className="text-lg font-semibold mb-4">Key Trends This Week</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {weeklyInsights.trends.map((trend) => (
                <Card key={trend.metric} className="flex flex-col justify-between bg-background/70">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-medium flex items-center">
                            <trend.Icon className={`mr-2 h-5 w-5 ${trend.color}`} />
                            {trend.metric}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">{trend.description}</p>
                    </CardContent>
                </Card>
            ))}
            </div>
        </div>

        <Card className="bg-background/70 border-primary/30">
            <CardHeader>
                 <CardTitle className="text-lg font-medium flex items-center">
                    <weeklyInsights.recommendation.Icon className="mr-2 h-5 w-5 text-primary" />
                    {weeklyInsights.recommendation.title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">{weeklyInsights.recommendation.text}</p>
            </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
