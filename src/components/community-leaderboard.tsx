"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Trophy,
  Crown,
  Medal,
  Award,
  TrendingUp,
  TrendingDown,
  Users,
  MapPin,
  Calendar,
  Star,
  Zap,
  Leaf,
  Globe,
  ChevronRight,
  Filter,
  Search,
  Clock,
  Target,
  Award as AwardIcon,
  BarChart3,
  Activity,
  Sparkles,
} from 'lucide-react';
import { LeaderboardEntry, User } from '@/lib/community-types';
import { LEVEL_COLORS } from '@/lib/community-config';
import { useToast } from '@/hooks/use-toast';

interface CommunityLeaderboardProps {
  currentUser?: User;
  onUserClick?: (userId: string) => void;
  timeRange?: 'daily' | 'weekly' | 'monthly' | 'alltime';
}

export function CommunityLeaderboard({ 
  currentUser, 
  onUserClick, 
  timeRange = 'weekly' 
}: CommunityLeaderboardProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('global');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [friendsLeaderboard, setFriendsLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [teamsLeaderboard, setTeamsLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    // Generate mock leaderboard data
    const mockGlobalLeaderboard: LeaderboardEntry[] = [
      {
        id: '1',
        userId: 'user1',
        userName: 'EcoWarrior42',
        userAvatar: '/avatars/1.png',
        points: 15420,
        rank: 1,
        level: 10,
        change: 2,
      },
      {
        id: '2',
        userId: 'user2',
        userName: 'GreenGuardian',
        userAvatar: '/avatars/2.png',
        points: 14850,
        rank: 2,
        level: 9,
        change: -1,
      },
      {
        id: '3',
        userId: 'user3',
        userName: 'NatureLover',
        userAvatar: '/avatars/3.png',
        points: 13200,
        rank: 3,
        level: 9,
        change: 0,
      },
      {
        id: '4',
        userId: 'user4',
        userName: 'CleanAirAdvocate',
        userAvatar: '/avatars/4.png',
        points: 12800,
        rank: 4,
        level: 8,
        change: 3,
      },
      {
        id: '5',
        userId: 'user5',
        userName: 'PlanetProtector',
        userAvatar: '/avatars/5.png',
        points: 11500,
        rank: 5,
        level: 8,
        change: -2,
      },
      {
        id: '6',
        userId: 'user6',
        userName: 'EcoChampion',
        userAvatar: '/avatars/6.png',
        points: 10800,
        rank: 6,
        level: 7,
        change: 1,
      },
      {
        id: '7',
        userId: 'user7',
        userName: 'GreenHero',
        userAvatar: '/avatars/7.png',
        points: 9500,
        rank: 7,
        level: 7,
        change: 0,
      },
      {
        id: '8',
        userId: 'user8',
        userName: 'EcoExplorer',
        userAvatar: '/avatars/8.png',
        points: 8800,
        rank: 8,
        level: 6,
        change: 4,
      },
      {
        id: '9',
        userId: 'user9',
        userName: 'NatureSaver',
        userAvatar: '/avatars/9.png',
        points: 8200,
        rank: 9,
        level: 6,
        change: -1,
      },
      {
        id: '10',
        userId: 'user10',
        userName: 'EcoWarrior',
        userAvatar: '/avatars/10.png',
        points: 7600,
        rank: 10,
        level: 6,
        change: 2,
      },
    ];

    const mockFriendsLeaderboard: LeaderboardEntry[] = [
      {
        id: '11',
        userId: 'friend1',
        userName: 'Sarah Green',
        userAvatar: '/avatars/friend1.png',
        points: 9800,
        rank: 1,
        level: 7,
        change: 1,
      },
      {
        id: '12',
        userId: 'friend2',
        userName: 'Mike Eco',
        userAvatar: '/avatars/friend2.png',
        points: 8200,
        rank: 2,
        level: 6,
        change: -1,
      },
      {
        id: '13',
        userId: 'friend3',
        userName: 'Lisa Nature',
        userAvatar: '/avatars/friend3.png',
        points: 7500,
        rank: 3,
        level: 6,
        change: 3,
      },
      {
        id: '14',
        userId: 'currentUser',
        userName: currentUser?.name || 'You',
        userAvatar: currentUser?.avatar,
        points: currentUser?.points || 6800,
        rank: 4,
        level: currentUser?.level || 5,
        change: 2,
      },
    ];

    const mockTeamsLeaderboard: LeaderboardEntry[] = [
      {
        id: 'team1',
        userId: 'team1',
        userName: 'Green Warriors',
        userAvatar: '/avatars/team1.png',
        points: 45200,
        rank: 1,
        level: 10,
        change: 1,
      },
      {
        id: 'team2',
        userId: 'team2',
        userName: 'Eco Defenders',
        userAvatar: '/avatars/team2.png',
        points: 42800,
        rank: 2,
        level: 9,
        change: -1,
      },
      {
        id: 'team3',
        userId: 'team3',
        userName: 'Planet Protectors',
        userAvatar: '/avatars/team3.png',
        points: 39500,
        rank: 3,
        level: 9,
        change: 0,
      },
      {
        id: 'team4',
        userId: 'team4',
        userName: 'Clean Air Crew',
        userAvatar: '/avatars/team4.png',
        points: 36800,
        rank: 4,
        level: 8,
        change: 2,
      },
      {
        id: 'team5',
        userId: 'team5',
        userName: 'Nature Lovers',
        userAvatar: '/avatars/team5.png',
        points: 34200,
        rank: 5,
        level: 8,
        change: -2,
      },
    ];

    setLeaderboard(mockGlobalLeaderboard);
    setFriendsLeaderboard(mockFriendsLeaderboard);
    setTeamsLeaderboard(mockTeamsLeaderboard);
  }, [currentUser]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-orange-600" />;
      default:
        return <Trophy className="h-5 w-5 text-gray-300" />;
    }
  };

  const getRankColor = (rank: number) => {
    if (rank <= 3) return 'text-yellow-600 font-bold';
    return 'text-gray-600';
  };

  const getRankBackground = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20';
    if (rank === 2) return 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700';
    if (rank === 3) return 'bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20';
    return '';
  };

  const getChangeIcon = (change?: number) => {
    if (!change) return null;
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return null;
  };

  const getChangeColor = (change?: number) => {
    if (!change) return 'text-gray-500';
    if (change > 0) return 'text-green-500';
    if (change < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  const filteredLeaderboard = leaderboard.filter(entry =>
    entry.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFriendsLeaderboard = friendsLeaderboard.filter(entry =>
    entry.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTeamsLeaderboard = teamsLeaderboard.filter(entry =>
    entry.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUserClick = (entry: LeaderboardEntry) => {
    onUserClick?.(entry.userId);
    toast({
      title: `Viewing ${entry.userName}'s profile`,
      description: "Loading user profile...",
    });
  };

  const renderLeaderboardEntry = (entry: LeaderboardEntry, isTeam = false) => {
    const isCurrentUser = entry.userId === 'currentUser' || entry.userName === (currentUser?.name || 'You');
    const rankBackground = getRankBackground(entry.rank);

    return (
      <div
        key={entry.id}
        className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-all hover:scale-[1.02] ${rankBackground} ${
          isCurrentUser ? 'ring-2 ring-green-500 bg-green-50 dark:bg-green-900/10' : ''
        }`}
        onClick={() => handleUserClick(entry)}
      >
        {/* Rank */}
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800">
          {getRankIcon(entry.rank)}
        </div>

        {/* Avatar and Info */}
        <div className="flex items-center gap-3 flex-1">
          <Avatar className="h-12 w-12">
            <AvatarImage src={entry.userAvatar} alt={entry.userName} />
            <AvatarFallback>
              {entry.userName.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{entry.userName}</h3>
              {isCurrentUser && (
                <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                  You
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Level {entry.level}</span>
              {isTeam && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>Team</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Points */}
        <div className="text-right">
          <div className="text-xl font-bold text-green-600">{entry.points.toLocaleString()}</div>
          <div className="text-sm text-gray-600">points</div>
        </div>

        {/* Change */}
        {entry.change !== undefined && (
          <div className={`flex items-center gap-1 ${getChangeColor(entry.change)}`}>
            {getChangeIcon(entry.change)}
            <span className="text-sm font-medium">{Math.abs(entry.change)}</span>
          </div>
        )}
      </div>
    );
  };

  const getUserRank = () => {
    const userEntry = leaderboard.find(entry => entry.userId === 'currentUser' || entry.userName === (currentUser?.name || 'You'));
    return userEntry ? userEntry.rank : null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Community Leaderboard</h2>
          <p className="text-gray-600 dark:text-gray-300">
            See how you rank against other environmental champions
          </p>
        </div>
        <div className="flex gap-2">
          <select
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value as any)}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="alltime">All Time</option>
          </select>
        </div>
      </div>

      {/* Your Rank Card */}
      {currentUser && (
        <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-200 dark:bg-green-800/30">
                  {getUserRank() && getRankIcon(getUserRank()!)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Your Ranking</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    You're doing great! Keep up the good work.
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-green-700">#{getUserRank() || '-'}</div>
                <div className="text-sm text-gray-600">out of {leaderboard.length} users</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="global">Global</TabsTrigger>
          <TabsTrigger value="friends">Friends</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
        </TabsList>

        {/* Global Leaderboard */}
        <TabsContent value="global" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Global Leaderboard - {selectedTimeRange.charAt(0).toUpperCase() + selectedTimeRange.slice(1)}
              </CardTitle>
              <CardDescription>
                Top environmental contributors from around the world
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredLeaderboard.length > 0 ? (
                  filteredLeaderboard.map(entry => renderLeaderboardEntry(entry))
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-300">
                      No users found matching your search.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Friends Leaderboard */}
        <TabsContent value="friends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Friends Leaderboard
              </CardTitle>
              <CardDescription>
                Compete with your friends and see who's making the biggest impact
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredFriendsLeaderboard.length > 0 ? (
                  filteredFriendsLeaderboard.map(entry => renderLeaderboardEntry(entry))
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-300">
                      No friends found in the leaderboard.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Teams Leaderboard */}
        <TabsContent value="teams" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AwardIcon className="h-5 w-5" />
                Teams Leaderboard
              </CardTitle>
              <CardDescription>
                Top teams competing together for environmental causes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredTeamsLeaderboard.length > 0 ? (
                  filteredTeamsLeaderboard.map(entry => renderLeaderboardEntry(entry, true))
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-300">
                      No teams found in the leaderboard.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Leaderboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Participants</p>
                <p className="text-2xl font-bold">{leaderboard.length}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. User Level</p>
                <p className="text-2xl font-bold">7.2</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Teams</p>
                <p className="text-2xl font-bold">24</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <AwardIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}