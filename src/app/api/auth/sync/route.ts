import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

interface SyncUserData {
  clerkId: string;
  email: string;
  name?: string;
  imageUrl?: string;
  subscriptionTier: string;
  subscriptionStatus: string;
  currentPeriodStart: number;
  currentPeriodEnd: number;
  trialEnd?: number;
}

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers();
    const authorization = headersList.get("authorization");
    
    if (!authorization || !authorization.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid authorization header" },
        { status: 401 }
      );
    }

    const token = authorization.split("Bearer ")[1];
    const userData: SyncUserData = await request.json();

    // Validate required fields
    if (!userData.clerkId || !userData.email) {
      return NextResponse.json(
        { error: "Clerk ID and email are required" },
        { status: 400 }
      );
    }

    // Here you would typically call your Convex backend
    // For now, we'll return a success response
    // In a real implementation, this would call your Convex mutation
    
    console.log("Syncing user data to Convex:", userData);

    // Mock response - replace with actual Convex call
    return NextResponse.json({
      success: true,
      message: "User data synchronized successfully",
      clerkId: userData.clerkId,
      timestamp: Date.now(),
    });

  } catch (error) {
    console.error("User sync API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}