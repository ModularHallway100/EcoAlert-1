import type { UserProfile } from './user-profile';

export interface SubscriptionTier {
  id: string;
  name: string;
  description: string;
  price: {
    monthly: number;
    yearly: number;
    currency: string;
  };
  features: {
    [key: string]: boolean | string | number;
  };
  limits: {
    [key: string]: number;
  };
  metadata: {
    featured: boolean;
    popular: boolean;
    newFeatures: string[];
    benefits: string[];
  };
}

export interface SubscriptionPlan extends SubscriptionTier {
  billingCycle: 'monthly' | 'yearly';
  trialPeriod?: number; // days
  proration?: boolean;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'apple_pay' | 'google_pay';
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  brand?: string;
  default: boolean;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'canceled' | 'expired' | 'past_due' | 'unpaid' | 'trialing';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  trialEnd?: Date;
  metadata: {
    paymentMethodId?: string;
    couponId?: string;
    quantity?: number;
    taxRates?: string[];
  };
}

export interface Usage {
  userId: string;
  period: 'daily' | 'monthly' | 'yearly';
  metrics: {
    apiCalls: number;
    dataExports: number;
    alertsReceived: number;
    reportsGenerated: number;
    advancedAnalytics: number;
    customAlerts: number;
    locationChanges: number;
    deviceConnections: number;
  };
  limits: {
    [key: string]: number;
  };
}

export interface Coupon {
  id: string;
  name: string;
  description: string;
  type: 'percentage' | 'fixed_amount';
  value: number;
  currency: string;
  duration: 'once' | 'repeating' | 'forever';
  durationInMonths?: number;
  maxRedemptions?: number;
  redemptionCount: number;
  valid: boolean;
  metadata: {
    appliesTo: 'all' | 'specific_plans';
    planIds?: string[];
    newCustomersOnly?: boolean;
    minimumAmount?: number;
    startDate: Date;
    endDate: Date;
  };
}

export interface Invoice {
  id: string;
  subscriptionId: string;
  number: string;
  status: 'draft' | 'open' | 'paid' | 'uncollectible' | 'void';
  amountDue: number;
  amountPaid: number;
  amountRemaining: number;
  currency: string;
  date: Date;
  periodStart: Date;
  periodEnd: Date;
  lines: InvoiceLine[];
  metadata: {
    paymentIntentId?: string;
    paymentMethodId?: string;
    couponId?: string;
    taxAmount?: number;
  };
}

export interface InvoiceLine {
  id: string;
  object: 'line_item';
  amount: number;
  currency: string;
  description: string;
  period: {
    start: Date;
    end: Date;
  };
  subscription?: string;
  quantity?: number;
  type: 'subscription' | 'invoiceitem' | 'credit';
  metadata?: {
    [key: string]: string;
  };
}

export interface BillingPortalSession {
  id: string;
  url: string;
  expiresAt: Date;
  customer: string;
  return_url?: string;
}

