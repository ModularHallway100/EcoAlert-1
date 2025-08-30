"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Trophy,
  Star,
  Award,
  Target,
  Calendar,
  MapPin,
  TrendingUp,
  Users,
  Zap,
  Leaf,
  Globe,
  Droplets,
  Award as AwardIcon,
  ChevronRight,
  Clock,
  BarChart3,
  Medal,
  Crown,
  Gem,
  Sparkles,
} from 'lucide-react';
import { User, Badge as BadgeType, Achievement } from '@/lib/community-types';
import { BADGE_DEFINITIONS, LEVEL_COLORS, RANK_COLORS } from '@/lib/community-config';
import { useToast } from '@/hooks/use-toast';

interface CommunityProfileProps {
  user: User;
  onUpdateProfile?: (updates: Partial<User>) => void;
}

export function CommunityProfile({ user, onUpdateProfile }: CommunityProfileProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedBadge, setSelectedBadge] = useState<BadgeType | null>(null);
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    // Filter recent achievements (last 7 days)
    const recent = user.achievements
      .filter(achievement => achievement.unlockedAt)
      .sort((a, b) => new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime())
      .slice(0, 5);
    setRecentAchievements(recent);
  }, [user.achievements]);

  const getLevelProgress = () => {
    const currentLevel = user.level;
    const nextLevelThreshold = currentLevel < 10 
      ? LEVEL_COLORS[currentLevel] 
      : LEVEL_COLORS[LEVEL_COLORS.length - 1];
    
    const currentThreshold = currentLevel === 1 ? 0 : 
      (currentLevel <= 10 ? 
        [0, 200, 500, 1000, 2000, 3500, 5000, 7000, 10000, 15000][currentLevel - 2] : 
        15000);
    
    const nextThreshold = currentLevel <= 10 ? 
      [200, 500, 1000, 2000, 3500, 5000, 7000, 10000, 15000, 20000][currentLevel - 1] : 
      20000;
    
    const progress = ((user.points - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  const getBadgeRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'rare': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'epic': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'legendary': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleBadgeClick = (badge: BadgeType) => {
    setSelectedBadge(badge);
    toast({
      title: badge.name,
      description: badge.description,
    });
  };

  const handleShareProfile = () => {
    const shareText = `Check out my EcoAlert profile! I'm level ${user.level} with ${user.points} points helping protect our environment! 🌍`;
    if (navigator.share) {
      navigator.share({
        title: 'My EcoAlert Profile',
        text: shareText,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      toast({
        title: "Profile link copied!",
        description: "Share your environmental impact with others.",
      });
    }
  };

  const rarityStats = user.badges.reduce((acc, badge) => {
    acc[badge.rarity] = (acc[badge.rarity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex flex-col items-center">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-2xl">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="mt-3 text-center">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">{user.name}</span>
                  {user.level >= 10 && <Crown className="h-5 w-5 text-yellow-500" />}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Level {user.level} Eco Warrior
                </p>
              </div>
            </div>
            
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Level Progress</span>
                  <span className="text-sm text-gray-600">
                    {user.points} / {user.level < 10 ? [200, 500, 1000, 2000, 3500, 5000, 7000, 10000, 15000, 20000][user.level - 1] : 20000} points
                  </span>
                </div>
                <Progress value={getLevelProgress()} className="h-3" />
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{user.points}</div>
                  <div className="text-xs text-gray-600">Total Points</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{user.badges.length}</div>
                  <div className="text-xs text-gray-600">Badges Earned</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{user.achievements.filter(a => a.unlockedAt).length}</div>
                  <div className="text-xs text-gray-600">Achievements</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{Object.keys(rarityStats).length}</div>
                  <div className="text-xs text-gray-600">Rarity Types</div>
                </div>
              </div>
            </div>
            
            <Button onClick={handleShareProfile} variant="outline">
              <TrendingUp className="h-4 w-4 mr-2" />
              Share Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="impact">Impact</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                      <Leaf className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Environmental Report Submitted</p>
                      <p className="text-xs text-gray-600">2 hours ago</p>
                    </div>
                    <Badge variant="outline">+50 pts</Badge>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <Star className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Badge Earned</p>
                      <p className="text-xs text-gray-600">Eco Reporter</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                      <Users className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Joined Community Challenge</p>
                      <p className="text-xs text-gray-600">Air Quality Warriors</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rarity Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gem className="h-5 w-5" />
                  Badge Collection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(rarityStats).map(([rarity, count]) => (
                    <div key={rarity} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          rarity === 'common' ? 'bg-gray-400' :
                          rarity === 'rare' ? 'bg-blue-400' :
                          rarity === 'epic' ? 'bg-purple-400' : 'bg-yellow-400'
                        }`} />
                        <span className="text-sm capitalize">{rarity}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{count}</span>
                        <span className="text-xs text-gray-600">
                          /{BADGE_DEFINITIONS.filter(b => b.rarity === rarity).length}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AwardIcon className="h-5 w-5" />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentAchievements.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recentAchievements.map((achievement) => (
                    <div key={achievement.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                        <Trophy className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{achievement.name}</p>
                        <p className="text-xs text-gray-600">{achievement.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-300">
                    Keep engaging to unlock new achievements!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Badges Tab */}
        <TabsContent value="badges" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {user.badges.map((badge) => (
              <div
                key={badge.id}
                className={`p-4 rounded-lg border cursor-pointer transition-all hover:scale-105 ${
                  getBadgeRarityColor(badge.rarity)
                }`}
                onClick={() => handleBadgeClick(badge)}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">{badge.icon}</div>
                  <h3 className="font-medium text-sm">{badge.name}</h3>
                  <p className="text-xs opacity-80 mt-1">{badge.description}</p>
                  <div className="mt-2">
                    <Badge variant="outline" className="text-xs">
                      {badge.rarity}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {user.achievements.map((achievement) => (
              <Card key={achievement.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${
                      achievement.unlockedAt 
                        ? 'bg-green-100 dark:bg-green-900/20 text-green-600' 
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                    }`}>
                      <Target className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{achievement.name}</h3>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                      <div className="mt-2">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-gray-600">Progress</span>
                          <span className="text-xs font-medium">
                            {achievement.progress}/{achievement.target}
                          </span>
                        </div>
                        <Progress 
                          value={(achievement.progress / achievement.target) * 100} 
                          className="h-2" 
                        />
                      </div>
                    </div>
                    {achievement.unlockedAt && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Unlocked
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Impact Tab */}
        <TabsContent value="impact" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="p-3 bg-green-200 dark:bg-green-800/30 rounded-full w-fit mx-auto mb-4">
                    <Leaf className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-green-700">247</div>
                  <div className="text-sm text-green-600">Trees Planted</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="p-3 bg-blue-200 dark:bg-blue-800/30 rounded-full w-fit mx-auto mb-4">
                    <Droplets className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-blue-700">15,420</div>
                  <div className="text-sm text-blue-600">Liters Saved</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="p-3 bg-orange-200 dark:bg-orange-800/30 rounded-full w-fit mx-auto mb-4">
                    <Zap className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="text-2xl font-bold text-orange-700">3,280</div>
                  <div className="text-sm text-orange-600">kWh Saved</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="p-3 bg-purple-200 dark:bg-purple-800/30 rounded-full w-fit mx-auto mb-4">
                    <Globe className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold text-purple-700">892</div>
                  <div className="text-sm text-purple-600">kg CO₂ Reduced</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Environmental Impact Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Carbon Footprint Reduction</span>
                  <span className="text-sm text-green-600">-23% vs last month</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Community Ranking</span>
                  <span className="text-sm text-blue-600">Top 15% globally</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Reports Impact Score</span>
                  <span className="text-sm text-purple-600">8.7/10</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}