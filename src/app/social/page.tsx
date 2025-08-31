"use client";

import { useState, useEffect } from 'react';
import { SocialSharingPlatform } from '@/components/social-sharing-platform';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Share2, 
  Users, 
  TrendingUp, 
  BookOpen, 
  Leaf, 
  Globe,
  Award,
  Calendar,
  MessageCircle
} from 'lucide-react';

interface UserStats {
  totalPosts: number;
  totalEngagement: number;
  achievements: string[];
  joinedDate: Date;
}

interface CommunityMetrics {
  totalMembers: number;
  activePosts: number;
  totalEducationalContent: number;
  environmentalImpact: number;
}

export default function SocialPage() {
  const [activeTab, setActiveTab] = useState('feed');
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [communityMetrics, setCommunityMetrics] = useState<CommunityMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data loading
    const loadMockData = async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUserStats({
        totalPosts: 24,
        totalEngagement: 1520,
        achievements: ['EcoWarrior', 'Community Leader', 'Educator'],
        joinedDate: new Date('2023-01-15'),
      });
      
      setCommunityMetrics({
        totalMembers: 15420,
        activePosts: 890,
        totalEducationalContent: 245,
        environmentalImpact: 45, // tons of CO2 reduced
      });
      
      setIsLoading(false);
    };
    
    loadMockData();
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Share2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p>Loading community hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Community Hub</h1>
              <p className="mt-1 text-gray-600">Connect, learn, and make a difference together</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Leaf className="h-3 w-3" />
                EcoImpact Leaderboard
              </Badge>
              <Button>
                <Share2 className="h-4 w-4 mr-2" />
                Share Your Story
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="feed">Community Feed</TabsTrigger>
            <TabsTrigger value="learn">Learn & Grow</TabsTrigger>
            <TabsTrigger value="impact">Our Impact</TabsTrigger>
            <TabsTrigger value="challenges">Challenges</TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Main Feed */}
              <div className="lg:col-span-3">
                <SocialSharingPlatform />
              </div>
              
              {/* Sidebar */}
              <div className="space-y-6">
                {/* User Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-yellow-500" />
                      Your Impact
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{userStats?.totalPosts}</div>
                        <div className="text-sm text-gray-600">Posts</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{userStats?.totalEngagement}</div>
                        <div className="text-sm text-gray-600">Engagement</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Achievements</h4>
                      <div className="flex flex-wrap gap-1">
                        {userStats?.achievements.map((achievement, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {achievement}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      Member since {userStats?.joinedDate.toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>

                {/* Community Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-500" />
                      Community Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Members</span>
                      <Badge>{communityMetrics?.totalMembers.toLocaleString()}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Active Posts</span>
                      <Badge variant="secondary">{communityMetrics?.activePosts}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Learning Content</span>
                      <Badge variant="secondary">{communityMetrics?.totalEducationalContent}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">CO₂ Reduced</span>
                      <Badge variant="default">{communityMetrics?.environmentalImpact} tons</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Trending Topics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-orange-500" />
                      Trending Now
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {['#CleanAirCities', '#ClimateAction', '#GreenTech', '#SustainableLiving'].map((topic, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{topic}</span>
                        <Badge variant="outline" className="text-xs">Hot</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="learn" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Learning Paths */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-500" />
                    Learning Paths
                  </CardTitle>
                  <CardDescription>Structured courses to deepen your knowledge</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                    <h4 className="font-medium">Air Quality Basics</h4>
                    <p className="text-sm text-gray-600 mt-1">Learn fundamentals of air quality monitoring</p>
                    <div className="flex items-center justify-between mt-2">
                      <Badge variant="secondary">Beginner</Badge>
                      <span className="text-xs text-gray-500">6 modules</span>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                    <h4 className="font-medium">Climate Science 101</h4>
                    <p className="text-sm text-gray-600 mt-1">Understanding climate change fundamentals</p>
                    <div className="flex items-center justify-between mt-2">
                      <Badge variant="secondary">All Levels</Badge>
                      <span className="text-xs text-gray-500">8 modules</span>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                    <h4 className="font-medium">Sustainability Practices</h4>
                    <p className="text-sm text-gray-600 mt-1">Practical tips for sustainable living</p>
                    <div className="flex items-center justify-between mt-2">
                      <Badge variant="default">Popular</Badge>
                      <span className="text-xs text-gray-500">10 modules</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Expert Webinars */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-green-500" />
                    Upcoming Webinars
                  </CardTitle>
                  <CardDescription>Live sessions with environmental experts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                    <h4 className="font-medium">Future of Renewable Energy</h4>
                    <p className="text-sm text-gray-600 mt-1">with Dr. Ahmed Hassan</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">Dec 15, 2:00 PM</span>
                      <Badge variant="outline">Free</Badge>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                    <h4 className="font-medium">Urban Air Quality Solutions</h4>
                    <p className="text-sm text-gray-600 mt-1">with Sarah Johnson</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">Dec 18, 4:00 PM</span>
                      <Badge variant="outline">Free</Badge>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                    <h4 className="font-medium">Green Building Practices</h4>
                    <p className="text-sm text-gray-600 mt-1">with Green Architecture Team</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">Dec 22, 3:00 PM</span>
                      <Badge variant="outline">Free</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Discussion Forums */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-purple-500" />
                    Discussion Forums
                  </CardTitle>
                  <CardDescription>Connect with peers and experts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                    <h4 className="font-medium">Air Quality Monitoring</h4>
                    <p className="text-sm text-gray-600 mt-1">245 active discussions</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary">Technical</Badge>
                      <span className="text-xs text-gray-500">126 members</span>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                    <h4 className="font-medium">Climate Action</h4>
                    <p className="text-sm text-gray-600 mt-1">189 active discussions</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary">Activism</Badge>
                      <span className="text-xs text-gray-500">98 members</span>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                    <h4 className="font-medium">Sustainable Living</h4>
                    <p className="text-sm text-gray-600 mt-1">312 active discussions</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary">Lifestyle</Badge>
                      <span className="text-xs text-gray-500">256 members</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="impact" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Community Impact */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Leaf className="h-5 w-5 text-green-500" />
                    Our Collective Impact
                  </CardTitle>
                  <CardDescription>Together, we're making a difference for our planet</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-green-600">{communityMetrics?.environmentalImpact}T</div>
                      <div className="text-sm text-gray-600 mt-1">CO₂ Reduced</div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-blue-600">{communityMetrics?.totalMembers}</div>
                      <div className="text-sm text-gray-600 mt-1">Active Members</div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-purple-600">{communityMetrics?.totalEducationalContent}</div>
                      <div className="text-sm text-gray-600 mt-1">Learning Resources</div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-orange-600">892</div>
                      <div className="text-sm text-gray-600 mt-1">Cities Monitored</div>
                    </div>
                  </div>
                  
                  <div className="mt-8 space-y-4">
                    <h4 className="font-medium">Recent Success Stories</h4>
                    <div className="space-y-3">
                      <div className="border rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <Leaf className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h5 className="font-medium">Riyadh Air Quality Initiative</h5>
                            <p className="text-sm text-gray-600 mt-1">
                              Community-driven monitoring program reduced PM2.5 levels by 25% in participating neighborhoods.
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span>245 participants</span>
                              <span>3 months active</span>
                              <Badge variant="outline">Success</Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Globe className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h5 className="font-medium">Global Climate Action Network</h5>
                            <p className="text-sm text-gray-600 mt-1">
                              International collaboration supporting climate resilience projects in 15 countries.
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span>1,200+ members</span>
                              <span>Ongoing</span>
                              <Badge variant="outline">In Progress</Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Personal Impact */}
              <Card>
                <CardHeader>
                  <CardTitle>Your Personal Impact</CardTitle>
                  <CardDescription>Track your contributions to environmental causes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">2.4T</div>
                    <div className="text-sm text-gray-600 mt-1">CO₂ Impact</div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Posts Shared</span>
                      <span className="font-medium">{userStats?.totalPosts}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">People Reached</span>
                      <span className="font-medium">12.5K</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Learning Hours</span>
                      <span className="font-medium">48</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Community Actions</span>
                      <span className="font-medium">16</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-medium mb-2">Impact Badges</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs">EcoExplorer</Badge>
                      <Badge variant="outline" className="text-xs">Knowledge Seeker</Badge>
                      <Badge variant="outline" className="text-xs">Community Builder</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="challenges" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Active Challenges */}
              <Card>
                <CardHeader>
                  <CardTitle>Active Community Challenges</CardTitle>
                  <CardDescription>Join initiatives to make a real difference</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">#30DaysGreenChallenge</h4>
                        <p className="text-sm text-gray-600 mt-1">Take one green action daily for 30 days</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            2,345 participants
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            12 days left
                          </span>
                        </div>
                      </div>
                      <Button size="sm">Join</Button>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">Air Quality Monitoring</h4>
                        <p className="text-sm text-gray-600 mt-1">Help monitor air quality in your neighborhood</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            892 participants
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Ongoing
                          </span>
                        </div>
                      </div>
                      <Button size="sm">Join</Button>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">Zero Waste Week</h4>
                        <p className="text-sm text-gray-600 mt-1">Reduce your waste to zero for one week</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            1,567 participants
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Starts in 3 days
                          </span>
                        </div>
                      </div>
                      <Button size="sm">Join</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Completed Challenges */}
              <Card>
                <CardHeader>
                  <CardTitle>Completed Challenges</CardTitle>
                  <CardDescription>Celebrate your environmental achievements</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border rounded-lg p-4 bg-green-50">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Award className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">Plastic Free July</h4>
                        <p className="text-sm text-gray-600 mt-1">Successfully avoided single-use plastics for 30 days</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>Completed: Nov 2023</span>
                          <Badge variant="outline">Achievement Unlocked</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4 bg-blue-50">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Award className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">Public Transport Week</h4>
                        <p className="text-sm text-gray-600 mt-1">Used only public transportation for a week</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>Completed: Oct 2023</span>
                          <Badge variant="outline">Achievement Unlocked</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4 bg-purple-50">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <Award className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">Knowledge Builder</h4>
                        <p className="text-sm text-gray-600 mt-1">Completed 5 environmental courses</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>Completed: Sep 2023</span>
                          <Badge variant="outline">Achievement Unlocked</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}