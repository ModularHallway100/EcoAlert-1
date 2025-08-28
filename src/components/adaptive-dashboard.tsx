"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { useSocket } from '@/components/socket-provider';
import { useAnalytics } from '@/components/analytics-provider';
import { useTrackFeature } from '@/components/analytics-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Activity, 
  MapPin, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  Shield, 
  Zap,
  Leaf,
  Cloud,
  Droplets,
  Volume2,
  Bell,
  Settings,
  HelpCircle,
  Thermometer,
  Wind,
  Gauge,
  Calendar,
  Clock,
  BarChart3,
  PieChart,
  LineChart,
  ArrowUp,
  ArrowDown,
  Minus,
  RefreshCw,
  CheckCircle,
  Heart,
  Star,
  Award,
  Target,
  TrendingDown,
  Eye,
  Filter,
  Download,
  Share2,
  BookOpen,
  Lightbulb,
  Users2,
  Map,
  AlertCircle,
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AdaptiveDashboardProps {
  userId?: string;
}

interface HealthScore {
  overall: number;
  air: number;
  water: number;
  noise: number;
  environment: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  unlocked: boolean;
  progress?: number;
  total?: number;
}

interface EcoAction {
  id: string;
  title: string;
  description: string;
  impact: string;
  difficulty: 'easy' | 'medium' | 'hard';
  completed: boolean;
  points: number;
}

interface LearningContent {
  id: string;
  title: string;
  type: 'article' | 'video' | 'tip' | 'fact';
  category: string;
  readTime: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  saved: boolean;
}

interface CommunityImpact {
  treesPlanted: number;
  co2Reduced: number;
  wasteReduced: number;
  energySaved: number;
  participants: number;
}

