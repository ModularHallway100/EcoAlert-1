"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EMERGENCY_TYPES } from "@/lib/constants";
import Image from 'next/image';

type EmergencyAlertsProps = {
  onTriggerEmergency: (type: string) => void;
};

export function EmergencyAlerts({ onTriggerEmergency }: EmergencyAlertsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">Manual Emergency Triggers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Press a button to simulate an emergency and test the alert system.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {EMERGENCY_TYPES.map((emergency) => (
              <Button
                key={emergency.type}
                variant="destructive"
                className="py-6 text-lg rounded-lg"
                onClick={() => onTriggerEmergency(emergency.type)}
              >
                <emergency.icon className="mr-2 h-6 w-6" />
                {emergency.type}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-lg rounded-lg flex flex-col">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">Stay Safe & Aware</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col flex-grow justify-between">
          <div className="relative w-full h-48 rounded-lg overflow-hidden mb-4">
             <Image 
                src="https://placehold.co/600x400.png"
                alt="Awareness Poster" 
                fill
                className="object-cover"
                data-ai-hint="environmental awareness poster"
             />
          </div>
          <blockquote className="italic text-muted-foreground border-l-4 border-accent pl-4 mb-4">
            "The Earth does not belong to us: we belong to the Earth."
            <cite className="block not-italic text-right text-primary/80 mt-1">- Marlee Matlin</cite>
          </blockquote>
          <blockquote className="italic text-muted-foreground border-l-4 border-accent pl-4">
            "Look deep into nature, and then you will understand everything better."
            <cite className="block not-italic text-right text-primary/80 mt-1">- Albert Einstein</cite>
          </blockquote>
        </CardContent>
      </Card>
    </div>
  );
}
