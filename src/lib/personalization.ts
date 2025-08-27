import { UserProfile } from './user-profile';

export interface PersonalizedContent {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: 'health' | 'environment' | 'lifestyle' | 'safety';
  actionItems: string[];
  recommendations: string[];
}

export interface PersonalizedAlert {
  id: string;
  type: 'health_risk' | 'environmental_hazard' | 'recommendation' | 'reminder';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  actionRequired: boolean;
  suggestedActions: string[];
  validUntil: Date;
}

export class PersonalizationService {
  /**
   * Generate personalized content based on user profile
   */
  static generatePersonalizedContent(profile: UserProfile, currentConditions: any): PersonalizedContent {
    const content: PersonalizedContent = {
      title: '',
      description: '',
      priority: 'medium',
      category: 'environment',
      actionItems: [],
      recommendations: []
    };

    // Customize based on primary environmental concern
    switch (profile.environmentalConcerns.primary) {
      case 'air':
        content.title = 'Air Quality Insights';
        content.description = 'Personalized air quality information for your health and safety.';
        content.category = 'health';
        content.priority = profile.healthProfile.vulnerable ? 'high' : 'medium';
        
        if (profile.healthProfile.respiratoryConditions.length > 0) {
          content.actionItems = [
            'Consider limiting outdoor activities when AQI is above 100',
            'Keep windows closed during high pollution hours',
            'Use air purifiers indoors'
          ];
        }
        
        content.recommendations = [
          'Check air quality before planning outdoor exercise',
          'Monitor local pollution sources near your location',
          'Follow air quality trends in your area'
        ];
        break;

      case 'water':
        content.title = 'Water Quality Monitoring';
        content.description = 'Stay informed about your local water quality and safety.';
        content.category = 'environment';
        content.priority = 'medium';
        
        content.actionItems = [
          'Check water quality reports regularly',
          'Consider water filtration if needed',
          'Report any unusual water conditions'
        ];
        
        content.recommendations = [
          'Understand your local water sources',
          'Learn about water treatment processes',
          'Stay informed about local water advisories'
        ];
        break;

      case 'noise':
        content.title = 'Noise Pollution Awareness';
        content.description = 'Manage your exposure to environmental noise for better health.';
        content.category = 'health';
        content.priority = profile.healthProfile.vulnerable ? 'high' : 'medium';
        
        content.actionItems = [
          'Use noise-cancelling headphones in noisy areas',
          'Create quiet spaces at home',
          'Report excessive noise pollution'
        ];
        
        content.recommendations = [
          'Find quiet outdoor spaces for relaxation',
          'Use sound level meters to monitor noise',
          'Advocate for noise reduction in your community'
        ];
        break;

      default:
        content.title = 'Environmental Overview';
        content.description = 'Comprehensive environmental monitoring for your area.';
        content.category = 'environment';
        content.priority = 'medium';
        
        content.actionItems = [
          'Monitor all environmental metrics regularly',
          'Stay informed about local environmental conditions',
          'Take appropriate actions based on readings'
        ];
        
        content.recommendations = [
          'Understand how different environmental factors affect you',
          'Create a personalized environmental action plan',
          'Join community environmental initiatives'
        ];
    }

    // Customize based on health profile
    if (profile.healthProfile.vulnerable) {
      content.priority = 'high';
      content.actionItems.unshift(
        'Consult with your healthcare provider about environmental risks',
        'Create an emergency plan for high pollution events'
      );
    }

    // Customize based on activity level
    if (profile.healthProfile.activityLevel === 'active') {
      content.recommendations.push(
        'Plan outdoor activities during optimal air quality times',
        'Consider indoor alternatives during poor conditions'
      );
    }

    return content;
  }

