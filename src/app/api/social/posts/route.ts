import { NextRequest, NextResponse } from 'next/server';
import { LRUCache } from "lru-cache";

// Mock data for social posts
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

// Simple in-memory storage for production use
let mockPosts: SocialPost[] = [
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'timestamp';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const search = searchParams.get('search') || '';
    const tags = searchParams.get('tags')?.split(',') || [];
    
    // Filter posts
    let filteredPosts = [...mockPosts];
    
    if (search) {
      filteredPosts = filteredPosts.filter(post =>
        post.content.toLowerCase().includes(search.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
      );
    }
    
    if (tags.length > 0) {
      filteredPosts = filteredPosts.filter(post =>
        tags.some(tag => post.tags.includes(tag))
      );
    }
    
    // Sort posts
    filteredPosts.sort((a, b) => {
      let valueA: any, valueB: any;
      
      switch (sortBy) {
        case 'timestamp':
          valueA = a.timestamp.getTime();
          valueB = b.timestamp.getTime();
          break;
        case 'likes':
          valueA = a.likes;
          valueB = b.likes;
          break;
        case 'comments':
          valueA = a.comments;
          valueB = b.comments;
          break;
        case 'engagement':
          valueA = a.engagement.views;
          valueB = b.engagement.views;
          break;
        default:
          valueA = a.timestamp.getTime();
          valueB = b.timestamp.getTime();
      }
      
      if (sortOrder === 'asc') {
        return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
      } else {
        return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
      }
    });
    
    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPosts = filteredPosts.slice(startIndex, endIndex);
    
    return NextResponse.json({
      success: true,
      data: paginatedPosts,
      pagination: {
        page,
        limit,
        total: filteredPosts.length,
        totalPages: Math.ceil(filteredPosts.length / limit),
      },
      trendingTags: extractTrendingTags(filteredPosts),
    });
  } catch (error) {
    console.error('Error fetching social posts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, image, video, location, tags, author } = body;
    
    // Validate required fields
    if (!content || !author) {
      return NextResponse.json(
        { success: false, error: 'Content and author are required' },
        { status: 400 }
      );
    }
    
    // Create new post
    const newPost: SocialPost = {
      id: generateId(),
      author,
      content,
      image,
      video,
      location,
      timestamp: new Date(),
      likes: 0,
      comments: 0,
      shares: 0,
      isLiked: false,
      isBookmarked: false,
      tags: tags || [],
      engagement: {
        views: 0,
        reach: 0,
        impressions: 0,
      },
    };
    
    mockPosts.unshift(newPost);
    
    return NextResponse.json({
      success: true,
      data: newPost,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating social post:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create post' },
      { status: 500 }
    );
  }
}

// Helper functions
function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function extractTrendingTags(posts: SocialPost[]): string[] {
  const tagCounts: Record<string, number> = {};
  
  posts.forEach(post => {
    post.tags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });
  
  return Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([tag]) => tag);
}