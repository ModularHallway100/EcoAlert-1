import { NextRequest, NextResponse } from 'next/server';
import { educationalContentService } from '@/services/educational-content-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'overview';
    
    switch (type) {
      case 'overview':
        // Get overall content statistics
        const stats = await educationalContentService.getContentStats();
        return NextResponse.json({
          success: true,
          data: stats,
        });
        
      case 'trending':
        // Get trending content
        const trendingLimit = parseInt(searchParams.get('limit') || '10');
        const trending = await educationalContentService.getTrendingContent(trendingLimit);
        return NextResponse.json({
          success: true,
          data: trending,
        });
        
      case 'recommended':
        // Get recommended content (in a real app, this would be personalized)
        const userId = searchParams.get('userId') || 'default-user';
        const recommendedLimit = parseInt(searchParams.get('limit') || '10');
        const recommended = await educationalContentService.getRecommendedContent(userId, recommendedLimit);
        return NextResponse.json({
          success: true,
          data: recommended,
        });
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid analytics type' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error fetching educational analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}