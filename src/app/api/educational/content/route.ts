import { NextRequest, NextResponse } from 'next/server';
import { educationalContentService } from '@/services/educational-content-service';
import { ContentFilter, ContentSort } from '@/types/educational';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const category = searchParams.get('category') || undefined;
    const type = searchParams.get('type') || undefined;
    const difficulty = searchParams.get('difficulty') || undefined;
    const tags = searchParams.get('tags')?.split(',') || undefined;
    const searchQuery = searchParams.get('search') || undefined;
    const sortBy = searchParams.get('sortBy') || 'publishedAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Build filter and sort objects
    const filter: ContentFilter = {
      category,
      type,
      difficulty,
      tags,
      searchQuery,
    };
    
    const sort: ContentSort = {
      field: sortBy as ContentSort['field'],
      direction: sortOrder as ContentSort['direction'],
    };
    
    // Get content
    const content = await educationalContentService.getContent(filter, sort);
    
    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedContent = content.slice(startIndex, endIndex);
    
    return NextResponse.json({
      success: true,
      data: paginatedContent,
      pagination: {
        page,
        limit,
        total: content.length,
        totalPages: Math.ceil(content.length / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching educational content:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['title', 'description', 'type', 'category', 'difficulty', 'tags', 'thumbnail'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `${field} is required` },
          { status: 400 }
        );
      }
    }
    
    // Create content
    const newContent = await educationalContentService.createContent(body);
    
    return NextResponse.json({
      success: true,
      data: newContent,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating educational content:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create content' },
      { status: 500 }
    );
  }
}