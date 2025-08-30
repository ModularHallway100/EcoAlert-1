"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Users,
  Trophy,
  Star,
  Award,
  TrendingUp,
  Leaf,
  Globe,
  Activity,
  MessageCircle,
  Calendar,
  MapPin,
  Zap,
  Droplets,
  BarChart3,
  Award as AwardIcon,
  Crown,
  Gem,
  Sparkles,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { User } from '@/lib/community-types';
import { CommunityProfile } from '@/components/community-profile';
import { CommunityChallenges } from '@/components/community-challenges';
import { CommunityLeaderboard } from '@/components/community-leaderboard';
import { CommunityFeed } from '@/components/community-feed';

// Mock user data for demonstration
const mockUser: User = {
  id: 'user1',
  name: 'Eco Warrior',
  email: 'warrior@ecoalert.com',
  avatar: '/avatars/user1.png',
  points: 6840,
  level: 6,
  badges: [
    {
      id: 'first-report',
      name: 'Eco Reporter',
      description: 'Submitted your first environmental report',
      icon: '📊',
      color: '#22c55e',
      rarity: 'common',
      earnedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'social-butterfly',
      name: 'Social Butterfly',
      description: 'Liked 100 posts',
      icon: '🦋',
      color: '#ec4899',
      rarity: 'common',
      earnedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'week-streak',
      name: 'Dedicated Warrior',
      description: 'Active for 7 consecutive days',
      icon: '🔥',
      color: '#f97316',
      rarity: 'rare',
      earnedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
  achievements: [
    {
      id: 'reports-10',
      name: 'Watchful Eye',
      description: 'Submitted 10 environmental reports',
      icon: '👁️',
      progress: 8,
      target: 10,
      category: 'reports',
    },
    {
      id: 'level-5',
      name: 'Rising Star',
      description: 'Reached level 5',
      icon: '⭐',
      progress: 6,
      target: 6,
      category: 'engagement',
      unlockedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
  joinDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  location: {
    latitude: 40.7128,
    longitude: -74.0060,
    city: 'New York',
    country: 'USA',
  },
};

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState('feed');
  const [selectedUser, setSelectedUser] = useState<User>(mockUser);

  const handleUserClick = (userId: string) => {
    // In a real app, this would fetch user data
    console.log('Viewing user profile:', userId);
  };

  const handlePostCreate = (content: string, images?: File[]) => {
    console.log('Creating post:', content, images);
  };

  const handlePostLike = (postId: string) => {
    console.log('Liking post:', postId);
  };

  const handlePostComment = (postId: string, content: string) => {
    console.log('Commenting on post:', postId, content);
  };

  const handlePostShare = (postId: string) => {
    console.log('Sharing post:', postId);
  };

  const handlePostReport = (postId: string) => {
    console.log('Reporting post:', postId);
  };

  const handleJoinChallenge = (challengeId: string) => {
    console.log('Joining challenge:', challengeId);
  };

  const handleLeaveChallenge = (challengeId: string) => {
    console.log('Leaving challenge:', challengeId);
  };

  const handleCompleteChallenge = (challengeId: string) => {
    console.log('Completing challenge:', challengeId);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Community Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
            <Users className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Community Hub
          </h1>
        </div>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Connect with environmental champions, participate in challenges, 
          track your impact, and make a difference together
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Members</p>
                <p className="text-2xl font-bold text-green-700">24,567</p>
              </div>
              <div className="p-3 bg-green-200 dark:bg-green-800/30 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Environmental Reports</p>
                <p className="text-2xl font-bold text-blue-700">8,942</p>
              </div>
              <div className="p-3 bg-blue-200 dark:bg-blue-800/30 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Challenges</p>
                <p className="text-2xl font-bold text-purple-700">15</p>
              </div>
              <div className="p-3 bg-purple-200 dark:bg-purple-800/30 rounded-lg">
                <Trophy className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">CO₂ Reduced</p>
                <p className="text-2xl font-bold text-orange-700">1,247 t</p>
              </div>
              <div className="p-3 bg-orange-200 dark:bg-orange-800/30 rounded-lg">
                <Leaf className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="feed">Community Feed</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="profile">My Profile</TabsTrigger>
        </TabsList>

        {/* Community Feed Tab */}
        <TabsContent value="feed" className="space-y-6">
          <CommunityFeed
            currentUser={selectedUser}
            onPostCreate={handlePostCreate}
            onPostLike={handlePostLike}
            onPostComment={handlePostComment}
            onPostShare={handlePostShare}
            onPostReport={handlePostReport}
          />
        </TabsContent>

        {/* Challenges Tab */}
        <TabsContent value="challenges" className="space-y-6">
          <CommunityChallenges
            user={selectedUser}
            onJoinChallenge={handleJoinChallenge}
            onLeaveChallenge={handleLeaveChallenge}
            onCompleteChallenge={handleCompleteChallenge}
          />
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-6">
          <CommunityLeaderboard
            currentUser={selectedUser}
            onUserClick={handleUserClick}
            timeRange="weekly"
          />
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <CommunityProfile
            user={selectedUser}
            onUpdateProfile={(updates) => {
              console.log('Updating profile:', updates);
              setSelectedUser({ ...selectedUser, ...updates });
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Community Impact Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-green-500" />
            Community Impact
          </CardTitle>
          <CardDescription>
            Together, we're making a real difference for our planet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">24,567</div>
              <div className="text-sm text-gray-600">Active Members</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">8,942</div>
              <div className="text-sm text-gray-600">Reports Submitted</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">1,247</div>
              <div className="text-sm text-gray-600">Tons CO₂ Reduced</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">15,420</div>
              <div className="text-sm text-gray-600">Trees Planted</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}