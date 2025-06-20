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
  }),
}); 