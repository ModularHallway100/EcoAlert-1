import { NextRequest, NextResponse } from 'next/server';
import { educationalContentService } from '@/services/educational-content-service';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { action, userId } = body;
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    switch (action) {
      case 'like':
        const likeResult = await educationalContentService.toggleLike(id, userId);
        return NextResponse.json({
          success: true,
          data: likeResult,
        });
        
      case 'save':
        const saveResult = await educationalContentService.toggleSave(id, userId);
        return NextResponse.json({
          success: true,
          data: saveResult,
        });
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error interacting with educational content:', error);
    
    if (error instanceof Error && error.message === 'Content not found') {
      return NextResponse.json(
        { success: false, error: 'Content not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to interact with content' },
      { status: 500 }
    );
  }
}