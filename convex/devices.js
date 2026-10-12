import { ConvexError, v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { requireUser, sha256Hex, userWithRole } from "./users";

export async function deviceForToken(ctx, deviceToken) {
  if (!deviceToken) return null;
  const tokenHash = await sha256Hex(deviceToken);
  return await ctx.db
    .query("devices")
    .withIndex("by_tokenHash", (q) => q.eq("tokenHash", tokenHash))
    .first();
}

export async function requireDevice(ctx, deviceToken) {
  const device = await deviceForToken(ctx, deviceToken);
  if (!device) throw new ConvexError("This device isn't approved.");
  return device;
}

export const status = query({
  args: { deviceToken: v.string() },
  handler: async (ctx, { deviceToken }) => {
    const device = await deviceForToken(ctx, deviceToken);
    return device ? { approved: true, name: device.name } : { approved: false };
  },
});

export const checkIn = mutation({
  args: { deviceToken: v.string() },
  handler: async (ctx, { deviceToken }) => {
    const device = await deviceForToken(ctx, deviceToken);
    if (device) await ctx.db.patch(device._id, { lastSeenAt: Date.now() });
  },
});

export const insertApprovedDevice = internalMutation({
  args: { sessionToken: v.string(), name: v.string(), tokenHash: v.string() },
  handler: async (ctx, { sessionToken, name, tokenHash }) => {
    const parent = await requireUser(ctx, sessionToken, "parent");
    const now = Date.now();
    await ctx.db.insert("devices", {
      name: name.trim() || "Liam's device",
      tokenHash,
      approvedBy: parent._id,
      approvedAt: now,
      lastSeenAt: now,
    });
  },
});

export const list = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    if (!(await userWithRole(ctx, token, "parent"))) return null;
    const devices = await ctx.db.query("devices").collect();
    return devices
      .map((d) => ({ id: d._id, name: d.name, approvedAt: d.approvedAt, lastSeenAt: d.lastSeenAt ?? null }))
      .sort((a, b) => a.approvedAt - b.approvedAt);
  },
});

export const revoke = mutation({
  args: { token: v.string(), deviceId: v.id("devices") },
  handler: async (ctx, { token, deviceId }) => {
    await requireUser(ctx, token, "parent");
    if (await ctx.db.get(deviceId)) await ctx.db.delete(deviceId);
  },
});
