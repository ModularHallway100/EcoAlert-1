"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@clerk/nextjs';
import { useAnalytics } from '@/components/analytics-provider';
import { useTrackFeature } from '@/components/analytics-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Leaf,
  User,
  MapPin,
  Heart,
  Shield,
  Bell,
  Users,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OnboardingData {
  basicInfo: {
    name: string;
    location: { latitude: number; longitude: number };
    timezone: string;
  };
  preferences: {
    units: 'metric' | 'imperial';
    language: string;
    theme: 'light' | 'dark' | 'auto';
    notificationLevel: 'minimal' | 'moderate' | 'detailed';
    alertPriorities: ('air' | 'water' | 'noise' | 'general')[];
  };
  healthProfile: {
    respiratoryConditions: string[];
    allergies: string[];
    ageGroup: 'child' | 'adult' | 'senior';
    activityLevel: 'sedentary' | 'moderate' | 'active';
    pregnancyStatus: boolean;
    vulnerable: boolean;
  };
  environmentalConcerns: {
    primary: 'air' | 'water' | 'noise' | 'general';
    sensitivity: 'low' | 'medium' | 'high';
    interests: string[];
  };
}

const DEFAULT_ONBOARDING: OnboardingData = {
  basicInfo: {
    name: '',
    location: { latitude: 0, longitude: 0 },
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  },
  preferences: {
    units: 'metric',
    language: 'en',
    theme: 'auto',
    notificationLevel: 'moderate',
    alertPriorities: ['air', 'general']
  },
  healthProfile: {
    respiratoryConditions: [],
    allergies: [],
    ageGroup: 'adult',
    activityLevel: 'moderate',
    pregnancyStatus: false,
    vulnerable: false
  },
  environmentalConcerns: {
    primary: 'air',
    sensitivity: 'medium',
    interests: []
  }
};

const ENVIRONMENTAL_INTERESTS = [
  'air_quality',
  'water_quality', 
  'noise_pollution',
  'climate_change',
  'renewable_energy',
  'conservation',
  'sustainable_living',
  'indoor_air',
  'urban_planning',
  'health_impact'
];

const HEALTH_CONDITIONS = [
  'asthma',
  'copd',
  'allergies',
  'heart_disease',
  'lung_disease',
  'children',
  'elderly',
  'pregnant',
  'autoimmune',
  'diabetes'
];

