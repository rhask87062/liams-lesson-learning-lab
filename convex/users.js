import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Simple password hashing using Web Crypto API
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// Compare password with hash
async function verifyPassword(password, hash) {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

// Create parent account
export const createParent = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if parent already exists
    const existingParent = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .filter((q) => q.eq(q.field("role"), "parent"))
      .first();

    if (existingParent) {
      throw new Error("Parent account already exists with this email");
    }

    // Hash password
    const hashedPassword = await hashPassword(args.password);

    // Create parent user
    const parentId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      password: hashedPassword,
      role: "parent",
      createdAt: Date.now(),
    });

    return { id: parentId };
  },
});

// Authenticate user
export const authenticate = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isValid = await verifyPassword(args.password, user.password);
    if (!isValid) {
      throw new Error("Invalid credentials");
    }

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  },
});

// Create therapist account (requires parent authentication)
export const createTherapist = mutation({
  args: {
    parentEmail: v.string(),
    parentPassword: v.string(),
    therapistName: v.string(),
    therapistEmail: v.string(),
    therapistPassword: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify parent credentials
    const parent = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.parentEmail))
      .filter((q) => q.eq(q.field("role"), "parent"))
      .first();

    if (!parent) {
      throw new Error("Parent account not found");
    }

    const isValidParent = await verifyPassword(args.parentPassword, parent.password);
    if (!isValidParent) {
      throw new Error("Invalid parent credentials");
    }

    // Check if therapist already exists
    const existingTherapist = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.therapistEmail))
      .first();

    if (existingTherapist) {
      throw new Error("User already exists with this email");
    }

    // Hash therapist password
    const hashedPassword = await hashPassword(args.therapistPassword);

    // Create therapist user
    const therapistId = await ctx.db.insert("users", {
      name: args.therapistName,
      email: args.therapistEmail,
      password: hashedPassword,
      role: "therapist",
      createdAt: Date.now(),
      createdBy: parent._id,
    });

    return { id: therapistId };
  },
});

// Get all therapists
export const getTherapists = query({
  handler: async (ctx) => {
    const therapists = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "therapist"))
      .collect();

    return therapists.map(({ password, ...therapist }) => therapist);
  },
});

// Delete therapist (requires parent authentication)
export const deleteTherapist = mutation({
  args: {
    parentEmail: v.string(),
    parentPassword: v.string(),
    therapistId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Verify parent credentials
    const parent = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.parentEmail))
      .filter((q) => q.eq(q.field("role"), "parent"))
      .first();

    if (!parent) {
      throw new Error("Parent account not found");
    }

    const isValidParent = await verifyPassword(args.parentPassword, parent.password);
    if (!isValidParent) {
      throw new Error("Invalid parent credentials");
    }

    // Verify therapist exists and is a therapist
    const therapist = await ctx.db.get(args.therapistId);
    if (!therapist || therapist.role !== "therapist") {
      throw new Error("Therapist not found");
    }

    // Delete therapist
    await ctx.db.delete(args.therapistId);

    return { success: true };
  },
});

// Check if any users exist
export const hasUsers = query({
  handler: async (ctx) => {
    const users = await ctx.db
      .query("users")
      .take(1);
    return users.length > 0;
  },
}); 