"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './auth-provider';

interface AnalyticsContextType {
  trackEvent: (event: string, properties?: Record<string, any>) => void;
  trackPageView: (page: string) => void;
  trackUserAction: (action: string, category: string) => void;
  trackError: (error: Error, context?: Record<string, any>) => void;
  trackPerformance: (metric: string, value: number) => void;
  analyticsData: any;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

interface AnalyticsProviderProps {
  children: ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const { user, isAuthenticated } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  // Initialize analytics on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Initialize analytics libraries here
      // This could include Google Analytics, Mixpanel, Amplitude, etc.
      console.log('Analytics initialized');
    }
  }, []);

  const trackEvent = (event: string, properties?: Record<string, any>) => {
    if (typeof window === 'undefined') return;

    // Get user context
    const userContext = {
      userId: user?.id,
      isAuthenticated: isAuthenticated,
      // Add other relevant user properties
    };

    // Combine event properties with user context
    const eventProperties = {
      ...properties,
      timestamp: new Date().toISOString(),
      ...userContext,
    };

    // Send to analytics providers
    console.log('Analytics Event:', event, eventProperties);

    // Example: Send to Google Analytics
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('event', event, eventProperties);
    }

    // Example: Send to custom analytics endpoint
    fetch('/api/analytics/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event,
        properties: eventProperties,
      }),
    }).catch(error => console.error('Analytics tracking error:', error));
  };

  const trackPageView = (page: string) => {
    trackEvent('page_view', {
      page,
      title: document.title,
      url: window.location.href,
    });
  };

  const trackUserAction = (action: string, category: string) => {
    trackEvent('user_action', {
      action,
      category,
    });
  };

  const trackError = (error: Error, context?: Record<string, any>) => {
    trackEvent('error', {
      error: error.message,
      stack: error.stack,
      ...context,
    });
  };

  const trackPerformance = (metric: string, value: number) => {
    trackEvent('performance_metric', {
      metric,
      value,
    });
  };

  // Track page views automatically
  useEffect(() => {
    if (typeof window !== 'undefined') {
      trackPageView(window.location.pathname);

      // Track route changes in Next.js
      const handleRouteChange = (url: string) => {
        trackPageView(url);
      };

      // Listen for Next.js route changes
      window.addEventListener('popstate', () => {
        handleRouteChange(window.location.pathname);
      });

      // For Next.js router events (if using App Router)
      // This would need to be integrated with Next.js router events
    }
  }, []);

  const value = {
    trackEvent,
    trackPageView,
    trackUserAction,
    trackError,
    trackPerformance,
    analyticsData,
  };

  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>;
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}

// Helper hook for tracking component interactions
export function useTrackInteraction(category: string) {
  const { trackUserAction } = useAnalytics();

  const track = (action: string, properties?: Record<string, any>) => {
    trackUserAction(action, category);
  };

  return track;
}

// Helper hook for tracking feature usage
export function useTrackFeature(featureName: string) {
  const { trackEvent } = useAnalytics();

  const trackUsage = (action: string, properties?: Record<string, any>) => {
    trackEvent('feature_usage', {
      feature: featureName,
      action,
      ...properties,
    });
  };

  return trackUsage;
}