export default function OnboardingPage() {
  const { isSignedIn, user } = useUser();
  const { trackEvent } = useAnalytics();
  const trackFeature = useTrackFeature('onboarding');
  const { toast } = useToast();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isSignedIn) {
      router.push('/sign-in');
    }
  }, [isSignedIn, router]);

  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>(DEFAULT_ONBOARDING);
  const [isLoading, setIsLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const steps = [
    { id: 'welcome', title: 'Welcome', description: 'Get started with EcoAlert' },
    { id: 'basic', title: 'Basic Info', description: 'Tell us about yourself' },
    { id: 'location', title: 'Location', description: 'Set your location' },
    { id: 'preferences', title: 'Preferences', description: 'Customize your experience' },
    { id: 'health', title: 'Health Profile', description: 'Share health information' },
    { id: 'environment', title: 'Environmental Concerns', description: 'Your environmental interests' },
    { id: 'complete', title: 'Complete', description: 'Finish setup' }
  ];

  // Track onboarding progress
  useEffect(() => {
    trackEvent('onboarding_progress', {
      step: currentStep,
      totalSteps: steps.length,
      progress: (currentStep / steps.length) * 100
    });
  }, [currentStep, steps.length, trackEvent]);

  // Get user location
  useEffect(() => {
    if (currentStep === 2) { // Location step
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setOnboardingData(prev => ({
              ...prev,
              basicInfo: {
                ...prev.basicInfo,
                location: {
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude
                }
              }
            }));
            setLocationError(null);
          },
          (error) => {
            setLocationError(`Geolocation error: ${error.message}`);
            // Default to a major city
            setOnboardingData(prev => ({
              ...prev,
              basicInfo: {
                ...prev.basicInfo,
                location: { latitude: 40.7128, longitude: -74.0060 } // NYC
              }
            }));
          }
        );
      } else {
        setLocationError("Geolocation is not supported by this browser.");
        setOnboardingData(prev => ({
          ...prev,
          basicInfo: {
            ...prev.basicInfo,
            location: { latitude: 40.7128, longitude: -74.0060 } // NYC
          }
        }));
      }
    }
  }, [currentStep]);

  const handleInputChange = (field: string, value: any) => {
    setOnboardingData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBasicInfoChange = (field: string, value: any) => {
    setOnboardingData(prev => ({
      ...prev,
      basicInfo: {
        ...prev.basicInfo,
        [field]: value
      }
    }));
  };

  const handlePreferenceChange = (field: string, value: any) => {
    setOnboardingData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [field]: value
      }
    }));
  };

  const handleHealthChange = (field: string, value: any) => {
    setOnboardingData(prev => ({
      ...prev,
      healthProfile: {
        ...prev.healthProfile,
        [field]: value
      }
    }));
  };

  const handleEnvironmentalChange = (field: string, value: any) => {
    setOnboardingData(prev => ({
      ...prev,
      environmentalConcerns: {
        ...prev.environmentalConcerns,
        [field]: value
      }
    }));
  };

  const handleInterestToggle = (interest: string) => {
    setOnboardingData(prev => {
      const currentInterests = prev.environmentalConcerns.interests;
      const newInterests = currentInterests.includes(interest)
        ? currentInterests.filter(i => i !== interest)
        : [...currentInterests, interest];
      
      return {
        ...prev,
        environmentalConcerns: {
          ...prev.environmentalConcerns,
          interests: newInterests
        }
      };
    });
  };

  const handleConditionToggle = (condition: string) => {
    setOnboardingData(prev => {
      const currentConditions = prev.healthProfile.respiratoryConditions;
      const newConditions = currentConditions.includes(condition)
        ? currentConditions.filter(c => c !== condition)
        : [...currentConditions, condition];
      
      return {
        ...prev,
        healthProfile: {
          ...prev.healthProfile,
          respiratoryConditions: newConditions,
          vulnerable: newConditions.length > 0 || prev.healthProfile.vulnerable
        }
      };
    });
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      trackFeature('step_forward', { from: steps[currentStep].id, to: steps[currentStep + 1].id });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      trackFeature('step_backward', { from: steps[currentStep].id, to: steps[currentStep - 1].id });
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      // Save user profile data to our backend
      if (user) {
        const response = await fetch('/api/user/profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            clerkId: user.id,
            email: user.emailAddresses?.[0]?.emailAddress,
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
            onboardingData,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to save profile');
        }
      }

      trackEvent('onboarding_completed', {
        timeSpent: Date.now() - startTime,
        stepsCompleted: steps.length,
        healthProfile: onboardingData.healthProfile.vulnerable,
        primaryConcern: onboardingData.environmentalConcerns.primary
      });
      toast({
        title: "Welcome to EcoAlert!",
        description: "Your profile has been created successfully.",
      });
      router.push('/dashboard');
    } catch (error) {
      console.error('Profile save error:', error);
      toast({
        variant: "destructive",
        title: "Profile Save Failed",
        description: "There was an error saving your profile. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startTime = Date.now();

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Welcome
        return (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <Leaf className="h-20 w-20 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold">Welcome to EcoAlert</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Join thousands of EcoWarriors working together to create a healthier planet. 
              Let's personalize your experience to get the most out of our platform.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <MapPin className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold">Real-time Monitoring</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Track air, water, and noise quality</p>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Bell className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold">Smart Alerts</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Get notified about environmental changes</p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-semibold">Community Impact</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Connect with local environmental initiatives</p>
              </div>
            </div>
          </div>
        );

      case 1: // Basic Info
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  value={onboardingData.basicInfo.name}
                  onChange={(e) => handleBasicInfoChange('name', e.target.value)}
                  placeholder="Enter your name"
                />
              </div>
              
              <div>
                <Label>Units</Label>
                <RadioGroup
                  value={onboardingData.preferences.units}
                  onValueChange={(value) => handlePreferenceChange('units', value)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="metric" id="metric" />
                    <Label htmlFor="metric">Metric (°C, km)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="imperial" id="imperial" />
                    <Label htmlFor="imperial">Imperial (°F, miles)</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
        );

      case 2: // Location
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label>Location</Label>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    We use your location to provide personalized environmental data and alerts.
                  </p>
                  {locationError && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Location Error</AlertTitle>
                      <AlertDescription>{locationError}</AlertDescription>
                    </Alert>
                  )}
                  <div className="mt-4">
                    <p className="text-sm font-medium">Current Location:</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {onboardingData.basicInfo.location.latitude !== 0 
                        ? `${onboardingData.basicInfo.location.latitude.toFixed(4)}, ${onboardingData.basicInfo.location.longitude.toFixed(4)}`
                        : 'Getting location...'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3: // Preferences
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label>Notification Level</Label>
                <RadioGroup
                  value={onboardingData.preferences.notificationLevel}
                  onValueChange={(value) => handlePreferenceChange('notificationLevel', value)}
                  className="flex flex-col gap-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="minimal" id="minimal" />
                    <Label htmlFor="minimal">Minimal - Only critical alerts</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="moderate" id="moderate" />
                    <Label htmlFor="moderate">Moderate - Regular updates</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="detailed" id="detailed" />
                    <Label htmlFor="detailed">Detailed - All information</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label>Alert Priorities</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {(['air', 'water', 'noise', 'general'] as const).map((priority) => (
                    <div key={priority} className="flex items-center space-x-2">
                      <Checkbox
                        id={priority}
                        checked={onboardingData.preferences.alertPriorities.includes(priority)}
                        onCheckedChange={(checked) => {
                          const current = onboardingData.preferences.alertPriorities;
                          const updated = checked 
                            ? [...current, priority]
                            : current.filter(p => p !== priority);
                          handlePreferenceChange('alertPriorities', updated);
                        }}
                      />
                      <Label htmlFor={priority} className="capitalize">
                        {priority === 'air' ? 'Air Quality' : 
                         priority === 'water' ? 'Water Quality' : 
                         priority === 'noise' ? 'Noise Pollution' : 'General'}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 4: // Health Profile
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label>Age Group</Label>
                <RadioGroup
                  value={onboardingData.healthProfile.ageGroup}
                  onValueChange={(value) => handleHealthChange('ageGroup', value)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="child" id="child" />
                    <Label htmlFor="child">Child (0-17)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="adult" id="adult" />
                    <Label htmlFor="adult">Adult (18-64)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="senior" id="senior" />
                    <Label htmlFor="senior">Senior (65+)</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label>Activity Level</Label>
                <RadioGroup
                  value={onboardingData.healthProfile.activityLevel}
                  onValueChange={(value) => handleHealthChange('activityLevel', value)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sedentary" id="sedentary" />
                    <Label htmlFor="sedentary">Sedentary</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="moderate" id="moderate" />
                    <Label htmlFor="moderate">Moderate</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="active" id="active" />
                    <Label htmlFor="active">Active</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label>Health Conditions</Label>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  Select any conditions that may affect your sensitivity to environmental factors.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {HEALTH_CONDITIONS.map((condition) => (
                    <div key={condition} className="flex items-center space-x-2">
                      <Checkbox
                        id={condition}
                        checked={onboardingData.healthProfile.respiratoryConditions.includes(condition)}
                        onCheckedChange={(checked) => handleConditionToggle(condition)}
                      />
                      <Label htmlFor={condition} className="capitalize">
                        {condition.replace(/_/g, ' ')}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 5: // Environmental Concerns
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label>Primary Environmental Concern</Label>
                <RadioGroup
                  value={onboardingData.environmentalConcerns.primary}
                  onValueChange={(value) => handleEnvironmentalChange('primary', value)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="air" id="air" />
                    <Label htmlFor="air">Air Quality</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="water" id="water" />
                    <Label htmlFor="water">Water Quality</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="noise" id="noise" />
                    <Label htmlFor="noise">Noise Pollution</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="general" id="general" />
                    <Label htmlFor="general">General</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label>Environmental Interests</Label>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  Select areas you're most interested in (select all that apply).
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {ENVIRONMENTAL_INTERESTS.map((interest) => (
                    <div key={interest} className="flex items-center space-x-2">
                      <Checkbox
                        id={interest}
                        checked={onboardingData.environmentalConcerns.interests.includes(interest)}
                        onCheckedChange={(checked) => handleInterestToggle(interest)}
                      />
                      <Label htmlFor={interest} className="capitalize">
                        {interest.replace(/_/g, ' ')}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 6: // Complete
        return (
          <div className="text-center space-y-6">
            <CheckCircle className="h-20 w-20 text-green-600 mx-auto" />
            <h2 className="text-3xl font-bold">You're All Set!</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Thank you for completing your EcoAlert profile. You're now ready to start monitoring your environment and making a difference.
            </p>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">What's Next?</h3>
              <ul className="text-left space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Explore your personalized dashboard
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Set up your notification preferences
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Connect with your local community
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Start tracking your environmental impact
                </li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-2xl font-bold">Get Started with EcoAlert</h1>
            <Badge variant="outline">
              {currentStep + 1} of {steps.length}
            </Badge>
          </div>
          <Progress value={((currentStep + 1) / steps.length) * 100} className="w-full" />
        </div>

        {/* Main Content */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {steps[currentStep].id === 'welcome' && <Leaf className="h-6 w-6 text-green-600" />}
              {steps[currentStep].id === 'basic' && <User className="h-6 w-6 text-blue-600" />}
              {steps[currentStep].id === 'location' && <MapPin className="h-6 w-6 text-purple-600" />}
              {steps[currentStep].id === 'preferences' && <Bell className="h-6 w-6 text-orange-600" />}
              {steps[currentStep].id === 'health' && <Heart className="h-6 w-6 text-red-600" />}
              {steps[currentStep].id === 'environment' && <Shield className="h-6 w-6 text-green-600" />}
              {steps[currentStep].id === 'complete' && <CheckCircle className="h-6 w-6 text-green-600" />}
              {steps[currentStep].title}
            </CardTitle>
            <CardDescription>{steps[currentStep].description}</CardDescription>
          </CardHeader>
          <CardContent>
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          {currentStep === steps.length - 1 ? (
            <Button onClick={handleComplete} disabled={isLoading}>
              {isLoading ? 'Creating Profile...' : 'Complete Setup'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleNext}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}