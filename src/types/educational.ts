// Educational Content Types

export interface Author {
  name: string;
  avatar: string;
  credentials: string[];
}

export interface EducationalContent {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'infographic' | 'guide';
  category: 'air-quality' | 'climate-change' | 'pollution-sources' | 'health-effects' | 'sustainability';
  author: Author;
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

export interface ContentFilter {
  category?: string;
  type?: string;
  difficulty?: string;
  tags?: string[];
  searchQuery?: string;
}

export interface ContentSort {
  field: 'publishedAt' | 'views' | 'likes' | 'title';
  direction: 'asc' | 'desc';
}

export interface ContentStats {
  totalContent: number;
  totalViews: number;
  totalLikes: number;
  categoryDistribution: Record<string, number>;
  typeDistribution: Record<string, number>;
  difficultyDistribution: Record<string, number>;
}

export interface LearningProgress {
  contentId: string;
  userId: string;
  progress: number; // 0-100
  completed: boolean;
  startedAt: Date;
  completedAt?: Date;
  timeSpent: number; // in minutes
}

export interface Certificate {
  id: string;
  userId: string;
  contentId: string;
  title: string;
  issuedAt: Date;
  verificationCode: string;
}