import { LRUCache } from "lru-cache";
import { EducationalContent, ContentFilter, ContentSort, ContentStats } from "@/types/educational";

// Simple UUID generator as fallback
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Educational Content Service
export class EducationalContentService {
  private cache: LRUCache<string, EducationalContent[]>;
  private mockContent: EducationalContent[];

  constructor() {
    // Initialize cache with a maximum of 100 entries and 5-minute TTL
    this.cache = new LRUCache({
      max: 100,
      ttl: 1000 * 60 * 5, // 5 minutes
    });

    // Initialize mock content data
    this.mockContent = this.generateMockContent();
  }

  /**
   * Generate mock educational content data
   */
  private generateMockContent(): EducationalContent[] {
    return [
      {
        id: generateUUID(),
        title: "Understanding Air Quality Index (AQI)",
        description: "A comprehensive guide to understanding how AQI is calculated and what it means for your health. Learn about different pollutant levels and their health impacts.",
        type: "article",
        category: "air-quality",
        author: {
          name: "Dr. Ahmed Hassan",
          avatar: "/avatars/ahmed.jpg",
          credentials: ["PhD in Environmental Science", "Air Quality Expert"],
        },
        readTime: "8 min read",
        difficulty: "beginner",
        tags: ["AQI", "Air Quality", "Health", "Beginner Guide"],
        likes: 234,
        views: 1500,
        isSaved: false,
        thumbnail: "/images/article1.jpg",
        publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        id: generateUUID(),
        title: "Climate Change and Air Pollution: The Connection",
        description: "Exploring how climate change impacts air quality and vice versa in this informative video. Understand the complex relationships between climate and air pollution.",
        type: "video",
        category: "climate-change",
        author: {
          name: "Climate Science Today",
          avatar: "/avatars/climate.jpg",
          credentials: ["Climate Research Institute"],
        },
        duration: "12:45",
        difficulty: "intermediate",
        tags: ["Climate Change", "Air Pollution", "Environment", "Science"],
        likes: 567,
        views: 3500,
        isSaved: true,
        thumbnail: "/images/video1.jpg",
        publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        id: generateUUID(),
        title: "Indoor Air Quality: A Complete Guide",
        description: "Learn about indoor air pollutants, their sources, and effective strategies to improve the air quality in your home and workplace.",
        type: "article",
        category: "air-quality",
        author: {
          name: "Sarah Johnson",
          avatar: "/avatars/sarah.jpg",
          credentials: ["Indoor Air Quality Specialist", "LEED Accredited Professional"],
        },
        readTime: "12 min read",
        difficulty: "intermediate",
        tags: ["Indoor Air", "Home Health", "Pollutants", "Ventilation"],
        likes: 189,
        views: 980,
        isSaved: false,
        thumbnail: "/images/article2.jpg",
        publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        id: generateUUID(),
        title: "The Impact of Vehicles on Urban Air Pollution",
        description: "An infographic showing how different vehicle types contribute to urban air pollution and what can be done to reduce emissions.",
        type: "infographic",
        category: "pollution-sources",
        author: {
          name: "Urban Planning Institute",
          avatar: "/avatars/urban.jpg",
          credentials: ["Transportation Research Center"],
        },
        difficulty: "intermediate",
        tags: ["Vehicles", "Urban Planning", "Transportation", "Emissions"],
        likes: 412,
        views: 2200,
        isSaved: true,
        thumbnail: "/images/infographic1.jpg",
        publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        id: generateUUID(),
        title: "Health Effects of Long-Term Air Pollution Exposure",
        description: "A detailed scientific review of the health impacts of long-term exposure to air pollutants, including respiratory diseases, cardiovascular issues, and cancer risks.",
        type: "article",
        category: "health-effects",
        author: {
          name: "Dr. Maria Rodriguez",
          avatar: "/avatars/maria.jpg",
          credentials: ["MD, MPH", "Environmental Health Specialist"],
        },
        readTime: "15 min read",
        difficulty: "advanced",
        tags: ["Health", "Disease", "Research", "Medical"],
        likes: 723,
        views: 4500,
        isSaved: false,
        thumbnail: "/images/article3.jpg",
        publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        id: generateUUID(),
        title: "Sustainable Living: Reducing Your Carbon Footprint",
        description: "Practical guide to sustainable living habits that help reduce air pollution and combat climate change. Learn actionable steps you can take today.",
        type: "guide",
        category: "sustainability",
        author: {
          name: "Eco Warriors Collective",
          avatar: "/avatars/eco.jpg",
          credentials: ["Sustainability Experts", "Environmental Activists"],
        },
        readTime: "6 min read",
        difficulty: "beginner",
        tags: ["Sustainability", "Carbon Footprint", "Green Living", "Tips"],
        likes: 1567,
        views: 8900,
        isSaved: true,
        thumbnail: "/images/guide1.jpg",
        publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
      {
        id: generateUUID(),
        title: "Renewable Energy and Air Quality Benefits",
        description: "Exploring how transitioning to renewable energy sources like solar, wind, and hydro can significantly improve air quality and reduce greenhouse gas emissions.",
        type: "video",
        category: "climate-change",
        author: {
          name: "Green Tech Solutions",
          avatar: "/avatars/greentech.jpg",
          credentials: ["Renewable Energy Engineers"],
        },
        duration: "18:30",
        difficulty: "intermediate",
        tags: ["Renewable Energy", "Solar", "Wind", "Green Tech"],
        likes: 892,
        views: 5200,
        isSaved: false,
        thumbnail: "/images/video2.jpg",
        publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      },
      {
        id: generateUUID(),
        title: "Industrial Pollution: Sources and Solutions",
        description: "Comprehensive analysis of industrial pollution sources, their environmental impact, and innovative solutions for cleaner industrial processes.",
        type: "article",
        category: "pollution-sources",
        author: {
          name: "Industrial Ecology Research",
          avatar: "/avatars/industrial.jpg",
          credentials: ["Environmental Engineers", "Industrial Ecology Experts"],
        },
        readTime: "20 min read",
        difficulty: "advanced",
        tags: ["Industry", "Pollution", "Solutions", "Innovation"],
        likes: 345,
        views: 1800,
        isSaved: true,
        thumbnail: "/images/article4.jpg",
        publishedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
      },
    ];
  }

  /**
   * Get all educational content with optional filtering and sorting
   */
  public async getContent(
    filter: ContentFilter = {},
    sort: ContentSort = { field: 'publishedAt', direction: 'desc' }
  ): Promise<EducationalContent[]> {
    // Generate cache key based on filter and sort parameters
    const cacheKey = JSON.stringify({ filter, sort });
    
    // Try to get from cache first
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Filter content based on provided criteria
    let filteredContent = [...this.mockContent];

    if (filter.category) {
      filteredContent = filteredContent.filter(content => content.category === filter.category);
    }

    if (filter.type) {
      filteredContent = filteredContent.filter(content => content.type === filter.type);
    }

    if (filter.difficulty) {
      filteredContent = filteredContent.filter(content => content.difficulty === filter.difficulty);
    }

    if (filter.tags && filter.tags.length > 0) {
      filteredContent = filteredContent.filter(content =>
        filter.tags!.some((tag: string) => content.tags.includes(tag))
      );
    }

    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      filteredContent = filteredContent.filter(content =>
        content.title.toLowerCase().includes(query) ||
        content.description.toLowerCase().includes(query) ||
        content.tags.some((tag: string) => tag.toLowerCase().includes(query))
      );
    }

    // Sort content based on provided criteria
    filteredContent.sort((a, b) => {
      let valueA: any, valueB: any;

      switch (sort.field) {
        case 'publishedAt':
          valueA = a.publishedAt.getTime();
          valueB = b.publishedAt.getTime();
          break;
        case 'views':
          valueA = a.views;
          valueB = b.views;
          break;
        case 'likes':
          valueA = a.likes;
          valueB = b.likes;
          break;
        case 'title':
          valueA = a.title.toLowerCase();
          valueB = b.title.toLowerCase();
          break;
        default:
          valueA = a.publishedAt.getTime();
          valueB = b.publishedAt.getTime();
      }

      if (sort.direction === 'asc') {
        return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
      } else {
        return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
      }
    });

    // Cache the result
    this.cache.set(cacheKey, filteredContent);

    return filteredContent;
  }

