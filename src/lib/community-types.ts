export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  points: number;
  level: number;
  badges: Badge[];
  achievements: Achievement[];
  joinDate: string;
  location?: {
    latitude: number;
    longitude: number;
    city: string;
    country: string;
  };
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earnedAt: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  progress: number;
  target: number;
  category: 'reports' | 'engagement' | 'conservation' | 'social' | 'education';
  unlockedAt?: string;
}

export interface CommunityChallenge {
  id: string;
  title: string;
  description: string;
  type: 'individual' | 'team' | 'community';
  duration: number; // in days
  target: number;
  currentProgress: number;
  participants: number;
  rewards: {
    points: number;
    badges: string[];
    exclusive?: boolean;
  };
  startDate: string;
  endDate: string;
}

export interface LeaderboardEntry {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  points: number;
  rank: number;
  level: number;
  change?: number; // change in rank from previous period
}

export interface CommunityPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  images?: string[];
  likes: number;
  comments: number;
  shares: number;
  timestamp: string;
  location?: {
    latitude: number;
    longitude: number;
    city: string;
  };
  tags: string[];
  isPinned?: boolean;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: string;
  likes: number;
  replies?: Comment[];
}

export interface EnvironmentalReport {
  id: string;
  userId: string;
  type: 'air' | 'water' | 'noise' | 'waste' | 'other';
  severity: 'low' | 'moderate' | 'high' | 'critical';
  title: string;
  description: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
  };
  images?: string[];
  status: 'pending' | 'verified' | 'resolved' | 'rejected';
  verifiedBy?: string;
  verifiedAt?: string;
  points: number;
  createdAt: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  members: TeamMember[];
  captainId: string;
  createdAt: string;
  challenges: string[]; // challenge IDs
  totalPoints: number;
  rank: number;
}

export interface TeamMember {
  userId: string;
  userName: string;
  userAvatar?: string;
  role: 'captain' | 'member';
  points: number;
  joinedAt: string;
}

export interface GamificationConfig {
  pointsPerReport: number;
  pointsPerLike: number;
  pointsPerComment: number;
  pointsPerShare: number;
  levelThresholds: number[];
  badgeDefinitions: Badge[];
  challengeMultiplier: number;
  teamBonus: number;
}

export interface CommunityStats {
  totalUsers: number;
  totalReports: number;
  totalChallenges: number;
  averageUserLevel: number;
  mostActiveCity: string;
  topContributor: string;
  environmentalImpact: {
    co2Reduced: number; // in kg
    wasteReduced: number; // in kg
    waterSaved: number; // in liters
    energySaved: number; // in kWh
  };
}