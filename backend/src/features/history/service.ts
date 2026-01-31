
import { db } from "../../db";
import { postViews, posts } from "../../db/schema";
import { eq, desc, and } from "drizzle-orm";
import { randomUUID } from "crypto";
import { ErrorCode } from "../../utils/types";

export const HistoryService = {
  async recordView(userId: string, postId: string): Promise<[ErrorCode, null]> {
    // Upsert logic: Update time if exists, else insert
    const existing = await db.select().from(postViews)
        .where(and(eq(postViews.userId, userId), eq(postViews.postId, postId)))
        .get();

    if (existing) {
        await db.update(postViews)
           .set({ viewedAt: new Date() })
           .where(eq(postViews.id, existing.id));
    } else {
        await db.insert(postViews).values({
            id: randomUUID(),
            userId: userId,
            postId: postId
        });
    }
    return [ErrorCode.SUCCESS, null];
  },

  async getMyHistory(userId: string, page: number = 1, limit: number = 10): Promise<[ErrorCode, any]> {
    const offset = (page - 1) * limit;
    
    const history = await db.select({
        postId: postViews.postId,
        viewedAt: postViews.viewedAt,
        postTitle: posts.title,
        postExcerpt: posts.excerpt
    })
    .from(postViews)
    .leftJoin(posts, eq(postViews.postId, posts.id))
    .where(eq(postViews.userId, userId))
    .orderBy(desc(postViews.viewedAt))
    .limit(limit)
    .offset(offset);

    return [ErrorCode.SUCCESS, history];
  }
};
