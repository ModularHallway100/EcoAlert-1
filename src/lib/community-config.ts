import { GamificationConfig, Badge } from './community-types';

export const BADGE_DEFINITIONS: Badge[] = [
  // Environmental Badges
  {
    id: 'first-report',
    name: 'Eco Reporter',
    description: 'Submitted your first environmental report',
    icon: '📊',
    color: '#22c55e',
    rarity: 'common',
    earnedAt: '',
  },
  {
    id: 'ten-reports',
    name: 'Watchful Eye',
    description: 'Submitted 10 environmental reports',
    icon: '👁️',
    color: '#3b82f6',
    rarity: 'common',
    earnedAt: '',
  },
  {
    id: 'fifty-reports',
    name: 'Guardian of Earth',
    description: 'Submitted 50 environmental reports',
    icon: '🛡️',
    color: '#8b5cf6',
    rarity: 'rare',
    earnedAt: '',
  },
  {
    id: 'hundred-reports',
    name: 'Environmental Champion',
    description: 'Submitted 100 environmental reports',
    icon: '🏆',
    color: '#f59e0b',
    rarity: 'epic',
    earnedAt: '',
  },
  {
    id: 'critical-report',
    name: 'Life Saver',
    description: 'Submitted a critical environmental report',
    icon: '🆘',
    color: '#ef4444',
    rarity: 'rare',
    earnedAt: '',
  },
  
  // Community Badges
  {
    id: 'social-butterfly',
    name: 'Social Butterfly',
    description: 'Liked 100 posts',
    icon: '🦋',
    color: '#ec4899',
    rarity: 'common',
    earnedAt: '',
  },
  {
    id: 'comment-king',
    name: 'Discussion Leader',
    description: 'Made 50 thoughtful comments',
    icon: '💬',
    color: '#06b6d4',
    rarity: 'rare',
    earnedAt: '',
  },
  {
    id: 'share-champion',
    name: 'Viral Contributor',
    description: 'Shared content 25 times',
    icon: '📈',
    color: '#10b981',
    rarity: 'common',
    earnedAt: '',
  },
  
  // Achievement Badges
  {
    id: 'week-streak',
    name: 'Dedicated Warrior',
    description: 'Active for 7 consecutive days',
    icon: '🔥',
    color: '#f97316',
    rarity: 'rare',
    earnedAt: '',
  },
  {
    id: 'month-streak',
    name: 'Unstoppable Force',
    description: 'Active for 30 consecutive days',
    icon: '⚡',
    color: '#eab308',
    rarity: 'epic',
    earnedAt: '',
  },
  {
    id: 'level-5',
    name: 'Rising Star',
    description: 'Reached level 5',
    icon: '⭐',
    color: '#a855f7',
    rarity: 'rare',
    earnedAt: '',
  },
  {
    id: 'level-10',
    name: 'Eco Master',
    description: 'Reached level 10',
    icon: '🌟',
    color: '#fbbf24',
    rarity: 'legendary',
    earnedAt: '',
  },
  
  // Team Badges
  {
    id: 'team-player',
    name: 'Team Player',
    description: 'Joined your first team',
    icon: '👥',
    color: '#6366f1',
    rarity: 'common',
    earnedAt: '',
  },
  {
    id: 'team-captain',
    name: 'Team Captain',
    description: 'Became a team captain',
    icon: '👑',
    color: '#f59e0b',
    rarity: 'epic',
    earnedAt: '',
  },
  {
    id: 'team-victory',
    name: 'Champion Team',
    description: 'Won a team challenge',
    icon: '🏅',
    color: '#22c55e',
    rarity: 'rare',
    earnedAt: '',
  },
  
  // Special Event Badges
  {
    id: 'earth-day',
    name: 'Earth Day Hero',
    description: 'Participated in Earth Day events',
    icon: '🌍',
    color: '#22c55e',
    rarity: 'epic',
    earnedAt: '',
  },
  {
    id: 'clean-up-hero',
    name: 'Clean Up Hero',
    description: 'Participated in a community clean-up',
    icon: '🧹',
    color: '#10b981',
    rarity: 'rare',
    earnedAt: '',
  },
  {
    id: 'plant-parent',
    name: 'Plant Parent',
    description: 'Planted 10 trees through the app',
    icon: '🌱',
    color: '#22c55e',
    rarity: 'common',
    earnedAt: '',
  },
  {
    id: 'water-saver',
    name: 'Water Saver',
    description: 'Reported 10 water conservation successes',
    icon: '💧',
    color: '#3b82f6',
    rarity: 'common',
    earnedAt: '',
  },
  {
    id: 'energy-saver',
    name: 'Energy Saver',
    description: 'Reported 10 energy conservation successes',
    icon: '⚡',
    color: '#eab308',
    rarity: 'common',
    earnedAt: '',
  },
  
  // Rare & Legendary Badges
  {
    id: 'legendary-reporter',
    name: 'Legendary Reporter',
    description: 'Submitted 200 verified reports',
    icon: '📰',
    color: '#dc2626',
    rarity: 'legendary',
    earnedAt: '',
  },
  {
    id: 'community-icon',
    name: 'Community Icon',
    description: 'Recognized as a top community contributor',
    icon: '🌟',
    color: '#fbbf24',
    rarity: 'legendary',
    earnedAt: '',
  },
  {
    id: 'environmental-hero',
    name: 'Environmental Hero',
    description: 'Made significant environmental impact',
    icon: '🦸',
    color: '#7c3aed',
    rarity: 'legendary',
    earnedAt: '',
  },
];

