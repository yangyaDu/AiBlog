
import { db } from "../../db";
import { users } from "../../db/schema";
import { eq } from "drizzle-orm";
import { randomUUID, createHash } from "crypto";
import { ErrorCode } from "../../utils/types";
import { RegisterDTO, LoginDTO, AuthResponse } from "./auth.model";

export const AuthService = {
  // Helper to hash password with MD5 (Legacy requirement)
  // WARNING: MD5 is not secure for production passwords.
  hashPassword(pwd: string): string {
    return createHash('md5').update(pwd).digest('hex');
  },

  async register(data: RegisterDTO): Promise<[ErrorCode, string | null]> {
    // 1. Check User Existence
    const existing = await db.select().from(users).where(eq(users.username, data.username)).get();
    if (existing) {
      return [ErrorCode.USER_EXISTS, "User with this email already exists"];
    }

    // 2. Hash Password (MD5)
    const hashedPassword = this.hashPassword(data.password);
    const userId = randomUUID();

    await db.insert(users).values({
      id: userId,
      username: data.username,
      passwordHash: hashedPassword,
    });

    return [ErrorCode.SUCCESS, userId];
  },

  async login(data: LoginDTO): Promise<[ErrorCode, Exclude<AuthResponse['user'], undefined> | null]> {
    const user = await db.select().from(users).where(eq(users.username, data.username)).get();

    // Verify using MD5
    if (!user || user.passwordHash !== this.hashPassword(data.password)) {
      return [ErrorCode.INVALID_CREDENTIALS, null];
    }

    return [ErrorCode.SUCCESS, { id: user.id, username: user.username }];
  }
};
