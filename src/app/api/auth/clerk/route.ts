import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const headersList = headers();
    const authorization = (await headersList).get("authorization");
    
    if (!authorization || !authorization.startsWith("Bearer ")) {
      console.error("Missing or invalid authorization header");
      return NextResponse.json(
        { error: "Missing or invalid authorization header" },
        { status: 401 }
      );
    }

    const token = authorization.split("Bearer ")[1];
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Basic validation for userId format (adjust regex based on Clerk's ID format)
    if (!/^user_[a-zA-Z0-9]+$/.test(userId)) {
      return NextResponse.json(
        { error: "Invalid user ID format" },
        { status: 400 }
      );
    }

    // Fetch user info from Clerk
    const clerkApiUrl = process.env.CLERK_API_URL || "https://api.clerk.dev";
    const clerkResponse = await fetch(`${clerkApiUrl}/v1/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!clerkResponse.ok) {
      const errorData = await clerkResponse.json();
      return NextResponse.json(
        { error: "Failed to fetch user from Clerk", details: errorData },
        { status: 400 }
      );
    }

    const clerkUser = await clerkResponse.json();

    // Return user data for Convex to process
    return NextResponse.json({
      clerkId: userId,
      email: clerkUser.email_addresses?.[0]?.email_address || "",
      name: `${clerkUser.first_name || ""} ${clerkUser.last_name || ""}`.trim() || clerkUser.username || "",
      imageUrl: clerkUser.image_url,
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