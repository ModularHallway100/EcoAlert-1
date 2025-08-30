"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar,
  Clock,
  Users,
  Target,
  Trophy,
  Star,
  Zap,
  Leaf,
  Award,
  MapPin,
  ChevronRight,
  Play,
  Pause,
  CheckCircle,
  AlertCircle,
  Plus,
  Filter,
  Search,
  Timer,
  Award as AwardIcon,
  Gift,
  Flag,
  BarChart3,
} from 'lucide-react';
import { CommunityChallenge, User } from '@/lib/community-types';
import { CHALLENGE_TEMPLATES, CHALLENGE_STATUS } from '@/lib/community-config';
import { useToast } from '@/hooks/use-toast';

interface CommunityChallengesProps {
  user: User;
  onJoinChallenge?: (challengeId: string) => void;
  onLeaveChallenge?: (challengeId: string) => void;
  onCompleteChallenge?: (challengeId: string) => void;
}

export function CommunityChallenges({ 
  user, 
  onJoinChallenge, 
  onLeaveChallenge, 
  onCompleteChallenge 
}: CommunityChallengesProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [challenges, setChallenges] = useState<CommunityChallenge[]>([]);

  useEffect(() => {
    // Generate mock challenges for demonstration
    const mockChallenges: CommunityChallenge[] = [
      {
        id: '1',
        title: 'Air Quality Warriors',
        description: 'Submit 5 air quality reports this week to help monitor pollution levels in your area.',
        type: 'individual',
        duration: 7,
        target: 5,
        currentProgress: 2,
        participants: 342,
        rewards: {
          points: 200,
          badges: ['air-quality-warrior'],
        },
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '2',
        title: 'Community Clean-Up',
        description: 'Join our local community clean-up event this Saturday at Central Park.',
        type: 'community',
        duration: 1,
        target: 50,
        currentProgress: 28,
        participants: 156,
        rewards: {
          points: 150,
          badges: ['clean-up-hero'],
        },
        startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '3',
        title: 'Water Conservation Challenge',
        description: 'Report 5 water conservation successes in your neighborhood.',
        type: 'team',
        duration: 14,
        target: 10,
        currentProgress: 7,
        participants: 89,
        rewards: {
          points: 300,
          badges: ['water-saver'],
          exclusive: true,
        },
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '4',
        title: 'Social Awareness Week',
        description: 'Share 3 educational posts about environmental issues to raise awareness.',
        type: 'individual',
        duration: 7,
        target: 3,
        currentProgress: 1,
        participants: 567,
        rewards: {
          points: 100,
          badges: ['social-butterfly'],
        },
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '5',
        title: 'Energy Saving Challenge',
        description: 'Work with your team to report 10 energy conservation tips.',
        type: 'team',
        duration: 10,
        target: 10,
        currentProgress: 10,
        participants: 45,
        rewards: {
          points: 400,
          badges: ['energy-saver'],
        },
        startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
    setChallenges(mockChallenges);
  }, []);

  const getChallengeStatus = (challenge: CommunityChallenge) => {
    const now = new Date();
    const startDate = new Date(challenge.startDate);
    const endDate = new Date(challenge.endDate);
    
    if (now < startDate) return CHALLENGE_STATUS.UPCOMING;
    if (now > endDate) return challenge.currentProgress >= challenge.target ? CHALLENGE_STATUS.COMPLETED : CHALLENGE_STATUS.FAILED;
    return CHALLENGE_STATUS.ACTIVE;
  };

  const getChallengeTypeIcon = (type: string) => {
    switch (type) {
      case 'individual': return <Target className="h-4 w-4" />;
      case 'team': return <Users className="h-4 w-4" />;
      case 'community': return <Users className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getChallengeTypeColor = (type: string) => {
    switch (type) {
      case 'individual': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'team': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'community': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getChallengeStatusColor = (status: string) => {
    switch (status) {
      case CHALLENGE_STATUS.ACTIVE: return 'text-green-600';
      case CHALLENGE_STATUS.UPCOMING: return 'text-blue-600';
      case CHALLENGE_STATUS.COMPLETED: return 'text-purple-600';
      case CHALLENGE_STATUS.FAILED: return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getDaysLeft = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const filteredChallenges = challenges.filter(challenge => {
    const matchesSearch = challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         challenge.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || challenge.type === selectedCategory;
    const status = getChallengeStatus(challenge);
    const matchesTimeFilter = timeFilter === 'all' || 
      (timeFilter === 'upcoming' && status === CHALLENGE_STATUS.UPCOMING) ||
      (timeFilter === 'active' && status === CHALLENGE_STATUS.ACTIVE) ||
      (timeFilter === 'completed' && status === CHALLENGE_STATUS.COMPLETED);
    
    return matchesSearch && matchesCategory && matchesTimeFilter;
  });

  const handleJoinChallenge = (challengeId: string) => {
    toast({
      title: "Challenge Joined!",
      description: "Good luck with the challenge. Let's make a difference together!",
    });
    onJoinChallenge?.(challengeId);
  };

  const handleLeaveChallenge = (challengeId: string) => {
    toast({
      title: "Challenge Left",
      description: "You've left the challenge. You can rejoin anytime!",
    });
    onLeaveChallenge?.(challengeId);
  };

  const handleCompleteChallenge = (challengeId: string) => {
    toast({
      title: "Challenge Completed!",
      description: "Congratulations! You've earned the rewards.",
    });
    onCompleteChallenge?.(challengeId);
  };

  const renderChallengeCard = (challenge: CommunityChallenge) => {
    const status = getChallengeStatus(challenge);
    const daysLeft = getDaysLeft(challenge.endDate);
    const progressPercentage = (challenge.currentProgress / challenge.target) * 100;

    return (
      <Card key={challenge.id} className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {getChallengeTypeIcon(challenge.type)}
                <CardTitle className="text-lg">{challenge.title}</CardTitle>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className={getChallengeTypeColor(challenge.type)}>
                  {challenge.type}
                </Badge>
                <Badge variant="outline" className={getChallengeStatusColor(status)}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Badge>
                {challenge.rewards.exclusive && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    Exclusive
                  </Badge>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">{challenge.rewards.points}</div>
              <div className="text-xs text-gray-600">points</div>
            </div>
          </div>
          <CardDescription>{challenge.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Progress */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm text-gray-600">
                  {challenge.currentProgress} / {challenge.target}
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span>{challenge.participants} participants</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>{challenge.duration} days</span>
              </div>
              {status === CHALLENGE_STATUS.ACTIVE && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>{daysLeft} days left</span>
                </div>
              )}
            </div>

            {/* Rewards */}
            <div>
              <p className="text-sm font-medium mb-2">Rewards</p>
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">{challenge.rewards.points} points</span>
                {challenge.rewards.badges.length > 0 && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="text-sm">
                      {challenge.rewards.badges.length} badge{challenge.rewards.badges.length > 1 ? 's' : ''}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              {status === CHALLENGE_STATUS.ACTIVE && challenge.currentProgress < challenge.target && (
                <Button 
                  onClick={() => handleJoinChallenge(challenge.id)}
                  className="flex-1"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Join Challenge
                </Button>
              )}
              
              {status === CHALLENGE_STATUS.ACTIVE && challenge.currentProgress >= challenge.target && (
                <Button 
                  onClick={() => handleCompleteChallenge(challenge.id)}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete
                </Button>
              )}
              
              {status === CHALLENGE_STATUS.UPCOMING && (
                <Button 
                  variant="outline" 
                  className="flex-1"
                  disabled
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Starts in {daysLeft} days
                </Button>
              )}
              
              {status === CHALLENGE_STATUS.COMPLETED && (
                <Button 
                  variant="outline" 
                  className="flex-1"
                  disabled
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Completed
                </Button>
              )}
              
              {status === CHALLENGE_STATUS.FAILED && (
                <Button 
                  variant="outline" 
                  className="flex-1"
                  disabled
                >
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Failed
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const activeChallenges = challenges.filter(c => getChallengeStatus(c) === CHALLENGE_STATUS.ACTIVE);
  const upcomingChallenges = challenges.filter(c => getChallengeStatus(c) === CHALLENGE_STATUS.UPCOMING);
  const completedChallenges = challenges.filter(c => getChallengeStatus(c) === CHALLENGE_STATUS.COMPLETED);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Community Challenges</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Join challenges, earn rewards, and make a positive impact
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Challenge
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search challenges..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="individual">Individual</option>
                <option value="team">Team</option>
                <option value="community">Community</option>
              </select>
              <select
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="upcoming">Upcoming</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Challenges</p>
                <p className="text-2xl font-bold">{activeChallenges.length}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Play className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold">{upcomingChallenges.length}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold">{completedChallenges.length}</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Trophy className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Challenges Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Active ({activeChallenges.length})</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming ({upcomingChallenges.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedChallenges.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {filteredChallenges.filter(c => getChallengeStatus(c) === CHALLENGE_STATUS.ACTIVE).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredChallenges
                .filter(c => getChallengeStatus(c) === CHALLENGE_STATUS.ACTIVE)
                .map(renderChallengeCard)}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 pb-12">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Challenges</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Check back later for new challenges or browse upcoming ones.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          {filteredChallenges.filter(c => getChallengeStatus(c) === CHALLENGE_STATUS.UPCOMING).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredChallenges
                .filter(c => getChallengeStatus(c) === CHALLENGE_STATUS.UPCOMING)
                .map(renderChallengeCard)}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 pb-12">
                <div className="text-center">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Upcoming Challenges</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    New challenges are added regularly. Stay tuned!
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {filteredChallenges.filter(c => getChallengeStatus(c) === CHALLENGE_STATUS.COMPLETED).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredChallenges
                .filter(c => getChallengeStatus(c) === CHALLENGE_STATUS.COMPLETED)
                .map(renderChallengeCard)}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 pb-12">
                <div className="text-center">
                  <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Completed Challenges</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Complete challenges to see them here.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}