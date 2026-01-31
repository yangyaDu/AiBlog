
import { db } from "../../db";
import { follows, users } from "../../db/schema";
import { eq, and } from "drizzle-orm";
import { ErrorCode, ServiceContext } from "../../utils/types";
import { EventBus } from "../../utils/event-bus";

export const FollowService = {
  async follow(ctx: ServiceContext, options: { targetId: string }): Promise<[ErrorCode, any]> {
    const { targetId } = options;
    if (ctx.session.id === targetId) return [ErrorCode.VALIDATION_ERROR, "Cannot follow self"];
    
    // Check exist
    const target = await db.select().from(users).where(eq(users.id, targetId)).get();
    if (!target) return [ErrorCode.NOT_FOUND, "User not found"];

    try {
        await db.insert(follows).values({ followerId: ctx.session.id, followingId: targetId });
        EventBus.emit('user.followed', { followerId: ctx.session.id, targetId });
    } catch { 
        // ignore duplicate
    }
    return [ErrorCode.SUCCESS, null];
  },

  async unfollow(ctx: ServiceContext, options: { targetId: string }): Promise<[ErrorCode, any]> {
    const { targetId } = options;
    await db.delete(follows).where(and(eq(follows.followerId, ctx.session.id), eq(follows.followingId, targetId)));
    return [ErrorCode.SUCCESS, null];
  },

  async check(ctx: ServiceContext, options: { targetId: string }): Promise<boolean> {
      const { targetId } = options;
      const rel = await db.select().from(follows)
        .where(and(eq(follows.followerId, ctx.session.id), eq(follows.followingId, targetId)))
        .get();
      return !!rel;
  }
};
