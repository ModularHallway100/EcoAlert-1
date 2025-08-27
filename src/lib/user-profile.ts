import type { Coordinates } from './types';

export interface UserProfile {
  id: string;
  basicInfo: {
    name: string;
    location: Coordinates;
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
  usagePatterns: {
    activeHours: number[];
    favoriteFeatures: string[];
    engagementLevel: 'low' | 'medium' | 'high';
    lastActive: Date;
  };
  customization: {
    dashboardLayout: string[];
    widgetPreferences: Record<string, boolean>;
    chartTypes: Record<string, 'line' | 'bar' | 'area' | 'gauge'>;
    colorScheme: string;
  };
  goals: {
    healthGoals: string[];
    environmentalGoals: string[];
    trackingPreferences: string[];
  };
}

export interface UserProfileUpdate {
  basicInfo?: Partial<UserProfile['basicInfo']>;
  preferences?: Partial<UserProfile['preferences']>;
  healthProfile?: Partial<UserProfile['healthProfile']>;
  environmentalConcerns?: Partial<UserProfile['environmentalConcerns']>;
  usagePatterns?: Partial<UserProfile['usagePatterns']>;
  customization?: Partial<UserProfile['customization']>;
  goals?: Partial<UserProfile['goals']>;
}

export const DEFAULT_USER_PROFILE: Omit<UserProfile, 'id'> = {
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
  },
  usagePatterns: {
    activeHours: [9, 17, 20], // Default active hours
    favoriteFeatures: [],
    engagementLevel: 'medium',
    lastActive: new Date()
  },
  customization: {
    dashboardLayout: ['monitor', 'alerts', 'insights'],
    widgetPreferences: {
      aqiGauge: true,
      weatherInfo: true,
      healthTips: true,
      pollutionForecast: false
    },
    chartTypes: {
      aqi: 'line',
      noise: 'bar',
      ph: 'line',
      turbidity: 'area'
    },
    colorScheme: 'default'
  },
  goals: {
    healthGoals: [],
    environmentalGoals: [],
    trackingPreferences: ['daily', 'weekly']
  }
};

export const ENVIRONMENTAL_INTERESTS = [
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

export const HEALTH_CONDITIONS = [
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

export const ENVIRONMENTAL_GOALS = [
  'reduce_exposure',
  'improve_indoor_air',
  'track_health_impact',
  'find_safe_outdoor_times',
  'monitor_local_environment',
  'contribute_to_research',
  'advocate_for_change',
  'educate_others',
  'reduce_carbon_footprint',
  'promote_sustainability'
];