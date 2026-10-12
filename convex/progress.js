import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireDevice } from "./devices";
import { userWithRole } from "./users";

const MODES = ["learn", "copy", "fillBlanks", "test", "matching", "letterLearner"];

// isCorrect omitted = an unscored view (Learn Mode, Letter Learner); it never affects accuracy.
export const record = mutation({
  args: {
    deviceToken: v.string(),
    sessionKey: v.string(),
    mode: v.string(),
    word: v.string(),
    isCorrect: v.optional(v.boolean()),
  },
  handler: async (ctx, { deviceToken, sessionKey, mode, word, isCorrect }) => {
    const device = await requireDevice(ctx, deviceToken);
    if (!MODES.includes(mode)) throw new ConvexError(`Unknown mode: ${mode}`);
    const label = word.trim().slice(0, 100);
    if (!label) return;
    const scored = isCorrect !== undefined;
    const now = Date.now();

    const session = await ctx.db
      .query("progressSessions")
      .withIndex("by_sessionKey", (q) => q.eq("sessionKey", sessionKey))
      .first();

    if (!session) {
      await ctx.db.insert("progressSessions", {
        deviceId: device._id,
        sessionKey,
        mode,
        startTime: now,
        lastActivityAt: now,
        wordsAttempted: scored ? 1 : 0,
        wordsCorrect: isCorrect ? 1 : 0,
        views: scored ? 0 : 1,
        words: [{ word: label, attempts: scored ? 1 : 0, correct: isCorrect ? 1 : 0, views: scored ? 0 : 1 }],
      });
      return;
    }
    if (session.deviceId !== device._id) throw new ConvexError("Session belongs to another device.");

    const words = session.words.map((w) => ({ ...w }));
    let entry = words.find((w) => w.word === label);
    if (!entry) {
      entry = { word: label, attempts: 0, correct: 0, views: 0 };
      words.push(entry);
    }
    if (scored) {
      entry.attempts += 1;
      if (isCorrect) entry.correct += 1;
    } else {
      entry.views += 1;
    }
    await ctx.db.patch(session._id, {
      lastActivityAt: now,
      wordsAttempted: session.wordsAttempted + (scored ? 1 : 0),
      wordsCorrect: session.wordsCorrect + (isCorrect ? 1 : 0),
      views: session.views + (scored ? 0 : 1),
      words,
    });
  },
});

export const sessions = query({
  args: { token: v.string(), from: v.number(), to: v.number() },
  handler: async (ctx, { token, from, to }) => {
    if (!(await userWithRole(ctx, token))) return null;
    const rows = await ctx.db
      .query("progressSessions")
      .withIndex("by_startTime", (q) => q.gte("startTime", from).lte("startTime", to))
      .collect();
    const deviceNames = new Map();
    for (const row of rows) {
      if (!deviceNames.has(row.deviceId)) {
        const device = await ctx.db.get(row.deviceId);
        deviceNames.set(row.deviceId, device?.name ?? "Removed device");
      }
    }
    return rows.map((s) => ({
      mode: s.mode,
      device: deviceNames.get(s.deviceId),
      startTime: s.startTime,
      endTime: s.lastActivityAt,
      duration: s.lastActivityAt - s.startTime,
      wordsAttempted: s.wordsAttempted,
      wordsCorrect: s.wordsCorrect,
      views: s.views,
      words: s.words,
    }));
  },
});
