import { ConvexError, v } from "convex/values";
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";

export const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const RESET_TTL_MS = 15 * 60 * 1000;
const RESET_RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_RESET_ATTEMPTS = 5;
const MAX_FAILED_LOGINS = 10;
const LOCKOUT_MS = 15 * 60 * 1000;

export function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

export async function sha256Hex(text) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

function publicUser(user) {
  return { id: user._id, name: user.name, email: user.email, role: user.role };
}

async function findUserByEmail(ctx, rawEmail) {
  const email = normalizeEmail(rawEmail);
  const exact = await ctx.db
    .query("users")
    .withIndex("by_email", (q) => q.eq("email", email))
    .first();
  if (exact) return exact;
  // Accounts created before emails were normalized may be stored with different casing.
  const all = await ctx.db.query("users").collect();
  return all.find((u) => normalizeEmail(u.email) === email) ?? null;
}

async function userForToken(ctx, token) {
  if (!token) return null;
  const tokenHash = await sha256Hex(token);
  const session = await ctx.db
    .query("authSessions")
    .withIndex("by_tokenHash", (q) => q.eq("tokenHash", tokenHash))
    .first();
  if (!session || session.expiresAt < Date.now()) return null;
  return await ctx.db.get(session.userId);
}

// For live queries: return null instead of throwing, because a throwing query crashes the page
// when a session is revoked or expires while the dashboard is open.
export async function userWithRole(ctx, token, role) {
  const user = await userForToken(ctx, token);
  return user && (!role || user.role === role) ? user : null;
}

export async function requireUser(ctx, token, role) {
  const user = await userForToken(ctx, token);
  if (!user) throw new ConvexError("Your session has expired. Please sign in again.");
  if (role && user.role !== role) throw new ConvexError("Only the parent account can do that.");
  return user;
}

async function deleteSessionsFor(ctx, userId) {
  const sessions = await ctx.db
    .query("authSessions")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .collect();
  for (const s of sessions) await ctx.db.delete(s._id);
}

async function deleteResetsFor(ctx, userId) {
  const resets = await ctx.db
    .query("passwordResets")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .collect();
  for (const r of resets) await ctx.db.delete(r._id);
}

// ---- Internal helpers used by the actions in auth.js ----

export const getLoginRecord = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const user = await findUserByEmail(ctx, email);
    if (!user) return null;
    return {
      id: user._id,
      passwordHash: user.password,
      lockedUntil: user.lockedUntil ?? 0,
    };
  },
});

export const recordFailedLogin = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    if (!user) return;
    const failedLogins = (user.failedLogins ?? 0) + 1;
    if (failedLogins >= MAX_FAILED_LOGINS) {
      await ctx.db.patch(userId, { failedLogins: 0, lockedUntil: Date.now() + LOCKOUT_MS });
    } else {
      await ctx.db.patch(userId, { failedLogins });
    }
  },
});

export const completeLogin = internalMutation({
  args: {
    userId: v.id("users"),
    tokenHash: v.string(),
    upgradedPasswordHash: v.optional(v.string()),
  },
  handler: async (ctx, { userId, tokenHash, upgradedPasswordHash }) => {
    const user = await ctx.db.get(userId);
    if (!user) throw new ConvexError("Invalid email or password");
    const patch = {
      failedLogins: 0,
      lockedUntil: undefined,
      email: normalizeEmail(user.email),
    };
    if (upgradedPasswordHash) patch.password = upgradedPasswordHash;
    await ctx.db.patch(userId, patch);
    const expiresAt = Date.now() + SESSION_TTL_MS;
    await ctx.db.insert("authSessions", { userId, tokenHash, expiresAt });
    return { user: publicUser({ ...user, ...patch }), expiresAt };
  },
});

export const createAccount = internalMutation({
  args: {
    name: v.string(),
    email: v.string(),
    passwordHash: v.string(),
    role: v.union(v.literal("parent"), v.literal("therapist")),
    tokenHash: v.optional(v.string()),
  },
  handler: async (ctx, { name, email, passwordHash, role, tokenHash }) => {
    const normalized = normalizeEmail(email);
    if (await findUserByEmail(ctx, normalized)) {
      throw new ConvexError("An account with this email already exists. Try signing in or resetting your password.");
    }
    let createdBy;
    if (role === "therapist") {
      const allowed = await ctx.db
        .query("allowedEmails")
        .withIndex("by_email", (q) => q.eq("email", normalized))
        .first();
      if (!allowed) {
        throw new ConvexError("This email hasn't been approved yet. Ask the parent to add it in the dashboard.");
      }
      createdBy = allowed.addedBy;
    } else {
      const existingParent = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("role"), "parent"))
        .first();
      if (existingParent) throw new ConvexError("A parent account already exists.");
    }
    const userId = await ctx.db.insert("users", {
      name: name.trim(),
      email: normalized,
      password: passwordHash,
      role,
      createdAt: Date.now(),
      createdBy,
    });
    let expiresAt;
    if (tokenHash) {
      expiresAt = Date.now() + SESSION_TTL_MS;
      await ctx.db.insert("authSessions", { userId, tokenHash, expiresAt });
    }
    const user = await ctx.db.get(userId);
    return { user: publicUser(user), expiresAt };
  },
});

