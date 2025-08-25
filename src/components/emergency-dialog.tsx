"use client";

import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EMERGENCY_TYPES } from "@/lib/constants";
import type { Emergency } from "@/lib/types";
import { Mail } from "lucide-react";

type EmergencyDialogProps = {
  emergency: Emergency;
  onOpenChange: (isOpen: boolean) => void;
};

export function EmergencyDialog({ emergency, onOpenChange }: EmergencyDialogProps) {
  const [tone, setTone] = useState<any>(null);

  useEffect(() => {
    // Dynamically import Tone.js only on the client side
    import('tone').then(Tone => {
        setTone(new Tone.Synth().toDestination());
    });
  }, []);

  useEffect(() => {
    if (emergency.active && tone) {
      try {
        // Play sound
        tone.triggerAttackRelease("C5", "8n");
        
        // Vibrate
        if (window.navigator && window.navigator.vibrate) {
          window.navigator.vibrate([200, 100, 200]);
        }
      } catch (error) {
        console.error("Failed to play alert sound or vibrate:", error);
      }
    }
  }, [emergency.active, tone]);

  const emergencyDetails = EMERGENCY_TYPES.find(
    (e) => e.type === emergency.type
  ) || {
    icon: () => null,
    message: "An unknown emergency has occurred. Please proceed with caution.",
  };

  const Icon = emergencyDetails.icon;

  return (
    <AlertDialog open={emergency.active} onOpenChange={onOpenChange}>
      <AlertDialogContent className="border-4 border-destructive bg-background/95 backdrop-blur-sm">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center text-3xl text-destructive font-headline">
            <Icon className="mr-4 h-10 w-10 animate-pulse" />
            EMERGENCY ALERT
          </AlertDialogTitle>
          <AlertDialogDescription className="text-lg text-foreground/80 pt-4">
            {emergencyDetails.message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex items-center justify-center p-4 mt-2 bg-secondary/50 rounded-lg">
          <Mail className="h-5 w-5 mr-3 text-accent animate-pulse" />
          <p className="text-sm text-muted-foreground">Simulating SMS & Email alerts...</p>
        </div>
        <AlertDialogFooter className="mt-2">
          <AlertDialogAction className="px-8 py-4 text-lg">
            Acknowledge
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
