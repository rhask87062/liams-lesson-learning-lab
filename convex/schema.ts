import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    password: v.string(),
    role: v.union(v.literal("parent"), v.literal("therapist")),
    createdAt: v.number(),
    createdBy: v.optional(v.id("users")),
    failedLogins: v.optional(v.number()),
    lockedUntil: v.optional(v.number()),
  }).index("by_email", ["email"]),

  allowedEmails: defineTable({
    email: v.string(),
    addedBy: v.id("users"),
    addedAt: v.number(),
  }).index("by_email", ["email"]),

  authSessions: defineTable({
    userId: v.id("users"),
    tokenHash: v.string(),
    expiresAt: v.number(),
  })
    .index("by_tokenHash", ["tokenHash"])
    .index("by_userId", ["userId"]),

  devices: defineTable({
    name: v.string(),
    tokenHash: v.string(),
    approvedBy: v.id("users"),
    approvedAt: v.number(),
    lastSeenAt: v.optional(v.number()),
  }).index("by_tokenHash", ["tokenHash"]),

  progressSessions: defineTable({
    deviceId: v.id("devices"),
    sessionKey: v.string(),
    mode: v.string(),
    startTime: v.number(),
    lastActivityAt: v.number(),
    wordsAttempted: v.number(),
    wordsCorrect: v.number(),
    views: v.number(),
    words: v.array(
      v.object({ word: v.string(), attempts: v.number(), correct: v.number(), views: v.number() })
    ),
  })
    .index("by_sessionKey", ["sessionKey"])
    .index("by_startTime", ["startTime"]),

  passwordResets: defineTable({
    userId: v.id("users"),
    codeHash: v.string(),
    expiresAt: v.number(),
    attempts: v.number(),
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),
});
