"use client";

import { useState, useEffect } from 'react';
import { useUserProfile } from '@/hooks/use-user-profile';
import { Dashboard } from './dashboard';
import { PersonalizedOnboarding } from './personalized-onboarding';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoaderCircle } from "lucide-react";

interface AdaptiveDashboardProps {
  userId?: string;
}

export function AdaptiveDashboard({ userId = 'anonymous' }: AdaptiveDashboardProps) {
  const { profile, loading, error, updateProfile } = useUserProfile(userId);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [skipOnboarding, setSkipOnboarding] = useState(false);

  // Check if user needs onboarding
  useEffect(() => {
    if (profile && !skipOnboarding) {
      // Check if profile is incomplete (missing key information)
      const needsOnboarding = (
        !profile.basicInfo.name ||
        profile.basicInfo.location.latitude === 0 ||
        profile.basicInfo.location.longitude === 0 ||
        profile.environmentalConcerns.primary === 'general' ||
        profile.preferences.alertPriorities.length === 0
      );
      
      setShowOnboarding(needsOnboarding);
    }
  }, [profile, skipOnboarding]);

  const handleOnboardingComplete = async (updatedProfile: any) => {
    try {
      await updateProfile(updatedProfile);
      setShowOnboarding(false);
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const handleSkipOnboarding = () => {
    setSkipOnboarding(true);
    setShowOnboarding(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <LoaderCircle className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your personalized experience...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-red-500 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinecap="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Oops! Something went wrong</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showOnboarding && profile) {
    return (
      <div className="min-h-screen bg-background/50 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Personalize Your EcoAlert Experience</h1>
            <Button 
              variant="ghost" 
              onClick={handleSkipOnboarding}
              className="text-muted-foreground"
            >
              Skip for now
            </Button>
          </div>
          
          <PersonalizedOnboarding 
            profile={profile}
            onComplete={handleOnboardingComplete}
          />
        </div>
      </div>
    );
  }

  // Main dashboard with personalized features
  return (
    <div className="min-h-screen bg-dot-pattern">
      {/* Personalization Banner */}
      {profile && (
        <div className="bg-card/80 backdrop-blur-sm border-b">
          <div className="max-w-5xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-semibold">
                    {profile.basicInfo.name.charAt(0).toUpperCase() || 'E'}
                  </span>
                </div>
                <div>
                  <p className="font-medium">
                    {profile.basicInfo.name ? `Welcome back, ${profile.basicInfo.name}!` : 'Welcome to EcoAlert!'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {profile.environmentalConcerns.primary === 'air' && 'Air quality focused'}
                    {profile.environmentalConcerns.primary === 'water' && 'Water quality focused'}
                    {profile.environmentalConcerns.primary === 'noise' && 'Noise pollution focused'}
                    {profile.environmentalConcerns.primary === 'general' && 'General environmental monitoring'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {profile.healthProfile.vulnerable && (
                  <div className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                    Health Priority
                  </div>
                )}
                {profile.preferences.notificationLevel === 'minimal' && (
                  <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    Minimal Notifications
                  </div>
                )}
                {profile.preferences.notificationLevel === 'detailed' && (
                  <div className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                    Detailed Alerts
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Dashboard */}
      <div className="max-w-5xl mx-auto p-4 md:p-8">
        <Dashboard />
      </div>

      {/* Personalization Quick Access */}
      {profile && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            size="lg"
            className="rounded-full shadow-lg bg-primary hover:bg-primary/90"
            onClick={() => setShowOnboarding(true)}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinecap="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
            Personalize
          </Button>
        </div>
      )}
    </div>
  );
}

// Hook for getting personalized dashboard components
export function usePersonalizedComponents() {
  const { profile, loading } = useUserProfile('anonymous');
  
  if (loading || !profile) {
    return {
      DashboardContent: () => <div>Loading...</div>,
      Sidebar: () => null,
      Header: () => null
    };
  }

  // Return components based on user profile
  const DashboardContent = () => <Dashboard />;
  
  const Sidebar = () => {
    if (profile.environmentalConcerns.primary === 'air') {
      return <AirQualitySidebar />;
    } else if (profile.environmentalConcerns.primary === 'water') {
      return <WaterQualitySidebar />;
    } else if (profile.environmentalConcerns.primary === 'noise') {
      return <NoisePollutionSidebar />;
    }
    return <GeneralSidebar />;
  };
  
  const Header = () => (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">EcoAlert</h1>
        <p className="text-muted-foreground">
          {profile.environmentalConcerns.primary === 'air' && 'Air Quality Dashboard'}
          {profile.environmentalConcerns.primary === 'water' && 'Water Quality Dashboard'}
          {profile.environmentalConcerns.primary === 'noise' && 'Noise Pollution Dashboard'}
          {profile.environmentalConcerns.primary === 'general' && 'Environmental Dashboard'}
        </p>
      </div>
    </div>
  );

  return { DashboardContent, Sidebar, Header };
}

// Sidebar components based on user preferences
function AirQualitySidebar() {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-card/50 rounded-lg">
        <h3 className="font-semibold mb-2">Air Quality Focus</h3>
        <p className="text-sm text-muted-foreground">
          Prioritizing air quality metrics and health recommendations based on your profile.
        </p>
      </div>
    </div>
  );
}

function WaterQualitySidebar() {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-card/50 rounded-lg">
        <h3 className="font-semibold mb-2">Water Quality Focus</h3>
        <p className="text-sm text-muted-foreground">
          Focused on water pH, turbidity, and safety recommendations.
        </p>
      </div>
    </div>
  );
}

function NoisePollutionSidebar() {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-card/50 rounded-lg">
        <h3 className="font-semibold mb-2">Noise Pollution Focus</h3>
        <p className="text-sm text-muted-foreground">
          Monitoring noise levels and providing peace recommendations.
        </p>
      </div>
    </div>
  );
}

function GeneralSidebar() {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-card/50 rounded-lg">
        <h3 className="font-semibold mb-2">General Monitoring</h3>
        <p className="text-sm text-muted-foreground">
          Comprehensive environmental monitoring across all metrics.
        </p>
      </div>
    </div>
  );
}