export const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Basic environmental monitoring for everyone',
    price: {
      monthly: 0,
      yearly: 0,
      currency: 'USD'
    },
    features: {
      realTimeMonitoring: true,
      basicAlerts: true,
      basicAnalytics: true,
      communityAccess: true,
      dataHistory: 7,
      exportData: false,
      advancedAnalytics: false,
      customAlerts: false,
      multipleLocations: 1,
      apiAccess: false,
      prioritySupport: false,
      predictiveModels: false
    },
    limits: {
      apiCalls: 1000,
      dataExports: 0,
      alertsReceived: 10,
      reportsGenerated: 5,
      advancedAnalytics: 0,
      customAlerts: 0,
      locationChanges: 5,
      deviceConnections: 1
    },
    metadata: {
      featured: false,
      popular: false,
      newFeatures: [],
      benefits: [
        'Real-time environmental monitoring',
        'Basic air quality alerts',
        'Community features access',
        '7-day data history'
      ]
    }
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Advanced monitoring for eco-conscious individuals',
    price: {
      monthly: 9.99,
      yearly: 99.99,
      currency: 'USD'
    },
    features: {
      realTimeMonitoring: true,
      basicAlerts: true,
      advancedAlerts: true,
      enterpriseAnalytics: true,
      communityAccess: true,
      dataHistory: 30,
      exportData: true,
      advancedAnalytics: true,
      customAlerts: true,
      multipleLocations: 3,
      apiAccess: true,
      prioritySupport: true,
      predictiveModels: true
    },
    limits: {
      apiCalls: 10000,
      dataExports: 10,
      alertsReceived: 50,
      reportsGenerated: 25,
      advancedAnalytics: 100,
      customAlerts: 10,
      locationChanges: 20,
      deviceConnections: 5
    },
    metadata: {
      featured: true,
      popular: true,
      newFeatures: ['AI-powered predictions', 'Custom alert thresholds'],
      benefits: [
        'Advanced air quality monitoring',
        'Customizable alert thresholds',
        '30-day data history',
        'Data export capabilities',
        'Multiple location tracking',
        'Priority support',
        'AI-powered predictions'
      ]
    }
  },
  {
    id: 'business',
    name: 'Business',
    description: 'Comprehensive solution for organizations',
    price: {
      monthly: 49.99,
      yearly: 499.99,
      currency: 'USD'
    },
    features: {
      realTimeMonitoring: true,
      basicAlerts: true,
      advancedAlerts: true,
      enterpriseAnalytics: true,
      communityAccess: true,
      dataHistory: 365,
      exportData: true,
      advancedAnalytics: true,
      customAlerts: true,
      multipleLocations: 50,
      apiAccess: true,
      prioritySupport: true,
      predictiveModels: true,
      teamManagement: true,
      customIntegrations: true,
      complianceReporting: true,
      auditLogs: true
    },
    limits: {
      apiCalls: 100000,
      dataExports: 100,
      alertsReceived: 500,
      reportsGenerated: 500,
      advancedAnalytics: 5000,
      customAlerts: 100,
      locationChanges: 1000,
      deviceConnections: 100,
      teamMembers: 10,
      integrations: 5
    },
    metadata: {
      featured: false,
      popular: false,
      newFeatures: ['Team management', 'Custom integrations', 'Compliance reporting'],
      benefits: [
        'Unlimited location tracking',
        'Team management capabilities',
        'Custom API integrations',
        '365-day data history',
        'Compliance reporting',
        'Audit logs',
        'Custom integrations',
        'Enterprise-grade analytics'
      ]
    }
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Tailored solution for large organizations',
    price: {
      monthly: 199.99,
      yearly: 1999.99,
      currency: 'USD'
    },
    features: {
      realTimeMonitoring: true,
      basicAlerts: true,
      advancedAlerts: true,
      enterpriseAnalytics: true,
      communityAccess: true,
      dataHistory: 0, // Unlimited
      exportData: true,
      advancedAnalytics: true,
      customAlerts: true,
      multipleLocations: 0, // Unlimited
      apiAccess: true,
      prioritySupport: true,
      predictiveModels: true,
      teamManagement: true,
      customIntegrations: true,
      complianceReporting: true,
      auditLogs: true,
      dedicatedSuccessManager: true,
      customBranding: true,
      sla: true,
      dataRetention: 0, // Unlimited
      multiTenant: true,
      advancedSecurity: true
    },
    limits: {
      apiCalls: 0, // Unlimited
      dataExports: 0, // Unlimited
      alertsReceived: 0, // Unlimited
      reportsGenerated: 0, // Unlimited
      advancedAnalytics: 0, // Unlimited
      customAlerts: 0, // Unlimited
      locationChanges: 0, // Unlimited
      deviceConnections: 0, // Unlimited
      teamMembers: 0, // Unlimited
      integrations: 0, // Unlimited
      storage: 0 // Unlimited
    },
    metadata: {
      featured: false,
      popular: false,
      newFeatures: ['Dedicated success manager', 'Custom branding', 'SLA guarantee'],
      benefits: [
        'Unlimited everything',
        'Custom branding',
        'Dedicated success manager',
        'Service level agreement',
        'Advanced security features',
        'Multi-tenant support',
        'Custom reporting',
        'Volume discounts available'
      ]
    }
  }
];

