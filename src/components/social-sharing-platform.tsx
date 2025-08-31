"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Share2, 
  Heart, 
  MessageCircle, 
  Bookmark, 
  ExternalLink, 
  Copy, 
  Download,
  Eye,
  TrendingUp,
  Award,
  Users,
  Calendar,
  MapPin,
  Leaf,
  Globe,
  BookOpen,
  Video,
  FileText,
  Image as ImageIcon
} from 'lucide-react';

interface SocialPost {
  id: string;
  author: {
    name: string;
    avatar: string;
    username: string;
    verified: boolean;
  };
  content: string;
  image?: string;
  video?: string;
  location?: string;
  timestamp: Date;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  isBookmarked: boolean;
  tags: string[];
  engagement: {
    views: number;
    reach: number;
    impressions: number;
  };
}

interface EducationalContent {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'infographic' | 'guide';
  category: 'air-quality' | 'climate-change' | 'pollution-sources' | 'health-effects' | 'sustainability';
  author: {
    name: string;
    avatar: string;
    credentials: string[];
  };
  duration?: string; // For videos
  readTime?: string; // For articles
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  likes: number;
  views: number;
  isSaved: boolean;
  thumbnail: string;
  publishedAt: Date;
}

interface SocialSharingPlatformProps {
  userId?: string;
}

