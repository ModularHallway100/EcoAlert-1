import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { clerkClient } from "@clerk/nextjs/server";

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
  let userData: SyncUserData;
  try {
    userData = await request.json();
  } catch (parseError) {
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    );
  }

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

    // Validate the token (replace with your actual token validation logic)
    if (!token || token.trim() === '') {
      return NextResponse.json(
        { error: "Invalid or empty token" },
        { status: 401 }
      );
    }

    // TODO: Add proper token verification here
    // Example: verify JWT signature, check expiration, etc.

    // Validate required fields
    if (!userData.clerkId) {
      return NextResponse.json(
        { error: "Clerk ID is required" },
        { status: 400 }
      );
    }

    // Get user info from Clerk using server-side integration
    let clerkUser;
    try {
      const clerkClientInstance = await clerkClient();
      clerkUser = await clerkClientInstance.users.getUser(userData.clerkId);
    } catch (clerkError) {
      console.error("Error fetching user from Clerk:", clerkError);
      return NextResponse.json(
        { error: "Failed to fetch user data from Clerk" },
        { status: 404 }
      );
    }

    // Extract user data from Clerk response
    const userEmail = clerkUser.emailAddresses?.[0]?.emailAddress || "";
    const userName = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || clerkUser.username || "";
    const userImageUrl = clerkUser.imageUrl || "";

    // Handle edge case for single-word names
    const firstName = userName.split(" ")[0] || "";
    const lastName = userName.split(" ").slice(1).join(" ") || "";

    // Here you would typically call your Convex backend
    // For now, we'll return a success response
    // In a real implementation, this would call your Convex mutation with the user data
    
    console.log("Syncing user data to Convex for clerkId:", userData.clerkId);
    console.log("User data from Clerk:", {
      clerkId: userData.clerkId,
      email: userEmail,
      name: userName,
      imageUrl: userImageUrl,
      subscriptionTier: "free",
      subscriptionStatus: "active",
      currentPeriodStart: Date.now(),
      currentPeriodEnd: Date.now() + (30 * 24 * 60 * 60 * 1000),
      trialEnd: Date.now() + (14 * 24 * 60 * 60 * 1000),
    });

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