  /**
   * Generate personalized alerts based on conditions and profile
   */
  static generatePersonalizedAlerts(
    profile: UserProfile, 
    currentConditions: any, 
    forecastConditions: any
  ): PersonalizedAlert[] {
    const alerts: PersonalizedAlert[] = [];

    // Air quality alerts
    if (profile.environmentalConcerns.primary === 'air' || profile.preferences.alertPriorities.includes('air')) {
      if (currentConditions.aqi > 150) {
        alerts.push({
          id: `air-${Date.now()}`,
          type: 'health_risk',
          severity: profile.healthProfile.vulnerable ? 'critical' : 'high',
          title: 'Poor Air Quality Alert',
          message: `Current AQI is ${currentConditions.aqi} - ${this.getAQILevel(currentConditions.aqi)}. ${this.getHealthAdvice(currentConditions.aqi, profile)}`,
          actionRequired: true,
          suggestedActions: this.getAirQualityActions(currentConditions.aqi, profile),
          validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        });
      }
    }

    // Water quality alerts
    if (profile.environmentalConcerns.primary === 'water' || profile.preferences.alertPriorities.includes('water')) {
      if (currentConditions.ph < 6.5 || currentConditions.ph > 8.5) {
        alerts.push({
          id: `water-${Date.now()}`,
          type: 'environmental_hazard',
          severity: 'medium',
          title: 'Water Quality Alert',
          message: `Water pH level is ${currentConditions.ph}, which is outside the recommended range.`,
          actionRequired: true,
          suggestedActions: [
            'Consider using water filtration',
            'Avoid drinking tap water if pregnant or with compromised immune system',
            'Report to local water authorities'
          ],
          validUntil: new Date(Date.now() + 48 * 60 * 60 * 1000) // 48 hours
        });
      }
    }

    // Noise pollution alerts
    if (profile.environmentalConcerns.primary === 'noise' || profile.preferences.alertPriorities.includes('noise')) {
      if (currentConditions.noise > 85) {
        alerts.push({
          id: `noise-${Date.now()}`,
          type: 'health_risk',
          severity: 'medium',
          title: 'High Noise Levels Detected',
          message: `Noise level is ${currentConditions.noise} dB, which may affect your hearing and health.`,
          actionRequired: false,
          suggestedActions: [
            'Consider using hearing protection',
            'Move to a quieter area if possible',
            'Limit exposure time'
          ],
          validUntil: new Date(Date.now() + 12 * 60 * 60 * 1000) // 12 hours
        });
      }
    }

    // Personalized health reminders
    if (profile.healthProfile.vulnerable) {
      alerts.push({
        id: `health-reminder-${Date.now()}`,
        type: 'reminder',
        severity: 'medium',
        title: 'Health Priority Reminder',
        message: 'As someone with health sensitivities, please pay extra attention to environmental conditions.',
        actionRequired: false,
        suggestedActions: [
          'Check conditions before going outside',
          'Keep emergency contacts handy',
          'Monitor symptoms and seek medical advice if needed'
        ],
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 1 week
      });
    }

    // Activity-based recommendations
    if (profile.healthProfile.activityLevel === 'active') {
      const bestTime = this.getBestActivityTime(currentConditions, forecastConditions);
      if (bestTime) {
        alerts.push({
          id: `activity-${Date.now()}`,
          type: 'recommendation',
          severity: 'low',
          title: 'Optimal Activity Time',
          message: `Best time for outdoor activities: ${bestTime}`,
          actionRequired: false,
          suggestedActions: [
            'Plan your outdoor exercise during recommended times',
            'Stay hydrated and take breaks',
            'Monitor your body\'s response to conditions'
          ],
          validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        });
      }
    }

    return alerts;
  }

