
import { db } from "../../db";
import { follows, users } from "../../db/schema";
import { eq, and } from "drizzle-orm";
import { ErrorCode, SessionInfo } from "../../utils/types";
import { EventBus } from "../../utils/event-bus";

export const FollowService = {
  async follow(sessionInfo: SessionInfo, targetId: string): Promise<[ErrorCode, any]> {
    if (sessionInfo.id === targetId) return [ErrorCode.VALIDATION_ERROR, "Cannot follow self"];
    
    // Check exist
    const target = await db.select().from(users).where(eq(users.id, targetId)).get();
    if (!target) return [ErrorCode.NOT_FOUND, "User not found"];

    try {
        await db.insert(follows).values({ followerId: sessionInfo.id, followingId: targetId });
        EventBus.emit('user.followed', { followerId: sessionInfo.id, targetId });
    } catch { 
        // ignore duplicate
    }
    return [ErrorCode.SUCCESS, null];
  },

  async unfollow(sessionInfo: SessionInfo, targetId: string): Promise<[ErrorCode, any]> {
    await db.delete(follows).where(and(eq(follows.followerId, sessionInfo.id), eq(follows.followingId, targetId)));
    return [ErrorCode.SUCCESS, null];
  },

  async check(sessionInfo: SessionInfo, targetId: string): Promise<boolean> {
      const rel = await db.select().from(follows)
        .where(and(eq(follows.followerId, sessionInfo.id), eq(follows.followingId, targetId)))
        .get();
      return !!rel;
  }
};