export const POPULAR_COUPONS: Coupon[] = [
  {
    id: 'WELCOME20',
    name: 'Welcome Discount',
    description: '20% off your first year',
    type: 'percentage',
    value: 20,
    currency: 'USD',
    duration: 'once',
    redemptionCount: 0,
    valid: true,
    metadata: {
      appliesTo: 'all',
      newCustomersOnly: true,
      minimumAmount: 0,
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days from now
    }
  },
  {
    id: 'PRO_MONTHLY',
    name: 'Pro Monthly Deal',
    description: '$5 off Pro monthly subscription',
    type: 'fixed_amount',
    value: 5,
    currency: 'USD',
    duration: 'once',
    redemptionCount: 0,
    valid: true,
    metadata: {
      appliesTo: 'specific_plans',
      planIds: ['pro'],
      newCustomersOnly: true,
      minimumAmount: 0,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    }
  }
];

export function getSubscriptionPlan(id: string): SubscriptionTier | undefined {
  return SUBSCRIPTION_TIERS.find(plan => plan.id === id);
}

export function getUserSubscriptionTier(userProfile: UserProfile): SubscriptionTier {
  // In a real implementation, this would fetch from a database
  // For now, we'll return the Pro tier as a default
  return getSubscriptionPlan('pro') || SUBSCRIPTION_TIERS[1];
}

export function calculateSavings(monthlyPlan: SubscriptionTier, yearlyPlan: SubscriptionTier): number {
  const monthlyTotal = monthlyPlan.price.monthly * 12;
  const yearlyTotal = yearlyPlan.price.yearly;
  return monthlyTotal - yearlyTotal;
}

export function formatPrice(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function getTrialDays(planId: string): number {
  const trialDays: Record<string, number> = {
    pro: 14,
    business: 30,
    enterprise: 60,
  };
  return trialDays[planId] || 0;
}

export interface BillingHistory {
  invoices: Invoice[];
  upcomingInvoice?: Invoice;
  subscription: Subscription;
  paymentMethods: PaymentMethod[];
}

export interface SubscriptionStatus {
  active: boolean;
  tier: SubscriptionTier;
  daysUntilRenewal: number;
  usage: Usage;
  canUpgrade: boolean;
  canDowngrade: boolean;
  hasTrial: boolean;
  trialDaysRemaining: number;
}

export function calculateSubscriptionStatus(
  subscription: Subscription,
  usage: Usage,
  currentTier: SubscriptionTier
): SubscriptionStatus {
  const now = new Date();
  const daysUntilRenewal = Math.ceil(
    (subscription.currentPeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  const trialDaysRemaining = subscription.trialEnd 
    ? Math.ceil((subscription.trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  
  return {
    active: subscription.status === 'active' || subscription.status === 'trialing',
    tier: currentTier,
    daysUntilRenewal,
    usage,
    canUpgrade: true,
    canDowngrade: subscription.status !== 'trialing',
    hasTrial: !!subscription.trialEnd,
    trialDaysRemaining: trialDaysRemaining > 0 ? trialDaysRemaining : 0,
  };
}

export function checkFeatureAccess(feature: string, subscriptionTier: SubscriptionTier): boolean {
  return subscriptionTier.features[feature] === true;
}

export function checkUsageLimit(metric: string, usage: Usage, limits: Record<string, number>): {
  allowed: boolean;
  remaining: number;
  percentage: number;
} {
  const used = (usage.metrics as any)[metric] || 0;
  const limit = limits[metric] || 0;
  const remaining = Math.max(0, limit - used);
  const percentage = limit > 0 ? (used / limit) * 100 : 0;
  
  return {
    allowed: used < limit,
    remaining,
    percentage,
  };
}