  /**
   * Generate personalized dashboard widgets based on user preferences
   */
  static generateDashboardWidgets(profile: UserProfile) {
    const widgets = [];

    // Always show AQI widget
    widgets.push({
      id: 'aqi-gauge',
      type: 'gauge',
      title: 'Air Quality Index',
      priority: 1,
      enabled: true,
      size: 'large'
    });

    // Show additional widgets based on user preferences
    if (profile.environmentalConcerns.primary === 'air' || profile.preferences.alertPriorities.includes('air')) {
      widgets.push({
        id: 'air-quality-forecast',
        type: 'chart',
        title: 'Air Quality Forecast',
        priority: 2,
        enabled: true,
        size: 'medium'
      });
    }

    if (profile.environmentalConcerns.primary === 'water' || profile.preferences.alertPriorities.includes('water')) {
      widgets.push({
        id: 'water-quality',
        type: 'metrics',
        title: 'Water Quality',
        priority: 3,
        enabled: true,
        size: 'medium'
      });
    }

    if (profile.environmentalConcerns.primary === 'noise' || profile.preferences.alertPriorities.includes('noise')) {
      widgets.push({
        id: 'noise-level',
        type: 'gauge',
        title: 'Noise Level',
        priority: 4,
        enabled: true,
        size: 'medium'
      });
    }

    // Health widget for users with health concerns
    if (profile.healthProfile.vulnerable || profile.healthProfile.respiratoryConditions.length > 0) {
      widgets.push({
        id: 'health-advice',
        type: 'card',
        title: 'Health Recommendations',
        priority: 2,
        enabled: true,
        size: 'small'
      });
    }

    // Environmental insights widget
    widgets.push({
      id: 'insights',
      type: 'card',
      title: 'Personalized Insights',
      priority: 5,
      enabled: true,
      size: 'small'
    });

    return widgets.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Get personalized health advice based on AQI
   */
  private static getHealthAdvice(aqi: number, profile: UserProfile): string {
    if (aqi <= 50) {
      return 'Air quality is satisfactory. Enjoy your normal activities.';
    } else if (aqi <= 100) {
      return 'Air quality is acceptable for most people. Sensitive individuals should consider reducing prolonged outdoor exertion.';
    } else if (aqi <= 150) {
      return 'Members of sensitive groups should reduce prolonged outdoor exertion. Everyone else should reduce prolonged outdoor exertion.';
    } else if (aqi <= 200) {
      return 'Everyone should reduce prolonged outdoor exertion. Sensitive groups should avoid outdoor activities.';
    } else if (aqi <= 300) {
      return 'Health warnings of emergency conditions. Everyone should avoid outdoor activities.';
    } else {
      return 'Health alert conditions everyone should remain indoors and avoid physical exertion.';
    }
  }

  /**
   * Get AQI level description
   */
  private static getAQILevel(aqi: number): string {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  }

  /**
   * Get recommended actions for air quality
   */
  private static getAirQualityActions(aqi: number, profile: UserProfile): string[] {
    const actions = [];
    
    if (aqi > 100) {
      actions.push('Limit outdoor activities');
      actions.push('Keep windows closed');
    }
    
    if (aqi > 150) {
      actions.push('Use air purifiers indoors');
      actions.push('Avoid strenuous outdoor exercise');
    }
    
    if (aqi > 200) {
      actions.push('Stay indoors as much as possible');
      actions.push('Use N95 masks if going outside');
    }
    
    if (profile.healthProfile.vulnerable) {
      actions.unshift('Consult your healthcare provider');
    }
    
    if (profile.healthProfile.respiratoryConditions.length > 0) {
      actions.push('Keep quick-relief medications handy');
    }
    
    return actions;
  }

  /**
   * Get best time for outdoor activities
   */
  private static getBestActivityTime(current: any, forecast: any): string | null {
    // Simple logic - find time with lowest AQI in next 24 hours
    let bestTime = null;
    let lowestAQI = Infinity;
    
    for (let hour = 0; hour < 24; hour++) {
      const hourAQI = forecast?.[hour]?.aqi || current.aqi;
      if (hourAQI < lowestAQI) {
        lowestAQI = hourAQI;
        bestTime = hour;
      }
    }
    
    if (bestTime !== null && lowestAQI < 100) {
      const hour = bestTime;
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${displayHour}${period}`;
    }
    
    return null;
  }
}