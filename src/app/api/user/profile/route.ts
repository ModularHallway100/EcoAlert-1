import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'anonymous';

    const profile = await db.getUserProfile(userId);

    return NextResponse.json({
      success: true,
      data: profile || null,
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'anonymous';
    const updates = await request.json();

    // Get current profile
    const currentProfile = await db.getUserProfile(userId);
    
    // Merge updates with current profile
    const updatedProfile = {
      id: userId,
      ...(currentProfile || {}),
      ...updates,
      lastUpdated: new Date().toISOString(),
    };

    await db.saveUserProfile(userId, updatedProfile);

    return NextResponse.json({
      success: true,
      data: updatedProfile,
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update user profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'anonymous';
    const profileData = await request.json();

    // Validate required fields
    if (!profileData.basicInfo) {
      return NextResponse.json(
        { success: false, error: 'Basic info is required' },
        { status: 400 }
      );
    }

    await db.saveUserProfile(userId, profileData);

    return NextResponse.json({
      success: true,
      data: profileData,
    });
  } catch (error) {
    console.error('Error saving user profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save user profile' },
      { status: 500 }
    );
  }
}