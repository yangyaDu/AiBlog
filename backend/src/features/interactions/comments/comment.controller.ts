
import { Elysia, t } from "elysia";
import { Result } from "../../../utils/response";
import { authMiddleware } from "../../../middlewares/auth.middleware";
import { BizError, ErrorCode } from "../../../utils/types";
import { db } from "../../../db";
import { postComments, posts } from "../../../db/schema";
import { eq, and, isNull, desc } from "drizzle-orm";
import { randomUUID } from "crypto";
import { NotificationService } from "../../notifications/notification.service";

export const CommentController = new Elysia({ prefix: "/api/comments" })
  .use(authMiddleware)
  .post("/post/:postId", async ({ params, body, user }: any) => {
    if (!user) throw new BizError(ErrorCode.UNAUTHORIZED, "Login required", 401);
    
    const newComment = {
        id: randomUUID(),
        postId: params.postId,
        userId: user.id,
        content: body.content,
        parentId: body.parentId || null
    };

    await db.insert(postComments).values(newComment);

    // Notification Logic
    if (newComment.parentId) {
        // Reply: Notify parent comment author
        const parent = await db.select().from(postComments).where(eq(postComments.id, newComment.parentId)).get();
        if (parent) {
            await NotificationService.notify(parent.userId, user.id, 'comment', params.postId);
        }
    } else {
        // Top level: Notify post author
        const post = await db.select().from(posts).where(eq(posts.id, params.postId)).get();
        if (post) {
             await NotificationService.notify(post.createdBy, user.id, 'comment', params.postId);
        }
    }

    return Result.success(newComment);
  }, { body: t.Object({ content: t.String(), parentId: t.Optional(t.String()) }) })

  .delete("/:id", async ({ params, user }: any) => {
    if (!user) throw new BizError(ErrorCode.UNAUTHORIZED, "Login required", 401);
    
    const comment = await db.select().from(postComments).where(eq(postComments.id, params.id)).get();
    if (!comment) throw new BizError(ErrorCode.NOT_FOUND, "Comment not found", 404);
    
    if (comment.userId !== user.id) throw new BizError(ErrorCode.FORBIDDEN, "Can only delete own comments", 403);

    await db.update(postComments).set({ deletedAt: new Date() }).where(eq(postComments.id, params.id));
    return Result.success(null, "Comment deleted");
  })
  
  // Get My Comments
  .get("/mine", async ({ user, query }: any) => {
      if (!user) throw new BizError(ErrorCode.UNAUTHORIZED, "Login required", 401);
      const page = Number(query.page) || 1;
      const limit = Number(query.limit) || 10;
      const offset = (page - 1) * limit;

      const myComments = await db.select()
        .from(postComments)
        .where(and(eq(postComments.userId, user.id), isNull(postComments.deletedAt)))
        .orderBy(desc(postComments.createdAt))
        .limit(limit)
        .offset(offset);

      return Result.success(myComments);
  });
