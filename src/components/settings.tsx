
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import type { AlertSettings } from "@/lib/types";
import { Bell, BellOff } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

type SettingsProps = {
  settings: AlertSettings;
  onSettingsChange: (settings: AlertSettings) => void;
  notificationPermission: string;
  setNotificationPermission: (permission: string) => void;
};

export function Settings({ settings, onSettingsChange, notificationPermission, setNotificationPermission }: SettingsProps) {

  const handleRequestNotificationPermission = () => {
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notification");
      return;
    }
    Notification.requestPermission().then(permission => {
      setNotificationPermission(permission);
      if (permission === 'granted') {
        onSettingsChange({ ...settings, notificationsEnabled: true });
      } else {
        onSettingsChange({ ...settings, notificationsEnabled: false });
      }
    });
  };

  const handleToggleNotifications = (enabled: boolean) => {
    if (enabled && notificationPermission !== 'granted') {
        handleRequestNotificationPermission();
    } else {
        onSettingsChange({ ...settings, notificationsEnabled: enabled });
    }
  };

  return (
    <Card className="shadow-xl rounded-xl">
      <CardHeader>
        <CardTitle className="text-2xl text-primary">Alert Settings</CardTitle>
        <CardDescription>
          Customize the thresholds for when you receive environmental alerts.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
            <div>
                <Label htmlFor="notifications-switch" className="text-lg font-semibold">
                    Enable Push Notifications
                </Label>
                <p className="text-sm text-muted-foreground">Receive browser notifications for alerts.</p>
            </div>
          <Switch
            id="notifications-switch"
            checked={settings.notificationsEnabled && notificationPermission === 'granted'}
            onCheckedChange={handleToggleNotifications}
            disabled={notificationPermission === 'denied'}
          />
        </div>
        {notificationPermission === 'denied' && (
            <Alert variant="destructive">
                <BellOff className="h-4 w-4" />
                <AlertTitle>Notifications Denied</AlertTitle>
                <AlertDescription>You have blocked notifications. To enable them, please update your browser settings for this site.</AlertDescription>
            </Alert>
        )}
        {notificationPermission === 'default' && (
             <Alert>
                <Bell className="h-4 w-4" />
                <AlertTitle>Enable Notifications</AlertTitle>
                <AlertDescription>
                    <p className="mb-2">Get notified about important environmental changes instantly.</p>
                    <Button onClick={handleRequestNotificationPermission}>Allow Notifications</Button>
                </AlertDescription>
            </Alert>
        )}

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="aqi-slider" className="text-base">
              AQI Threshold
            </Label>
            <span className="font-bold text-primary text-lg">{settings.aqiThreshold}</span>
          </div>
          <Slider
            id="aqi-slider"
            min={50}
            max={300}
            step={10}
            value={[settings.aqiThreshold]}
            onValueChange={([value]) => onSettingsChange({ ...settings, aqiThreshold: value })}
          />
           <p className="text-sm text-muted-foreground">An AQI value below 50 is generally considered good. Alerts are typically set for values over 100.</p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="ph-slider" className="text-base">
              Water pH Safe Range
            </Label>
             <span className="font-bold text-primary text-lg">{settings.phMinThreshold.toFixed(1)} - {settings.phMaxThreshold.toFixed(1)}</span>
          </div>
          <Slider
            id="ph-slider"
            min={0}
            max={14}
            step={0.1}
            value={[settings.phMinThreshold, settings.phMaxThreshold]}
            onValueChange={([min, max]) => onSettingsChange({ ...settings, phMinThreshold: min, phMaxThreshold: max })}
          />
          <p className="text-sm text-muted-foreground">The ideal range for drinking water is typically between 6.5 and 8.5 pH.</p>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="turbidity-slider" className="text-base">
              Turbidity Threshold (NTU)
            </Label>
             <span className="font-bold text-primary text-lg">{settings.turbidityThreshold} NTU</span>
          </div>
          <Slider
            id="turbidity-slider"
            min={10}
            max={100}
            step={5}
            value={[settings.turbidityThreshold]}
            onValueChange={([value]) => onSettingsChange({ ...settings, turbidityThreshold: value })}
          />
           <p className="text-sm text-muted-foreground">For drinking water, turbidity should ideally be below 5 NTU (Nephelometric Turbidity Units).</p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="noise-slider" className="text-base">
              Noise Threshold (dB)
            </Label>
             <span className="font-bold text-primary text-lg">{settings.noiseThreshold} dB</span>
          </div>
          <Slider
            id="noise-slider"
            min={50}
            max={120}
            step={5}
            value={[settings.noiseThreshold]}
            onValueChange={([value]) => onSettingsChange({ ...settings, noiseThreshold: value })}
          />
          <p className="text-sm text-muted-foreground">Continuous exposure to noise above 85 dB can be harmful. A quiet library is about 40 dB.</p>
        </div>

      </CardContent>
    </Card>
  );
}
