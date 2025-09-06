import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";

// Mock implementation - in a real app, this would call the Convex backend
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // For development, return mock data with Clerk user info
    return NextResponse.json({
      success: true,
      data: {
        id: userId,
        email: 'user@example.com', // In real app, get from Clerk
        name: 'John Doe', // In real app, get from Clerk
        subscriptionTier: 'pro',
        subscriptionStatus: 'active',
        basicInfo: {
          name: 'John Doe',
          location: { latitude: 40.7128, longitude: -74.0060 },
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        preferences: {
          units: 'metric',
          language: 'en',
          theme: 'auto',
          notificationLevel: 'moderate',
          alertPriorities: ['air', 'general']
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const body = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // In a real implementation, this would update in Convex
    // await convex.mutation(upsertUser, { clerkId: userId, ...body });
    
    console.log('Updating user profile:', { userId, ...body });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}