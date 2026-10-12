"use node";

import { createHash, randomBytes, randomInt, scrypt, timingSafeEqual } from "node:crypto";
import { Buffer } from "node:buffer";
import process from "node:process";
import { promisify } from "node:util";
import nodemailer from "nodemailer";
import { ConvexError, v } from "convex/values";
import { action, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

const scryptAsync = promisify(scrypt);
const SCRYPT = { N: 32768, r: 8, p: 1, keyLen: 64 };
const MIN_PASSWORD_LENGTH = 8;
const INVALID_LOGIN = "Invalid email or password";
const INVALID_CODE = "That code is invalid or has expired. Request a new one.";

const normalizeEmail = (email) => email.trim().toLowerCase();
const sha256Hex = (text) => createHash("sha256").update(text).digest("hex");

async function hashPassword(password) {
  const salt = randomBytes(16);
  const key = await scryptAsync(password, salt, SCRYPT.keyLen, {
    N: SCRYPT.N, r: SCRYPT.r, p: SCRYPT.p, maxmem: 64 * 1024 * 1024,
  });
  return `scrypt$${SCRYPT.N}$${SCRYPT.r}$${SCRYPT.p}$${salt.toString("base64")}$${key.toString("base64")}`;
}

// Returns { ok, needsUpgrade }. Legacy accounts stored an unsalted SHA-256 hex digest.
async function verifyPassword(password, stored) {
  if (stored.startsWith("scrypt$")) {
    const [, N, r, p, saltB64, keyB64] = stored.split("$");
    const expected = Buffer.from(keyB64, "base64");
    const actual = await scryptAsync(password, Buffer.from(saltB64, "base64"), expected.length, {
      N: Number(N), r: Number(r), p: Number(p), maxmem: 64 * 1024 * 1024,
    });
    return { ok: timingSafeEqual(actual, expected), needsUpgrade: false };
  }
  const ok = timingSafeEqual(Buffer.from(sha256Hex(password)), Buffer.from(stored.padEnd(64).slice(0, 64)));
  return { ok, needsUpgrade: ok };
}

function validatePassword(password) {
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new ConvexError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
  }
}

function newSessionToken() {
  const token = randomBytes(32).toString("hex");
  return { token, tokenHash: sha256Hex(token) };
}

export const signIn = action({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, { email, password }) => {
    const record = await ctx.runQuery(internal.users.getLoginRecord, { email: normalizeEmail(email) });
    if (!record) {
      await hashPassword(password); // keep response time similar for unknown emails
      throw new ConvexError(INVALID_LOGIN);
    }
    if (record.lockedUntil > Date.now()) {
      throw new ConvexError("Too many failed sign-in attempts. Try again in 15 minutes or reset your password.");
    }
    const { ok, needsUpgrade } = await verifyPassword(password, record.passwordHash);
    if (!ok) {
      await ctx.runMutation(internal.users.recordFailedLogin, { userId: record.id });
      throw new ConvexError(INVALID_LOGIN);
    }
    const { token, tokenHash } = newSessionToken();
    const { user, expiresAt } = await ctx.runMutation(internal.users.completeLogin, {
      userId: record.id,
      tokenHash,
      upgradedPasswordHash: needsUpgrade ? await hashPassword(password) : undefined,
    });
    return { token, expiresAt, user };
  },
});

export const signUp = action({
  args: { name: v.string(), email: v.string(), password: v.string() },
  handler: async (ctx, { name, email, password }) => {
    if (!name.trim()) throw new ConvexError("Please enter your name.");
    validatePassword(password);
    const { token, tokenHash } = newSessionToken();
    const { user, expiresAt } = await ctx.runMutation(internal.users.createAccount, {
      name,
      email: normalizeEmail(email),
      passwordHash: await hashPassword(password),
      role: "therapist",
      tokenHash,
    });
    return { token, expiresAt, user };
  },
});

export const requestPasswordReset = action({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const target = await ctx.runMutation(internal.users.startPasswordReset, { email: normalizeEmail(email) });
    // Same response whether or not the account exists, so this can't be used to discover emails.
    if (!target) return { sent: true };

    const { GMAIL_USER, GMAIL_APP_PASSWORD } = process.env;
    if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
      console.error("Password reset requested but GMAIL_USER / GMAIL_APP_PASSWORD are not set");
      throw new ConvexError("Password reset email isn't set up yet. Contact the parent account owner.");
    }

    const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
    const resetId = await ctx.runMutation(internal.users.saveResetCode, {
      userId: target.userId,
      codeHash: sha256Hex(`${target.userId}:${code}`),
    });

    try {
      const transport = nodemailer.createTransport({
        service: "gmail",
        auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
      });
      await transport.sendMail({
        from: `"Liam's Lesson Learning Lab" <${GMAIL_USER}>`,
        to: target.email,
        subject: "Your password reset code",
        text:
          `Hi ${target.name},\n\n` +
          `Your password reset code is: ${code}\n\n` +
          `It expires in 15 minutes. If you didn't ask to reset your password, you can ignore this email.\n`,
      });
    } catch (error) {
      console.error("Failed to send password reset email:", error);
      await ctx.runMutation(internal.users.discardResetCode, { resetId });
      throw new ConvexError("Couldn't send the reset email. Please try again in a few minutes.");
    }
    return { sent: true };
  },
});

export const resetPassword = action({
  args: { email: v.string(), code: v.string(), newPassword: v.string() },
  handler: async (ctx, { email, code, newPassword }) => {
    validatePassword(newPassword);
    const reset = await ctx.runQuery(internal.users.getActiveReset, { email: normalizeEmail(email) });
    if (!reset) throw new ConvexError(INVALID_CODE);
    const expected = Buffer.from(reset.codeHash);
    const actual = Buffer.from(sha256Hex(`${reset.userId}:${code.trim()}`));
    if (!timingSafeEqual(actual, expected)) {
      await ctx.runMutation(internal.users.recordResetAttempt, { resetId: reset.resetId });
      throw new ConvexError(INVALID_CODE);
    }
    await ctx.runMutation(internal.users.finishPasswordReset, {
      userId: reset.userId,
      passwordHash: await hashPassword(newPassword),
    });
    return { ok: true };
  },
});

export const approveDevice = action({
  args: { token: v.string(), name: v.string() },
  handler: async (ctx, { token, name }) => {
    const deviceToken = randomBytes(32).toString("hex");
    await ctx.runMutation(internal.devices.insertApprovedDevice, {
      sessionToken: token,
      name,
      tokenHash: sha256Hex(deviceToken),
    });
    return { deviceToken };
  },
});

// Admin-only bootstrap: run from the Convex dashboard (Functions) or `npx convex run auth:createParentAccount`.
export const createParentAccount = internalAction({
  args: { name: v.string(), email: v.string(), password: v.string() },
  handler: async (ctx, { name, email, password }) => {
    validatePassword(password);
    const { user } = await ctx.runMutation(internal.users.createAccount, {
      name,
      email: normalizeEmail(email),
      passwordHash: await hashPassword(password),
      role: "parent",
    });
    return user;
  },
});
