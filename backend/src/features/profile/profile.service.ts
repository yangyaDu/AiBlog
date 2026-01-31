
import { db } from "../../db";
import { profile } from "../../db/schema";
import { eq } from "drizzle-orm";
import { UpdateProfileDTO } from "./profile.model";
import { ErrorCode, ServiceContext } from "../../utils/types";

export const ProfileService = {
  async getProfile(): Promise<[ErrorCode, any]> {
    const p = await db.select().from(profile).where(eq(profile.id, 1)).get();
    if (!p) {
      return [ErrorCode.SUCCESS, {
        role: "Developer",
        titlePrefix: "Building",
        titleHighlight: "Something",
        titleSuffix: "Cool",
        intro: "Welcome to my portfolio.",
      }];
    }
    return [ErrorCode.SUCCESS, p];
  },

  async updateProfile(_ctx: ServiceContext, data: UpdateProfileDTO): Promise<[ErrorCode, boolean]> {
    // Access session via ctx.session
    await db
      .insert(profile)
      .values({ id: 1, ...data })
      .onConflictDoUpdate({ target: profile.id, set: data });
    return [ErrorCode.SUCCESS, true];
  }
};
