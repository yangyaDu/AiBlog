
import { db } from "../../db";
import { follows, users } from "../../db/schema";
import { eq, and } from "drizzle-orm";
import { ErrorCode } from "../../utils/types";
import { EventBus } from "../../utils/event-bus";

export const FollowService = {
  async follow(followerId: string, targetId: string): Promise<[ErrorCode, any]> {
    if (followerId === targetId) return [ErrorCode.VALIDATION_ERROR, "Cannot follow self"];
    
    // Check exist
    const target = await db.select().from(users).where(eq(users.id, targetId)).get();
    if (!target) return [ErrorCode.NOT_FOUND, "User not found"];

    try {
        await db.insert(follows).values({ followerId, followingId: targetId });
        EventBus.emit('user.followed', { followerId, targetId });
    } catch { 
        // ignore duplicate
    }
    return [ErrorCode.SUCCESS, null];
  },

  async unfollow(followerId: string, targetId: string): Promise<[ErrorCode, any]> {
    await db.delete(follows).where(and(eq(follows.followerId, followerId), eq(follows.followingId, targetId)));
    return [ErrorCode.SUCCESS, null];
  },

  async check(followerId: string, targetId: string): Promise<boolean> {
      const rel = await db.select().from(follows)
        .where(and(eq(follows.followerId, followerId), eq(follows.followingId, targetId)))
        .get();
      return !!rel;
  }
};
