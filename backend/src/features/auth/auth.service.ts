
import { db } from "../../db";
import { users } from "../../db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { ErrorCode } from "../../utils/types";
import { RegisterDTO, LoginDTO, AuthResponse } from "./auth.model";

declare const Bun: any;

export const AuthService = {
  // Simulating Cap.js validation since we can't install backend libs.
  // Frontend sends 'expectedCaptcha' (which is the answer base64 encoded or hashed)
  // Backend verifies input matches.
  validateCaptcha(input: string, expected: string): boolean {
    if (!input || !expected) return false;
    // In a real app, 'expected' is a session ID stored in Redis/DB.
    // Here, we trust the frontend sent a hash of the answer. 
    // To be safe in this demo: Input must match the decoded 'expected'.
    try {
        const decoded = atob(expected);
        return input.toLowerCase() === decoded.toLowerCase();
    } catch {
        return false;
    }
  },

  async register(data: RegisterDTO): Promise<[ErrorCode, string | null]> {
    // 1. Verify Captcha
    if (!this.validateCaptcha(data.captchaCode, data.expectedCaptcha)) {
        return [ErrorCode.VALIDATION_ERROR, "Invalid Captcha"];
    }

    // 2. Check User Existence
    const existing = await db.select().from(users).where(eq(users.username, data.username)).get();
    if (existing) {
      return [ErrorCode.USER_EXISTS, "Username already exists"];
    }

    const hashedPassword = await Bun.password.hash(data.password);
    const userId = randomUUID();

    await db.insert(users).values({
      id: userId,
      username: data.username,
      passwordHash: hashedPassword,
    });

    return [ErrorCode.SUCCESS, userId];
  },

  async login(data: LoginDTO): Promise<[ErrorCode, Exclude<AuthResponse['user'], undefined> | null]> {
    // 1. Verify Captcha
    if (!this.validateCaptcha(data.captchaCode, data.expectedCaptcha)) {
        return [ErrorCode.VALIDATION_ERROR, null];
    }

    const user = await db.select().from(users).where(eq(users.username, data.username)).get();

    if (!user || !(await Bun.password.verify(data.password, user.passwordHash))) {
      return [ErrorCode.INVALID_CREDENTIALS, null];
    }

    return [ErrorCode.SUCCESS, { id: user.id, username: user.username }];
  }
};