export const CHALLENGE_TEMPLATES = [
  {
    title: 'Air Quality Warriors',
    description: 'Submit 5 air quality reports this week',
    type: 'individual' as const,
    duration: 7,
    target: 5,
    points: 200,
    badges: ['air-quality-warrior'],
    category: 'reports',
  },
  {
    title: 'Water Conservation Challenge',
    description: 'Report 5 water conservation successes',
    type: 'individual' as const,
    duration: 14,
    target: 5,
    points: 300,
    badges: ['water-saver'],
    category: 'conservation',
  },
  {
    title: 'Community Clean-Up',
    description: 'Join a community clean-up event',
    type: 'community' as const,
    duration: 1,
    target: 1,
    points: 150,
    badges: ['clean-up-hero'],
    category: 'engagement',
  },
  {
    title: 'Social Awareness Week',
    description: 'Share 3 educational posts about environmental issues',
    type: 'individual' as const,
    duration: 7,
    target: 3,
    points: 100,
    badges: ['social-butterfly'],
    category: 'social',
  },
  {
    title: 'Energy Saving Challenge',
    description: 'Report 5 energy conservation tips',
    type: 'team' as const,
    duration: 10,
    target: 10,
    points: 400,
    badges: ['energy-saver'],
    category: 'conservation',
  },
];

export const RANK_COLORS = {
  common: '#9ca3af',
  rare: '#3b82f6',
  epic: '#8b5cf6',
  legendary: '#f59e0b',
};

export const LEVEL_COLORS = [
  '#6b7280', // Level 1 - Gray
  '#22c55e', // Level 2 - Green
  '#3b82f6', // Level 3 - Blue
  '#8b5cf6', // Level 4 - Purple
  '#f59e0b', // Level 5 - Orange
  '#ef4444', // Level 6 - Red
  '#ec4899', // Level 7 - Pink
  '#06b6d4', // Level 8 - Cyan
  '#84cc16', // Level 9 - Lime
  '#fbbf24', // Level 10 - Amber
];

export const USER_ROLES = {
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  CAPTAIN: 'captain',
  MEMBER: 'member',
  GUEST: 'guest',
} as const;

export const REPORT_CATEGORIES = {
  AIR: 'air',
  WATER: 'water',
  NOISE: 'noise',
  WASTE: 'waste',
  ENERGY: 'energy',
  OTHER: 'other',
} as const;

export const REPORT_SEVERITY = {
  LOW: 'low',
  MODERATE: 'moderate',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

export const CHALLENGE_STATUS = {
  UPCOMING: 'upcoming',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;