import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get user profile by Clerk ID
export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
  },
});

// Create or update user profile
export const upsertUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    subscriptionTier: v.string(),
    subscriptionStatus: v.string(),
    currentPeriodStart: v.number(),
    currentPeriodEnd: v.number(),
    trialEnd: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existingUser) {
      // Update existing user
      return await ctx.db.patch(existingUser._id, {
        ...args,
        updatedAt: Date.now(),
      });
    } else {
      // Create new user
      return await ctx.db.insert("users", {
        ...args,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
});

// Update user subscription
export const updateUserSubscription = mutation({
  args: {
    userId: v.id("users"),
    subscriptionTier: v.string(),
    subscriptionStatus: v.string(),
    currentPeriodStart: v.number(),
    currentPeriodEnd: v.number(),
    trialEnd: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.userId, {
      ...args,
      updatedAt: Date.now(),
    });
  },
});

// Get user usage metrics
export const getUserUsage = query({
  args: { userId: v.id("users"), period: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("userUsage")
      .withIndex("by_user_period", (q) => 
        q.eq("userId", args.userId).eq("period", args.period)
      )
      .first();
  },
});

// Update user usage metrics
export const updateUserUsage = mutation({
  args: {
    userId: v.id("users"),
    period: v.string(),
    metrics: v.record(v.string(), v.number()),
    limits: v.record(v.string(), v.number()),
  },
  handler: async (ctx, args) => {
    const existingUsage = await ctx.db
      .query("userUsage")
      .withIndex("by_user_period", (q) => 
        q.eq("userId", args.userId).eq("period", args.period)
      )
      .first();

    if (existingUsage) {
      return await ctx.db.patch(existingUsage._id, {
        ...args,
        trackedAt: Date.now(),
      });
    } else {
      return await ctx.db.insert("userUsage", {
        ...args,
        trackedAt: Date.now(),
      });
    }
  },
});

// Check if user has access to a feature
export const checkFeatureAccess = query({
  args: { userId: v.id("users"), feature: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return false;

    // Import subscription features from our library
    const { getSubscriptionPlan } = require("../src/lib/subscription");
    const plan = getSubscriptionPlan(user.subscriptionTier);
    
    if (!plan) return false;
    
    return plan.features[args.feature] === true;
  },
});