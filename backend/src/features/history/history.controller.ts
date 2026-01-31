
import { Elysia } from "elysia";
import { Result } from "../../utils/response";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { BizError, ErrorCode } from "../../utils/types";
import { db } from "../../db";
import { postViews, posts } from "../../db/schema";
import { eq, desc, and } from "drizzle-orm";
import { randomUUID } from "crypto";

export const HistoryController = new Elysia({ prefix: "/api/history" })
  .use(authMiddleware)
  .post("/view/:postId", async ({ params, user }: any) => {
     if (!user) return Result.success(null); // Anonymous views not tracked in history
     
     // Update if exists, or insert
     const existing = await db.select().from(postViews)
        .where(and(eq(postViews.userId, user.id), eq(postViews.postId, params.postId)))
        .get();

     if (existing) {
         await db.update(postViews)
            .set({ viewedAt: new Date() })
            .where(eq(postViews.id, existing.id));
     } else {
         await db.insert(postViews).values({
             id: randomUUID(),
             userId: user.id,
             postId: params.postId
         });
     }
     return Result.success(null);
  })
  .get("/mine", async ({ user, query }: any) => {
      if (!user) throw new BizError(ErrorCode.UNAUTHORIZED, "Login required", 401);
      const page = Number(query.page) || 1;
      const limit = Number(query.limit) || 10;
      const offset = (page - 1) * limit;

      const history = await db.select({
          postId: postViews.postId,
          viewedAt: postViews.viewedAt,
          postTitle: posts.title,
          postExcerpt: posts.excerpt
      })
      .from(postViews)
      .leftJoin(posts, eq(postViews.postId, posts.id))
      .where(eq(postViews.userId, user.id))
      .orderBy(desc(postViews.viewedAt))
      .limit(limit)
      .offset(offset);

      return Result.success(history);
  });
