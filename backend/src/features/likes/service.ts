
import { db } from "../../db";
import { postLikes } from "../../db/schema";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";
import { ErrorCode, ServiceContext } from "../../utils/types";
import { EventBus } from "../../utils/event-bus";

export const LikeService = {
  async toggle(ctx: ServiceContext, options: { postId: string }): Promise<[ErrorCode, { status: 'liked' | 'unliked' }]> {
    const { postId } = options;
    const userId = ctx.session.id;
    const existing = await db.select().from(postLikes)
        .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId))).get();

    if (existing) {
        if (existing.deletedAt) {
            // Restore
            await db.update(postLikes).set({ deletedAt: null }).where(eq(postLikes.id, existing.id));
            EventBus.emit('post.liked', { postId, userId });
            return [ErrorCode.SUCCESS, { status: 'liked' }];
        } else {
            // Soft Delete
            await db.update(postLikes).set({ deletedAt: new Date() }).where(eq(postLikes.id, existing.id));
            return [ErrorCode.SUCCESS, { status: 'unliked' }];
        }
    } else {
        // Create
        await db.insert(postLikes).values({ id: randomUUID(), postId, userId });
        EventBus.emit('post.liked', { postId, userId });
        return [ErrorCode.SUCCESS, { status: 'liked' }];
    }
  }
};
