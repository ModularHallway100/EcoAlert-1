import { headers } from "next/headers";
import { NextResponse } from "next/server";

const clerkWebhookSecret = process.env.CLERK_WEBHOOK_SECRET;

interface UserCreatedEvent {
  data: {
    id: string;
    first_name: string;
    last_name: string;
    email_addresses: Array<{
      email_address: string;
      id: string;
    }>;
    image_url?: string;
    primary_email_address_id: string;
  };
  object: "user";
  type: "user.created";
}

interface UserUpdatedEvent {
  data: {
    id: string;
    first_name: string;
    last_name: string;
    email_addresses: Array<{
      email_address: string;
      id: string;
    }>;
    image_url?: string;
    primary_email_address_id: string;
  };
  object: "user";
  type: "user.updated";
}

interface UserDeletedEvent {
  data: {
    id: string;
  };
  object: "user";
  type: "user.deleted";
}

export async function POST(request: Request) {
  try {
    // Verify webhook signature
    const headerPayload = await headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature || !clerkWebhookSecret) {
      return new Response("Error: Missing Svix headers or webhook secret", { status: 400 });
    }

    const payload = await request.json();

    // For now, we'll just log the event and process it
    // In a production environment, you would properly verify the signature
    console.log("Webhook received:", payload);

    const evt = payload as UserCreatedEvent | UserUpdatedEvent | UserDeletedEvent;

    console.log("Webhook event received:", evt.type);

    // Handle different event types
    if (evt.type === "user.created" || evt.type === "user.updated") {
      const user = evt.data;
      const primaryEmail = user.email_addresses.find(
        (email) => email.id === user.primary_email_address_id
      )?.email_address || "";

      const userData = {
        clerkId: user.id,
        email: primaryEmail,
        name: `${user.first_name || ""} ${user.last_name || ""}`.trim() || "",
        imageUrl: user.image_url,
        subscriptionTier: "free", // Default tier
        subscriptionStatus: "active",
        currentPeriodStart: Date.now(),
        currentPeriodEnd: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days from now
        trialEnd: Date.now() + (14 * 24 * 60 * 60 * 1000), // 14 days trial
        updatedAt: Date.now(),
      };

      // Here you would typically call your Convex backend to upsert the user
      // For now, we'll just log the data
      console.log("User data to sync:", userData);

      // In a real implementation, you would call your Convex mutation here:
      // await ctx.db.insert("users", userData);
      // or
      // await ctx.db.patch(existingUser._id, userData);

      return NextResponse.json({ success: true, message: "User synced successfully" });

    } else if (evt.type === "user.deleted") {
      const userId = evt.data.id;

      // Here you would typically mark the user as deleted in your Convex backend
      // For now, we'll just log the deletion
      console.log("User to delete:", userId);

      // In a real implementation, you would call your Convex mutation here:
      // await ctx.db.patch(userId, { deleted: true, deletedAt: Date.now() });

      return NextResponse.json({ success: true, message: "User deletion processed" });

    } else {
      return NextResponse.json({ success: false, message: "Unhandled event type" }, { status: 400 });
    }

  } catch (error) {
    console.error("Webhook error:", error);
    return new Response("Webhook Error", { status: 400 });
  }
}