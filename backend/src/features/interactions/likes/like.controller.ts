
import { Elysia } from "elysia";
import { Result } from "../../../utils/response";
import { authMiddleware } from "../../../middlewares/auth.middleware";
import { BizError, ErrorCode } from "../../../utils/types";
import { db } from "../../../db";
import { postLikes, posts } from "../../../db/schema";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";
import { NotificationService } from "../../notifications/notification.service";

export const LikeController = new Elysia({ prefix: "/api/likes" })
  .use(authMiddleware)
  .post("/post/:postId", async ({ params, user }: any) => {
    if (!user) throw new BizError(ErrorCode.UNAUTHORIZED, "Login required", 401);
    const postId = params.postId;
    const userId = user.id;

    // Check Post Owner for notification
    const post = await db.select().from(posts).where(eq(posts.id, postId)).get();
    if (!post) throw new BizError(ErrorCode.NOT_FOUND, "Post not found", 404);

    const existing = await db.select().from(postLikes).where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId))).get();

    if (existing) {
        if (existing.deletedAt) {
            // Restore (Like)
            await db.update(postLikes).set({ deletedAt: null }).where(eq(postLikes.id, existing.id));
            await NotificationService.notify(post.createdBy, userId, 'like', postId);
            return Result.success({ status: 'liked' });
        } else {
            // Soft Delete (Unlike)
            await db.update(postLikes).set({ deletedAt: new Date() }).where(eq(postLikes.id, existing.id));
             return Result.success({ status: 'unliked' });
        }
    } else {
        // Create (Like)
        await db.insert(postLikes).values({ id: randomUUID(), postId, userId });
        await NotificationService.notify(post.createdBy, userId, 'like', postId);
        return Result.success({ status: 'liked' });
    }
  });
