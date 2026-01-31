
import { db } from "../../db";
import { postViews, posts } from "../../db/schema";
import { eq, desc, and } from "drizzle-orm";
import { randomUUID } from "crypto";
import { ErrorCode, ServiceContext } from "../../utils/types";

export interface GetHistoryOptions {
  page: number;
  limit: number;
}

export const HistoryService = {
  async recordView(ctx: ServiceContext, options: { postId: string }): Promise<[ErrorCode, null]> {
    const { postId } = options;
    const userId = ctx.session.id;
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

  async getMyHistory(ctx: ServiceContext, options: GetHistoryOptions): Promise<[ErrorCode, any]> {
    const { page, limit } = options;
    const offset = (page - 1) * limit;
    
    const history = await db.select({
        postId: postViews.postId,
        viewedAt: postViews.viewedAt,
        postTitle: posts.title,
        postExcerpt: posts.excerpt
    })
    .from(postViews)
    .leftJoin(posts, eq(postViews.postId, posts.id))
    .where(eq(postViews.userId, ctx.session.id))
    .orderBy(desc(postViews.viewedAt))
    .limit(limit)
    .offset(offset);

    return [ErrorCode.SUCCESS, history];
  }
};