export function AdaptiveDashboard({ userId }: AdaptiveDashboardProps) {
  const { user } = useAuth();
  const { socket, isConnected, sensorData, alerts } = useSocket();
  const { trackEvent } = useAnalytics();
  const trackFeature = useTrackFeature('adaptive-dashboard');
  const { toast } = useToast();

  const [healthScore, setHealthScore] = useState<HealthScore>({
    overall: 0,
    air: 0,
    water: 0,
    noise: 0,
    environment: 0,
  });

  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [ecoActions, setEcoActions] = useState<EcoAction[]>([]);
  const [learningContent, setLearningContent] = useState<LearningContent[]>([]);
  const [communityImpact, setCommunityImpact] = useState<CommunityImpact>({
    treesPlanted: 0,
    co2Reduced: 0,
    wasteReduced: 0,
    energySaved: 0,
    participants: 0,
  });

  const [selectedTab, setSelectedTab] = useState('health');
  const [isLoading, setIsLoading] = useState(true);

  // Initialize dashboard data
  useEffect(() => {
    if (socket && isConnected) {
      socket.emit('request_adaptive_data');
    }

    // Simulate loading and data fetching
    const timer = setTimeout(() => {
      setIsLoading(false);
      generateMockData();
    }, 1500);

    return () => clearTimeout(timer);
  }, [socket, isConnected]);

  const generateMockData = () => {
    // Mock health score
    const mockHealthScore: HealthScore = {
      overall: Math.floor(Math.random() * 30) + 70,
      air: Math.floor(Math.random() * 30) + 70,
      water: Math.floor(Math.random() * 30) + 70,
      noise: Math.floor(Math.random() * 30) + 70,
      environment: Math.floor(Math.random() * 30) + 70,
    };

    // Mock achievements
    const mockAchievements: Achievement[] = [
      {
        id: '1',
        title: 'Eco Novice',
        description: 'Complete your first environmental report',
        icon: '🌱',
        points: 100,
        unlocked: true,
      },
      {
        id: '2',
        title: 'Air Quality Advocate',
        description: 'Track air quality for 7 consecutive days',
        icon: '💨',
        points: 250,
        unlocked: false,
        progress: 5,
        total: 7,
      },
      {
        id: '3',
        title: 'Water Warrior',
        description: 'Report 5 water quality issues',
        icon: '💧',
        points: 300,
        unlocked: false,
        progress: 2,
        total: 5,
      },
      {
        id: '4',
        title: 'Community Leader',
        description: 'Reach top 10 in local leaderboard',
        icon: '👑',
        points: 500,
        unlocked: false,
      },
      {
        id: '5',
        title: 'Knowledge Seeker',
        description: 'Read 10 educational articles',
        icon: '📚',
        points: 200,
        unlocked: false,
        progress: 3,
        total: 10,
      },
    ];

    // Mock eco actions
    const mockEcoActions: EcoAction[] = [
      {
        id: '1',
        title: 'Reduce Plastic Usage',
        description: 'Use reusable bags and containers for a week',
        impact: 'Reduces plastic waste by 5kg',
        difficulty: 'easy',
        completed: false,
        points: 50,
      },
      {
        id: '2',
        title: 'Energy Conservation',
        description: 'Reduce energy consumption by 20% this month',
        impact: 'Saves 50kWh of electricity',
        difficulty: 'medium',
        completed: false,
        points: 100,
      },
      {
        id: '3',
        title: 'Green Commute',
        description: 'Use public transport or bike for 5 days',
        impact: 'Reduces CO2 emissions by 15kg',
        difficulty: 'medium',
        completed: true,
        points: 75,
      },
      {
        id: '4',
        title: 'Water Conservation',
        description: 'Reduce water usage by 15% this week',
        impact: 'Saves 100 liters of water',
        difficulty: 'easy',
        completed: false,
        points: 60,
      },
      {
        id: '5',
        title: 'Community Garden',
        description: 'Participate in local community garden project',
        impact: 'Helps grow fresh produce locally',
        difficulty: 'hard',
        completed: false,
        points: 150,
      },
    ];

    // Mock learning content
    const mockLearningContent: LearningContent[] = [
      {
        id: '1',
        title: 'Understanding Air Quality Index',
        type: 'article',
        category: 'air',
        readTime: 5,
        difficulty: 'beginner',
        saved: true,
      },
      {
        id: '2',
        title: 'How to Reduce Indoor Air Pollution',
        type: 'video',
        category: 'air',
        readTime: 8,
        difficulty: 'intermediate',
        saved: false,
      },
      {
        id: '3',
        title: 'Water Quality Testing Methods',
        type: 'article',
        category: 'water',
        readTime: 7,
        difficulty: 'intermediate',
        saved: false,
      },
      {
        id: '4',
        title: 'Daily Eco Tip: Reduce Energy Consumption',
        type: 'tip',
        category: 'energy',
        readTime: 2,
        difficulty: 'beginner',
        saved: true,
      },
      {
        id: '5',
        title: 'Climate Change and Local Communities',
        type: 'article',
        category: 'climate',
        readTime: 10,
        difficulty: 'advanced',
        saved: false,
      },
    ];

    // Mock community impact
    const mockCommunityImpact: CommunityImpact = {
      treesPlanted: 1247,
      co2Reduced: 45.2,
      wasteReduced: 12.8,
      energySaved: 89.5,
      participants: 3421,
    };

    setHealthScore(mockHealthScore);
    setAchievements(mockAchievements);
    setEcoActions(mockEcoActions);
    setLearningContent(mockLearningContent);
    setCommunityImpact(mockCommunityImpact);
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getHealthScoreBackground = (score: number) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900/20';
    if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900/20';
    if (score >= 40) return 'bg-orange-100 dark:bg-orange-900/20';
    return 'bg-red-100 dark:bg-red-900/20';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'hard': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-800';
    }
  };

  const handleTabChange = (tab: string) => {
    setSelectedTab(tab);
    trackFeature('tab_switch', { tab });
  };

  const handleActionComplete = (actionId: string) => {
    setEcoActions(prev => 
      prev.map(action => 
        action.id === actionId ? { ...action, completed: true } : action
      )
    );
    trackEvent('eco_action_completed', { actionId });
    toast({
      title: "Action Completed!",
      description: "You've earned points for helping the environment.",
    });
  };

  const handleContentSave = (contentId: string) => {
    setLearningContent(prev => 
      prev.map(content => 
        content.id === contentId ? { ...content, saved: !content.saved } : content
      )
    );
    trackEvent('content_saved', { contentId });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading personalized dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Personalized Eco Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Tailored insights and recommendations for you
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-green-600 border-green-600">
            <Leaf className="h-3 w-3 mr-1" />
            Personalized
          </Badge>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Customize
          </Button>
        </div>
      </div>

      {/* Health Score Overview */}
      <Card className={`${getHealthScoreBackground(healthScore.overall)}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Environmental Health Score
          </CardTitle>
          <CardDescription>
            Your personalized environmental health assessment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className={`text-4xl font-bold ${getHealthScoreColor(healthScore.overall)}`}>
                {healthScore.overall}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Overall</p>
              <Progress value={healthScore.overall} className="mt-2" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${getHealthScoreColor(healthScore.air)}`}>
                  {healthScore.air}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300">Air Quality</p>
                <Progress value={healthScore.air} className="mt-1 h-1" />
              </div>
              
              <div className="text-center">
                <div className={`text-2xl font-bold ${getHealthScoreColor(healthScore.water)}`}>
                  {healthScore.water}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300">Water Quality</p>
                <Progress value={healthScore.water} className="mt-1 h-1" />
              </div>
              
              <div className="text-center">
                <div className={`text-2xl font-bold ${getHealthScoreColor(healthScore.noise)}`}>
                  {healthScore.noise}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300">Noise Level</p>
                <Progress value={healthScore.noise} className="mt-1 h-1" />
              </div>
              
              <div className="text-center">
                <div className={`text-2xl font-bold ${getHealthScoreColor(healthScore.environment)}`}>
                  {healthScore.environment}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300">Environment</p>
                <Progress value={healthScore.environment} className="mt-1 h-1" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="health">Health</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
          <TabsTrigger value="learn">Learn</TabsTrigger>
        </TabsList>

        <TabsContent value="health" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personalized Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  Personalized Recommendations
                </CardTitle>
                <CardDescription>
                  Based on your health profile and local conditions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Air Quality Alert</AlertTitle>
                    <AlertDescription>
                      High PM2.5 levels detected. Consider limiting outdoor activities, especially if you have respiratory conditions.
                    </AlertDescription>
                  </Alert>
                  
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Water Quality Tip</AlertTitle>
                    <AlertDescription>
                      Your local water quality is good. Consider using a water filter for better taste.
                    </AlertDescription>
                  </Alert>
                  
                  <Alert>
                    <TrendingDown className="h-4 w-4" />
                    <AlertTitle>Noise Improvement</AlertTitle>
                    <AlertDescription>
                      Noise levels have decreased by 15% this week. Great progress on community noise reduction efforts!
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>

            {/* Community Impact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users2 className="h-5 w-5 text-blue-500" />
                  Your Community Impact
                </CardTitle>
                <CardDescription>
                  Together, we're making a difference
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {communityImpact.treesPlanted}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Trees Planted</p>
                  </div>
                  
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {communityImpact.co2Reduced}t
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">CO₂ Reduced</p>
                  </div>
                  
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {communityImpact.wasteReduced}t
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Waste Reduced</p>
                  </div>
                  
                  <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {communityImpact.participants}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Participants</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement) => (
              <Card key={achievement.id} className={achievement.unlocked ? 'border-green-200 dark:border-green-800' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl">{achievement.icon}</div>
                    {achievement.unlocked && (
                      <Star className="h-5 w-5 text-yellow-500" />
                    )}
                  </div>
                  <CardTitle className="text-lg">{achievement.title}</CardTitle>
                  <CardDescription>{achievement.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant={achievement.unlocked ? 'default' : 'outline'}>
                      {achievement.points} pts
                    </Badge>
                    {achievement.progress && achievement.total && (
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {achievement.progress}/{achievement.total}
                      </div>
                    )}
                  </div>
                  {achievement.progress && achievement.total && (
                    <Progress value={(achievement.progress / achievement.total) * 100} className="mt-2" />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="actions" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ecoActions.map((action) => (
              <Card key={action.id} className={action.completed ? 'border-green-200 dark:border-green-800' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{action.title}</CardTitle>
                      <CardDescription className="mt-1">{action.description}</CardDescription>
                    </div>
                    <Badge className={getDifficultyColor(action.difficulty)}>
                      {action.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <Target className="h-4 w-4" />
                      <span>{action.impact}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium">{action.points} points</span>
                      </div>
                      {action.completed ? (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      ) : (
                        <Button 
                          size="sm" 
                          onClick={() => handleActionComplete(action.id)}
                        >
                          Start Action
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="learn" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {learningContent.map((content) => (
              <Card key={content.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{content.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {content.type.charAt(0).toUpperCase() + content.type.slice(1)} • {content.readTime} min read
                      </CardDescription>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleContentSave(content.id)}
                    >
                      {content.saved ? (
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      ) : (
                        <Star className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">
                      {content.category}
                    </Badge>
                    <Badge variant="secondary">
                      {content.difficulty}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}