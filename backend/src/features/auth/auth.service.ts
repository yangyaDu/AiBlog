import { db } from "../../db";
import { users } from "../../db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { ErrorCode } from "../../utils/types";
import { RegisterDTO, LoginDTO, AuthResponse } from "./auth.model";

declare const Bun: any;

export const AuthService = {
  async register(data: RegisterDTO): Promise<[ErrorCode, string | null]> {
    const existing = await db.select().from(users).where(eq(users.username, data.username)).get();
    if (existing) {
      return [ErrorCode.USER_EXISTS, null];
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
    const user = await db.select().from(users).where(eq(users.username, data.username)).get();

    if (!user || !(await Bun.password.verify(data.password, user.passwordHash))) {
      return [ErrorCode.INVALID_CREDENTIALS, null];
    }

    return [ErrorCode.SUCCESS, { id: user.id, username: user.username }];
  }
};