  /**
   * Get content by ID
   */
  public async getContentById(id: string): Promise<EducationalContent | null> {
    return this.mockContent.find(content => content.id === id) || null;
  }

  /**
   * Create new educational content
   */
  public async createContent(content: Omit<EducationalContent, 'id' | 'likes' | 'views' | 'publishedAt'>): Promise<EducationalContent> {
    const newContent: EducationalContent = {
      ...content,
      id: generateUUID(),
      likes: 0,
      views: 0,
      publishedAt: new Date(),
    };

    this.mockContent.unshift(newContent);
    this.cache.clear(); // Clear cache as content has changed

    return newContent;
  }

  /**
   * Update existing educational content
   */
  public async updateContent(id: string, updates: Partial<EducationalContent>): Promise<EducationalContent | null> {
    const contentIndex = this.mockContent.findIndex(content => content.id === id);
    if (contentIndex === -1) {
      return null;
    }

    this.mockContent[contentIndex] = {
      ...this.mockContent[contentIndex],
      ...updates,
    };

    this.cache.clear(); // Clear cache as content has changed

    return this.mockContent[contentIndex];
  }

  /**
   * Delete educational content
   */
  public async deleteContent(id: string): Promise<boolean> {
    const contentIndex = this.mockContent.findIndex(content => content.id === id);
    if (contentIndex === -1) {
      return false;
    }

    this.mockContent.splice(contentIndex, 1);
    this.cache.clear(); // Clear cache as content has changed

    return true;
  }

