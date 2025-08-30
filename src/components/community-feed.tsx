"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Heart,
  MessageCircle,
  Share2,
  Send,
  Search,
  Filter,
  Plus,
  Image,
  MapPin,
  Calendar,
  TrendingUp,
  Leaf,
  Globe,
  Award,
  Users,
  Clock,
  Zap,
  Droplets,
  Camera,
  MoreHorizontal,
  ThumbsUp,
  Eye,
  BookmarkPlus,
  Flag,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { CommunityPost, Comment, User } from '@/lib/community-types';
import { useToast } from '@/hooks/use-toast';

interface CommunityFeedProps {
  currentUser?: User;
  onPostCreate?: (content: string, images?: File[]) => void;
  onPostLike?: (postId: string) => void;
  onPostComment?: (postId: string, content: string) => void;
  onPostShare?: (postId: string) => void;
  onPostReport?: (postId: string) => void;
}

export function CommunityFeed({ 
  currentUser, 
  onPostCreate, 
  onPostLike, 
  onPostComment, 
  onPostShare, 
  onPostReport 
}: CommunityFeedProps) {
  const { toast } = useToast();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);

  useEffect(() => {
    // Generate mock posts for demonstration
    const mockPosts: CommunityPost[] = [
      {
        id: '1',
        userId: 'user1',
        userName: 'EcoWarrior42',
        userAvatar: '/avatars/1.png',
        content: 'Just completed my first community clean-up event! We collected over 50kg of plastic waste from the local beach. Feeling great about making a difference! 🌊♻️ #cleanocean #communityimpact',
        images: ['/images/cleanup1.jpg', '/images/cleanup2.jpg'],
        likes: 245,
        comments: 32,
        shares: 18,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        location: {
          latitude: 40.7128,
          longitude: -74.0060,
          city: 'New York'
        },
        tags: ['cleanocean', 'communityimpact', 'volunteer'],
        isPinned: false,
      },
      {
        id: '2',
        userId: 'user2',
        userName: 'GreenGuardian',
        userAvatar: '/avatars/2.png',
        content: 'Amazing discovery today! Found a way to reduce my household energy consumption by 30% just by switching to LED bulbs and unplugging devices when not in use. Small changes, big impact! 💡⚡ #energysaving #sustainability',
        likes: 189,
        comments: 24,
        shares: 15,
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        tags: ['energysaving', 'sustainability', 'tips'],
        isPinned: false,
      },
      {
        id: '3',
        userId: 'user3',
        userName: 'NatureLover',
        userAvatar: '/avatars/3.png',
        content: 'Air quality in my area has improved significantly this month! The AQI dropped from 120 to 65. Great to see positive changes when we all work together. 🌿🌍 #airquality #improvement',
        likes: 156,
        comments: 19,
        shares: 12,
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        location: {
          latitude: 34.0522,
          longitude: -118.2437,
          city: 'Los Angeles'
        },
        tags: ['airquality', 'improvement', 'environment'],
        isPinned: false,
      },
      {
        id: '4',
        userId: 'user4',
        userName: 'CleanAirAdvocate',
        userAvatar: '/avatars/4.png',
        content: 'Participated in the local tree planting initiative today! Planted 10 native trees in the community park. Every tree helps combat climate change and improves air quality. 🌱🌳 #reforestation #climateaction',
        likes: 298,
        comments: 45,
        shares: 31,
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        location: {
          latitude: 41.8781,
          longitude: -87.6298,
          city: 'Chicago'
        },
        tags: ['reforestation', 'climateaction', 'community'],
        isPinned: true,
      },
      {
        id: '5',
        userId: 'user5',
        userName: 'PlanetProtector',
        userAvatar: '/avatars/5.png',
        content: 'Just finished reading an amazing book on sustainable living. Here are 3 key takeaways: 1) Reduce, reuse, recycle in that order 2) Support local and sustainable businesses 3) Educate others about environmental issues. Knowledge is power! 📚💚 #sustainableliving #education',
        likes: 134,
        comments: 28,
        shares: 22,
        timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['sustainableliving', 'education', 'books'],
        isPinned: false,
      },
    ];
    setPosts(mockPosts);
  }, []);

  const handleCreatePost = () => {
    if (!newPostContent.trim()) {
      toast({
        title: "Content Required",
        description: "Please write something to share with the community.",
        variant: "destructive",
      });
      return;
    }

    onPostCreate?.(newPostContent, selectedImage ? [selectedImage] : undefined);
    
    // Reset form
    setNewPostContent('');
    setSelectedImage(null);
    
    toast({
      title: "Post Created!",
      description: "Your post has been shared with the community.",
    });
  };

  const handleLikePost = (postId: string) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { ...post, likes: post.likes + 1 } 
          : post
      )
    );
    onPostLike?.(postId);
  };

  const handleCommentPost = (postId: string, content: string) => {
    if (!content.trim()) return;
    
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { ...post, comments: post.comments + 1 } 
          : post
      )
    );
    onPostComment?.(postId, content);
  };

  const handleSharePost = (postId: string) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { ...post, shares: post.shares + 1 } 
          : post
      )
    );
    onPostShare?.(postId);
  };

  const handleReportPost = (postId: string) => {
    onPostReport?.(postId);
    toast({
      title: "Post Reported",
      description: "Thank you for helping keep our community safe.",
    });
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const postDate = new Date(timestamp);
    const diffMs = now.getTime() - postDate.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return postDate.toLocaleDateString();
  };

  const filteredPosts = posts.filter(post => {
    const matchesFilter = activeFilter === 'all' || 
      (activeFilter === 'pinned' && post.isPinned) ||
      (activeFilter === 'images' && post.images && post.images.length > 0) ||
      (activeFilter === 'location' && post.location);
    
    const matchesSearch = post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesFilter && matchesSearch;
  });

  const renderPost = (post: CommunityPost) => {
    const isExpanded = expandedPostId === post.id;
    const hasLiked = false; // In a real app, this would come from user state
    const hasSaved = false; // In a real app, this would come from user state

    return (
      <Card key={post.id} className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <Avatar className="h-10 w-10">
                <AvatarImage src={post.userAvatar} alt={post.userName} />
                <AvatarFallback>
                  {post.userName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{post.userName}</h4>
                  {post.isPinned && (
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                      Pinned
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-3 w-3" />
                  <span>{formatTimeAgo(post.timestamp)}</span>
                  {post.location && (
                    <>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{post.location.city}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {/* Content */}
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {post.content}
            </p>

            {/* Images */}
            {post.images && post.images.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {post.images.map((image, index) => (
                  <div 
                    key={index} 
                    className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 cursor-pointer"
                    onClick={() => setExpandedPostId(isExpanded ? null : post.id)}
                  >
                    <img 
                      src={image} 
                      alt={`Post image ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                    {post.images && post.images.length > 1 && (
                      <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                        {index + 1}/{post.images.length}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/20"
                    onClick={() => setSearchQuery(tag)}
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLikePost(post.id)}
                  className={`flex items-center gap-1 ${hasLiked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'}`}
                >
                  <Heart className={`h-4 w-4 ${hasLiked ? 'fill-current' : ''}`} />
                  <span>{post.likes}</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1 text-gray-600 hover:text-blue-500"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>{post.comments}</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSharePost(post.id)}
                  className="flex items-center gap-1 text-gray-600 hover:text-green-500"
                >
                  <Share2 className="h-4 w-4" />
                  <span>{post.shares}</span>
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`text-gray-600 hover:text-blue-500 ${hasSaved ? 'text-blue-500' : ''}`}
                >
                  <BookmarkPlus className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleReportPost(post.id)}
                  className="text-gray-600 hover:text-red-500"
                >
                  <Flag className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Comments Section */}
            {isExpanded && (
              <div className="space-y-4 pt-4 border-t">
                {/* Add Comment */}
                <div className="flex gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={currentUser?.avatar} alt={currentUser?.name} />
                    <AvatarFallback>
                      {currentUser?.name?.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 flex gap-2">
                    <Input
                      placeholder="Write a comment..."
                      className="flex-1"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                          handleCommentPost(post.id, e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                        if (input.value.trim()) {
                          handleCommentPost(post.id, input.value);
                          input.value = '';
                        }
                      }}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Sample Comments */}
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/avatars/comment1.png" alt="Commenter" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">Jane Doe</span>
                          <span className="text-xs text-gray-500">2h ago</span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          Great initiative! I'd love to join the next clean-up event. How can I get involved?
                        </p>
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <Button variant="ghost" size="sm" className="text-xs text-gray-600 hover:text-red-500">
                          <ThumbsUp className="h-3 w-3 mr-1" />
                          5
                        </Button>
                        <Button variant="ghost" size="sm" className="text-xs text-gray-600">
                          Reply
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/avatars/comment2.png" alt="Commenter" />
                      <AvatarFallback>MS</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">Mike Smith</span>
                          <span className="text-xs text-gray-500">3h ago</span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          This is exactly what we need more of in our communities! Keep up the amazing work! 🌟
                        </p>
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <Button variant="ghost" size="sm" className="text-xs text-gray-600 hover:text-red-500">
                          <ThumbsUp className="h-3 w-3 mr-1" />
                          12
                        </Button>
                        <Button variant="ghost" size="sm" className="text-xs text-gray-600">
                          Reply
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Create Post */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={currentUser?.avatar} alt={currentUser?.name} />
                <AvatarFallback>
                  {currentUser?.name?.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Input
                  placeholder="Share your environmental story, tips, or news..."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Image className="h-4 w-4 mr-2" />
                  Add Photo
                </Button>
                <Button variant="ghost" size="sm">
                  <MapPin className="h-4 w-4 mr-2" />
                  Add Location
                </Button>
              </div>
              
              <Button 
                onClick={handleCreatePost}
                disabled={!newPostContent.trim()}
                className="bg-green-600 hover:bg-green-700"
              >
                <Send className="h-4 w-4 mr-2" />
                Post
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search posts, tags, or users..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value)}
              >
                <option value="all">All Posts</option>
                <option value="pinned">Pinned</option>
                <option value="images">With Images</option>
                <option value="location">With Location</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts */}
      <div className="space-y-4">
        {filteredPosts.length > 0 ? (
          filteredPosts.map(renderPost)
        ) : (
          <Card>
            <CardContent className="pt-6 pb-12">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Posts Found</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {searchQuery ? 'Try adjusting your search terms.' : 'Be the first to share something with the community!'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