export function SocialSharingPlatform({ userId }: SocialSharingPlatformProps) {
  const [activeTab, setActiveTab] = useState('feed');
  const [newPost, setNewPost] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [educationalContent, setEducationalContent] = useState<EducationalContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data initialization
  useState(() => {
    // Mock posts
    const mockPosts: SocialPost[] = [
      {
        id: '1',
        author: {
          name: 'Sarah Johnson',
          avatar: '/avatars/sarah.jpg',
          username: '@sarahj',
          verified: true,
        },
        content: 'Just participated in the city\'s air quality monitoring program! The data shows significant improvement in PM2.5 levels this month compared to last year 🌱 #AirQuality #EnvironmentalMonitoring',
        image: '/images/post1.jpg',
        location: 'Riyadh, Saudi Arabia',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        likes: 124,
        comments: 23,
        shares: 15,
        isLiked: false,
        isBookmarked: false,
        tags: ['AirQuality', 'EnvironmentalMonitoring', 'Riyadh'],
        engagement: {
          views: 1500,
          reach: 2500,
          impressions: 3200,
        },
      },
      {
        id: '2',
        author: {
          name: 'Green Warriors',
          avatar: '/avatars/green.jpg',
          username: '@greenwarriors',
          verified: true,
        },
        content: 'New study reveals how urban green spaces can reduce local air pollution by up to 40%! Check out our latest infographic for details. #GreenSpaces #CleanAir',
        image: '/images/post2.jpg',
        location: 'Global',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
        likes: 89,
        comments: 12,
        shares: 31,
        isLiked: true,
        isBookmarked: true,
        tags: ['GreenSpaces', 'CleanAir', 'Study'],
        engagement: {
          views: 2100,
          reach: 3500,
          impressions: 4200,
        },
      },
    ];

    // Mock educational content
    const mockContent: EducationalContent[] = [
      {
        id: '1',
        title: 'Understanding Air Quality Index (AQI)',
        description: 'A comprehensive guide to understanding how AQI is calculated and what it means for your health.',
        type: 'article',
        category: 'air-quality',
        author: {
          name: 'Dr. Ahmed Hassan',
          avatar: '/avatars/ahmed.jpg',
          credentials: ['PhD in Environmental Science', 'Air Quality Expert'],
        },
        readTime: '8 min read',
        difficulty: 'beginner',
        tags: ['AQI', 'Air Quality', 'Health', 'Beginner Guide'],
        likes: 234,
        views: 1500,
        isSaved: false,
        thumbnail: '/images/article1.jpg',
        publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        id: '2',
        title: 'Climate Change and Air Pollution: The Connection',
        description: 'Exploring how climate change impacts air quality and vice versa in this informative video.',
        type: 'video',
        category: 'climate-change',
        author: {
          name: 'Climate Science Today',
          avatar: '/avatars/climate.jpg',
          credentials: ['Climate Research Institute'],
        },
        duration: '12:45',
        difficulty: 'intermediate',
        tags: ['Climate Change', 'Air Pollution', 'Environment', 'Science'],
        likes: 567,
        views: 3500,
        isSaved: true,
        thumbnail: '/images/video1.jpg',
        publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ];

    setPosts(mockPosts);
    setEducationalContent(mockContent);
    setIsLoading(false);
  });

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, likes: post.isLiked ? post.likes - 1 : post.likes + 1, isLiked: !post.isLiked }
        : post
    ));
  };

  const handleBookmark = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, isBookmarked: !post.isBookmarked }
        : post
    ));
  };

  const handleShare = async (postId: string, content: string) => {
    // Share functionality
    const shareText = `Check out this post on EcoAlert: ${content}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'EcoAlert Social',
          text: shareText,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Sharing cancelled or failed');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText);
      alert('Post link copied to clipboard!');
    }
  };

  const handleSaveContent = (contentId: string) => {
    setEducationalContent(educationalContent.map(content => 
      content.id === contentId 
        ? { ...content, isSaved: !content.isSaved }
        : content
    ));
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'air-quality': 'bg-blue-100 text-blue-800',
      'climate-change': 'bg-green-100 text-green-800',
      'pollution-sources': 'bg-orange-100 text-orange-800',
      'health-effects': 'bg-red-100 text-red-800',
      'sustainability': 'bg-purple-100 text-purple-800',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'infographic': return <ImageIcon className="h-4 w-4" />;
      case 'guide': return <FileText className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Share2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p>Loading social platform...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Community Hub</h2>
          <p className="text-gray-600">Share insights and learn together</p>
        </div>
        <Button>
          <Share2 className="h-4 w-4 mr-2" />
          Create Post
        </Button>
      </div>

      {/* Create Post Section */}
      <Card>
        <CardHeader>
          <CardTitle>Create a Post</CardTitle>
          <CardDescription>Share your environmental insights and experiences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="What's on your mind about environmental issues?"
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            className="min-h-[100px]"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <ImageIcon className="h-4 w-4 mr-2" />
                Add Image
              </Button>
              <Button variant="outline" size="sm">
                <Video className="h-4 w-4 mr-2" />
                Add Video
              </Button>
              <Button variant="outline" size="sm">
                <MapPin className="h-4 w-4 mr-2" />
                Add Location
              </Button>
            </div>
            <Button disabled={!newPost.trim()}>
              Post
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="feed">Community Feed</TabsTrigger>
          <TabsTrigger value="educational">Educational Content</TabsTrigger>
          <TabsTrigger value="trending">Trending Topics</TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={post.author.avatar} />
                      <AvatarFallback>{post.author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{post.author.name}</span>
                        {post.author.verified && <Award className="h-4 w-4 text-blue-500" />}
                        <span className="text-gray-500 text-sm">{post.author.username}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{formatTimeAgo(post.timestamp)}</span>
                        {post.location && (
                          <>
                            <MapPin className="h-3 w-3" />
                            <span>{post.location}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Bookmark className={`h-4 w-4 ${post.isBookmarked ? 'text-blue-500 fill-current' : ''}`} />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-gray-800">{post.content}</p>
                
                {post.image && (
                  <div className="relative rounded-lg overflow-hidden">
                    <img 
                      src={post.image} 
                      alt="Post content" 
                      className="w-full h-64 object-cover"
                    />
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-6">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleLike(post.id)}
                      className="flex items-center gap-2"
                    >
                      <Heart className={`h-4 w-4 ${post.isLiked ? 'text-red-500 fill-current' : ''}`} />
                      <span>{post.likes}</span>
                    </Button>
                    
                    <Button variant="ghost" size="sm" className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" />
                      <span>{post.comments}</span>
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleShare(post.id, post.content)}
                      className="flex items-center gap-2"
                    >
                      <Share2 className="h-4 w-4" />
                      <span>{post.shares}</span>
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Eye className="h-3 w-3" />
                    <span>{post.engagement.views.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="educational" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {educationalContent.map((content) => (
              <Card key={content.id} className="hover:shadow-md transition-shadow">
                <div className="relative">
                  <img 
                    src={content.thumbnail} 
                    alt={content.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge className={getCategoryColor(content.category)}>
                      {content.category.replace('-', ' ')}
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(content.type)}
                      <span className="text-sm text-gray-500">
                        {content.type === 'video' ? content.duration : content.readTime}
                      </span>
                    </div>
                    <Badge variant={content.difficulty === 'beginner' ? 'default' : 'secondary'}>
                      {content.difficulty}
                    </Badge>
                  </div>
                  
                  <h3 className="font-semibold mb-2">{content.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{content.description}</p>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={content.author.avatar} />
                      <AvatarFallback className="text-xs">
                        {content.author.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium">{content.author.name}</div>
                      <div className="text-xs text-gray-500">
                        {content.author.credentials[0]}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        <span>{content.likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{content.views.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="flex flex-wrap gap-1">
                        {content.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleSaveContent(content.id)}
                      >
                        <Bookmark className={`h-4 w-4 ${content.isSaved ? 'text-blue-500 fill-current' : ''}`} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trending" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Trending Topics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-orange-500" />
                  Trending Topics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {['#CleanAirCities', '#ClimateAction', '#GreenTech', '#SustainableLiving', '#AirQualityNow'].map((topic) => (
                  <div key={topic} className="flex items-center justify-between">
                    <span className="font-medium">{topic}</span>
                    <Badge variant="secondary">Hot</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Popular Hashtags */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="h-5 w-5 text-blue-500" />
                  Popular Hashtags
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {['#AirQuality', '#EnvironmentalHealth', '#ClimateChange', '#Pollution', '#GreenEnergy'].map((tag) => (
                  <div key={tag} className="flex items-center justify-between">
                    <span className="font-medium">{tag}</span>
                    <span className="text-sm text-gray-500">12K posts</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Top Contributors */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  Top Contributors
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: 'EcoWarrior23', posts: 156, impact: 'High' },
                  { name: 'GreenGuru', posts: 142, impact: 'High' },
                  { name: 'AirQualityExpert', posts: 98, impact: 'Medium' },
                ].map((contributor) => (
                  <div key={contributor.name} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{contributor.name}</div>
                      <div className="text-sm text-gray-500">{contributor.posts} posts</div>
                    </div>
                    <Badge variant={contributor.impact === 'High' ? 'default' : 'secondary'}>
                      {contributor.impact}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Community Challenges */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-500" />
                Active Community Challenges
              </CardTitle>
              <CardDescription>Join environmental initiatives and make a difference</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">#30DaysGreenChallenge</h4>
                  <p className="text-sm text-gray-600 mb-3">Take one green action daily for 30 days</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span className="text-sm">2,345 participants</span>
                    </div>
                    <Button size="sm">Join</Button>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Air Quality Monitoring</h4>
                  <p className="text-sm text-gray-600 mb-3">Help monitor air quality in your neighborhood</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span className="text-sm">892 participants</span>
                    </div>
                    <Button size="sm">Join</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}