  /**
   * Like/unlike content
   */
  public async toggleLike(id: string, userId: string): Promise<{ liked: boolean; likes: number }> {
    const content = this.mockContent.find(c => c.id === id);
    if (!content) {
      throw new Error('Content not found');
    }

    // In a real implementation, you would track user likes in a database
    // For now, we'll just increment/decrement the like count
    content.likes += 1;
    this.cache.clear(); // Clear cache as content has changed

    return { liked: true, likes: content.likes };
  }

  /**
   * Save/unsave content
   */
  public async toggleSave(id: string, userId: string): Promise<{ saved: boolean }> {
    const content = this.mockContent.find(c => c.id === id);
    if (!content) {
      throw new Error('Content not found');
    }

    // In a real implementation, you would track user saves in a database
    content.isSaved = !content.isSaved;
    this.cache.clear(); // Clear cache as content has changed

    return { saved: content.isSaved };
  }

  /**
   * Increment view count
   */
  public async incrementViews(id: string): Promise<void> {
    const content = this.mockContent.find(c => c.id === id);
    if (content) {
      content.views += 1;
      this.cache.clear(); // Clear cache as content has changed
    }
  }

  /**
   * Get content statistics
   */
  public async getContentStats(): Promise<ContentStats> {
    const stats: ContentStats = {
      totalContent: this.mockContent.length,
      totalViews: this.mockContent.reduce((sum, content) => sum + content.views, 0),
      totalLikes: this.mockContent.reduce((sum, content) => sum + content.likes, 0),
      categoryDistribution: {},
      typeDistribution: {},
      difficultyDistribution: {},
    };

    // Calculate distributions
    this.mockContent.forEach(content => {
      // Category distribution
      stats.categoryDistribution[content.category] = 
        (stats.categoryDistribution[content.category] || 0) + 1;
      
      // Type distribution
      stats.typeDistribution[content.type] = 
        (stats.typeDistribution[content.type] || 0) + 1;
      
      // Difficulty distribution
      stats.difficultyDistribution[content.difficulty] = 
        (stats.difficultyDistribution[content.difficulty] || 0) + 1;
    });

    return stats;
  }

  /**
   * Get trending content
   */
  public async getTrendingContent(limit: number = 10): Promise<EducationalContent[]> {
    // Calculate engagement score (views + likes * 2) for trending
    const contentWithScores = this.mockContent.map(content => ({
      ...content,
      engagementScore: content.views + content.likes * 2,
    }));

    return contentWithScores
      .sort((a, b) => b.engagementScore - a.engagementScore)
      .slice(0, limit);
  }

  /**
   * Get recommended content for a user
   */
  public async getRecommendedContent(userId: string, limit: number = 10): Promise<EducationalContent[]> {
    // In a real implementation, this would use ML algorithms based on user behavior
    // For now, we'll return content with high engagement
    
    const contentWithScores = this.mockContent.map(content => ({
      ...content,
      recommendationScore: content.views + content.likes,
    }));

    return contentWithScores
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, limit);
  }

  /**
   * Clear cache
   */
  public clearCache(): void {
    this.cache.clear();
  }
}

// Export singleton instance
export const educationalContentService = new EducationalContentService();