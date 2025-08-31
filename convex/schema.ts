import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // User profiles
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    subscriptionTier: v.string(),
    subscriptionStatus: v.string(),
    currentPeriodStart: v.number(),
    currentPeriodEnd: v.number(),
    trialEnd: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),

  // Pollution data
  pollutionData: defineTable({
    location: v.object({
      latitude: v.float64(),
      longitude: v.float64(),
      address: v.optional(v.string()),
    }),
    aqi: v.float64(),
    pm25: v.optional(v.float64()),
    pm10: v.optional(v.float64()),
    o3: v.optional(v.float64()),
    no2: v.optional(v.float64()),
    so2: v.optional(v.float64()),
    co: v.optional(v.float64()),
    timestamp: v.number(),
    source: v.string(),
    userId: v.id("users"),
  })
    .index("by_user_timestamp", ["userId", "timestamp"])
    .index("by_location_timestamp", ["location", "timestamp"]),

  // Alerts
  alerts: defineTable({
    userId: v.id("users"),
    type: v.string(),
    severity: v.string(),
    title: v.string(),
    message: v.string(),
    location: v.object({
      latitude: v.float64(),
      longitude: v.float64(),
      address: v.optional(v.string()),
    }),
    timestamp: v.number(),
    acknowledged: v.boolean(),
    acknowledgedAt: v.optional(v.number()),
    metadata: v.optional(v.record(v.string(), v.any())),
  })
    .index("by_user_timestamp", ["userId", "timestamp"])
    .index("by_acknowledged", ["acknowledged"]),

  // Reports
  reports: defineTable({
    userId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    type: v.string(),
    data: v.any(),
    generatedAt: v.number(),
    sharedWith: v.array(v.id("users")),
    isPublic: v.boolean(),
  })
    .index("by_user_generated", ["userId", "generatedAt"]),

  // Community posts
  communityPosts: defineTable({
    userId: v.id("users"),
    title: v.string(),
    content: v.string(),
    images: v.array(v.string()),
    tags: v.array(v.string()),
    likes: v.number(),
    likedBy: v.array(v.id("users")),
    comments: v.number(),
    isPublic: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_created", ["userId", "createdAt"])
    .index("by_tags", ["tags"]),

  // Community comments
  communityComments: defineTable({
    postId: v.id("communityPosts"),
    userId: v.id("users"),
    content: v.string(),
    likes: v.number(),
    likedBy: v.array(v.id("users")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_post_created", ["postId", "createdAt"]),

  // User usage tracking
  userUsage: defineTable({
    userId: v.id("users"),
    period: v.string(), // daily, monthly, yearly
    metrics: v.record(v.string(), v.number()),
    limits: v.record(v.string(), v.number()),
    trackedAt: v.number(),
  })
    .index("by_user_period", ["userId", "period"]),

  // Subscriptions
  subscriptions: defineTable({
    userId: v.id("users"),
    planId: v.string(),
    status: v.string(),
    currentPeriodStart: v.number(),
    currentPeriodEnd: v.number(),
    cancelAtPeriodEnd: v.boolean(),
    trialEnd: v.optional(v.number()),
    metadata: v.optional(v.record(v.string(), v.any())),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_status", ["userId", "status"]),

  // Invoices
  invoices: defineTable({
    userId: v.id("users"),
    subscriptionId: v.id("subscriptions"),
    number: v.string(),
    status: v.string(),
    amountDue: v.number(),
    amountPaid: v.number(),
    amountRemaining: v.number(),
    currency: v.string(),
    date: v.number(),
    periodStart: v.number(),
    periodEnd: v.number(),
    lines: v.array(v.any()),
    metadata: v.optional(v.record(v.string(), v.any())),
  })
    .index("by_user_date", ["userId", "date"]),
});