export const startPasswordReset = internalMutation({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const user = await findUserByEmail(ctx, email);
    if (!user) return null;
    const latest = await ctx.db
      .query("passwordResets")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .first();
    if (latest && Date.now() - latest.createdAt < RESET_RESEND_COOLDOWN_MS) return null;
    return { userId: user._id, email: user.email, name: user.name };
  },
});

export const saveResetCode = internalMutation({
  args: { userId: v.id("users"), codeHash: v.string() },
  handler: async (ctx, { userId, codeHash }) => {
    await deleteResetsFor(ctx, userId);
    const now = Date.now();
    return await ctx.db.insert("passwordResets", {
      userId,
      codeHash,
      attempts: 0,
      createdAt: now,
      expiresAt: now + RESET_TTL_MS,
    });
  },
});

export const discardResetCode = internalMutation({
  args: { resetId: v.id("passwordResets") },
  handler: async (ctx, { resetId }) => {
    if (await ctx.db.get(resetId)) await ctx.db.delete(resetId);
  },
});

export const getActiveReset = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const user = await findUserByEmail(ctx, email);
    if (!user) return null;
    const reset = await ctx.db
      .query("passwordResets")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .first();
    if (!reset || reset.expiresAt < Date.now() || reset.attempts >= MAX_RESET_ATTEMPTS) return null;
    return { resetId: reset._id, userId: user._id, codeHash: reset.codeHash };
  },
});

export const recordResetAttempt = internalMutation({
  args: { resetId: v.id("passwordResets") },
  handler: async (ctx, { resetId }) => {
    const reset = await ctx.db.get(resetId);
    if (reset) await ctx.db.patch(resetId, { attempts: reset.attempts + 1 });
  },
});

export const finishPasswordReset = internalMutation({
  args: { userId: v.id("users"), passwordHash: v.string() },
  handler: async (ctx, { userId, passwordHash }) => {
    await ctx.db.patch(userId, { password: passwordHash, failedLogins: 0, lockedUntil: undefined });
    await deleteResetsFor(ctx, userId);
    await deleteSessionsFor(ctx, userId);
  },
});

// ---- Public functions (token-checked) ----

export const currentUser = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const user = await userForToken(ctx, token);
    return user ? publicUser(user) : null;
  },
});

export const signOut = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const tokenHash = await sha256Hex(token);
    const session = await ctx.db
      .query("authSessions")
      .withIndex("by_tokenHash", (q) => q.eq("tokenHash", tokenHash))
      .first();
    if (session) await ctx.db.delete(session._id);
  },
});

export const extendSession = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    await requireUser(ctx, token);
    const tokenHash = await sha256Hex(token);
    const session = await ctx.db
      .query("authSessions")
      .withIndex("by_tokenHash", (q) => q.eq("tokenHash", tokenHash))
      .first();
    const expiresAt = Date.now() + SESSION_TTL_MS;
    await ctx.db.patch(session._id, { expiresAt });
    return { expiresAt };
  },
});

export const listAccess = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    if (!(await userWithRole(ctx, token, "parent"))) return null;
    const allowed = await ctx.db.query("allowedEmails").collect();
    const therapists = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "therapist"))
      .collect();
    const byEmail = new Map(therapists.map((t) => [normalizeEmail(t.email), t]));
    const rows = allowed.map((a) => {
      const account = byEmail.get(a.email);
      byEmail.delete(a.email);
      return { email: a.email, addedAt: a.addedAt, hasAccount: !!account, name: account?.name ?? null };
    });
    // Therapist accounts created before the allowlist existed still need to be visible and removable.
    for (const [email, t] of byEmail) {
      rows.push({ email, addedAt: t.createdAt, hasAccount: true, name: t.name, notOnList: true });
    }
    return rows.sort((a, b) => a.addedAt - b.addedAt);
  },
});

export const addAllowedEmail = mutation({
  args: { token: v.string(), email: v.string() },
  handler: async (ctx, { token, email }) => {
    const parent = await requireUser(ctx, token, "parent");
    const normalized = normalizeEmail(email);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      throw new ConvexError("That doesn't look like a valid email address.");
    }
    if (normalized === normalizeEmail(parent.email)) {
      throw new ConvexError("That's your own parent account email.");
    }
    const existing = await ctx.db
      .query("allowedEmails")
      .withIndex("by_email", (q) => q.eq("email", normalized))
      .first();
    if (existing) return;
    await ctx.db.insert("allowedEmails", { email: normalized, addedBy: parent._id, addedAt: Date.now() });
  },
});

export const removeAccess = mutation({
  args: { token: v.string(), email: v.string() },
  handler: async (ctx, { token, email }) => {
    await requireUser(ctx, token, "parent");
    const normalized = normalizeEmail(email);
    const entries = await ctx.db
      .query("allowedEmails")
      .withIndex("by_email", (q) => q.eq("email", normalized))
      .collect();
    for (const e of entries) await ctx.db.delete(e._id);
    const user = await findUserByEmail(ctx, normalized);
    if (user && user.role === "therapist") {
      await deleteSessionsFor(ctx, user._id);
      await deleteResetsFor(ctx, user._id);
      await ctx.db.delete(user._id);
    }
  },
});
