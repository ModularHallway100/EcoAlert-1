"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, 
  Heart, 
  Bell, 
  Settings, 
  CheckCircle, 
  ArrowRight,
  User,
  Activity,
  Shield,
  Globe
} from "lucide-react";
import type { UserProfile } from "@/lib/user-profile";

interface PersonalizedOnboardingProps {
  profile: UserProfile;
  onComplete: (updatedProfile: any) => void;
}

const ENVIRONMENTAL_CONCERNS = [
  { id: 'air', label: 'Air Quality', icon: '🌫️', description: 'Focus on air pollution, AQI, and respiratory health' },
  { id: 'water', label: 'Water Quality', icon: '💧', description: 'Focus on pH, turbidity, and water safety' },
  { id: 'noise', label: 'Noise Pollution', icon: '🔊', description: 'Focus on noise levels and acoustic comfort' },
  { id: 'general', label: 'General Monitoring', icon: '🌍', description: 'Balanced monitoring of all environmental factors' }
];

const HEALTH_CONDITIONS = [
  'asthma', 'copd', 'allergies', 'heart_disease', 'lung_disease', 
  'children', 'elderly', 'pregnant', 'autoimmune', 'diabetes'
];

export function PersonalizedOnboarding({ profile, onComplete }: PersonalizedOnboardingProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: profile.basicInfo.name || '',
    location: profile.basicInfo.location || { latitude: 0, longitude: 0 },
    primaryConcern: profile.environmentalConcerns.primary || 'general',
    healthConditions: profile.healthProfile.respiratoryConditions || [],
    vulnerable: profile.healthProfile.vulnerable || false,
    notificationLevel: profile.preferences.notificationLevel || 'moderate',
    alertPriorities: profile.preferences.alertPriorities || ['air', 'general']
  });

  const handleLocationSet = (lat: number, lon: number) => {
    setFormData(prev => ({
      ...prev,
      location: { latitude: lat, longitude: lon }
    }));
  };

  const handleHealthConditionToggle = (condition: string) => {
    setFormData(prev => ({
      ...prev,
      healthConditions: prev.healthConditions.includes(condition)
        ? prev.healthConditions.filter(c => c !== condition)
        : [...prev.healthConditions, condition],
      vulnerable: condition === 'children' || condition === 'elderly' || condition === 'pregnant' || 
                 prev.healthConditions.length > 0
    }));
  };

  const handleAlertPriorityToggle = (priority: string) => {
    setFormData(prev => ({
      ...prev,
      alertPriorities: prev.alertPriorities.includes(priority)
        ? prev.alertPriorities.filter(p => p !== priority)
        : [...prev.alertPriorities, priority]
    }));
  };

  const handleSubmit = () => {
    const updatedProfile = {
      basicInfo: {
        name: formData.name,
        location: formData.location,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      preferences: {
        ...profile.preferences,
        notificationLevel: formData.notificationLevel,
        alertPriorities: formData.alertPriorities
      },
      healthProfile: {
        ...profile.healthProfile,
        respiratoryConditions: formData.healthConditions,
        vulnerable: formData.vulnerable
      },
      environmentalConcerns: {
        ...profile.environmentalConcerns,
        primary: formData.primaryConcern
      }
    };
    
    onComplete(updatedProfile);
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  if (step === 1) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Welcome to EcoAlert!</h1>
          <p className="text-muted-foreground">Let's personalize your environmental monitoring experience</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Tell us about yourself
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your name"
              />
            </div>

            <div className="space-y-4">
              <Label>What's your primary environmental concern?</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ENVIRONMENTAL_CONCERNS.map((concern) => (
                  <Card
                    key={concern.id}
                    className={`cursor-pointer transition-all ${
                      formData.primaryConcern === concern.id 
                        ? 'ring-2 ring-primary bg-primary/5' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, primaryConcern: concern.id }))}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{concern.icon}</span>
                        <div>
                          <h4 className="font-semibold">{concern.label}</h4>
                          <p className="text-sm text-muted-foreground">{concern.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={nextStep}>
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Health & Safety Profile</h1>
          <p className="text-muted-foreground">Help us provide better recommendations for your needs</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Health Conditions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select any conditions that apply to you. This helps us provide more personalized safety recommendations.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {HEALTH_CONDITIONS.map((condition) => (
                <div
                  key={condition}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    formData.healthConditions.includes(condition)
                      ? 'border-primary bg-primary/5'
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => handleHealthConditionToggle(condition)}
                >
                  <div className="flex items-center gap-2">
                    <Switch checked={formData.healthConditions.includes(condition)} />
                    <span className="text-sm font-medium capitalize">{condition.replace('_', ' ')}</span>
                  </div>
                </div>
              ))}
            </div>

            {formData.vulnerable && (
              <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
                    Priority Health Profile Activated
                  </span>
                </div>
                <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                  We'll prioritize your safety and provide enhanced recommendations.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-between gap-4">
          <Button variant="outline" onClick={prevStep}>
            ← Back
          </Button>
          <Button onClick={nextStep}>
            Continue <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Notification Preferences</h1>
          <p className="text-muted-foreground">Choose how you'd like to receive environmental alerts</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Alert Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label>Notification Level</Label>
              <div className="space-y-3">
                {[
                  { value: 'minimal', label: 'Minimal', description: 'Only critical alerts' },
                  { value: 'moderate', label: 'Moderate', description: 'Important alerts and updates' },
                  { value: 'detailed', label: 'Detailed', description: 'All alerts and insights' }
                ].map((level) => (
                  <div
                    key={level.value}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      formData.notificationLevel === level.value
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, notificationLevel: level.value }))}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{level.label}</h4>
                        <p className="text-sm text-muted-foreground">{level.description}</p>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        formData.notificationLevel === level.value 
                          ? 'border-primary bg-primary' 
                          : 'border-muted-foreground'
                      }`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <Label>Alert Priorities</Label>
              <p className="text-sm text-muted-foreground">
                Select which environmental factors you want to prioritize for alerts
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { id: 'air', label: 'Air Quality', icon: '🌫️' },
                  { id: 'water', label: 'Water', icon: '💧' },
                  { id: 'noise', label: 'Noise', icon: '🔊' },
                  { id: 'general', label: 'General', icon: '🌍' }
                ].map((priority) => (
                  <div
                    key={priority.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      formData.alertPriorities.includes(priority.id)
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => handleAlertPriorityToggle(priority.id)}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-xl">{priority.icon}</span>
                      <span className="text-sm font-medium">{priority.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between gap-4">
          <Button variant="outline" onClick={prevStep}>
            ← Back
          </Button>
          <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90">
            Complete Setup <CheckCircle className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }
}