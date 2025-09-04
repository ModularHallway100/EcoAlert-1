import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Basic sanity check; rely on verified token/Clerk for actual validation
    if (typeof userId !== "string" || !userId.startsWith("user_")) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const { userId: authedUserId } = auth();
    if (!authedUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); 
    } 
    if (authedUserId !== userId) {
      return NextResponse.json({ error: "User mismatch" }, { status: 403 });
    }

    // Fetch user info from Clerk
    const clerkUser = await clerkClient.users.getUser(userId);

    // Return user data for Convex to process
    return NextResponse.json({
      clerkId: userId,
      email: clerkUser.emailAddresses?.[0]?.emailAddress || "",
      name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || clerkUser.username || "",
      imageUrl: clerkUser.imageUrl,
      subscriptionTier: "free", // Default tier
      subscriptionStatus: "active",
      currentPeriodStart: Date.now(),
      currentPeriodEnd: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days from now
      trialEnd: Date.now() + (14 * 24 * 60 * 60 * 1000), // 14 days trial
    });

  } catch (error) {
    console.error("Auth API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}