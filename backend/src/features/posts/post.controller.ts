
import { Elysia, t } from "elysia";
import { PostService } from "./post.service";
import { CreatePostSchema, CreatePostDTO, PostListResponseSchema, PostItemSchema } from "./post.model";
import { AddCommentSchema, InteractionsResponseSchema } from "./comments.model";
import { Result, createResponseSchema } from "../../utils/response";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { ErrorCode, getErrorInfo } from "../../utils/types";
import { db } from "../../db";
import { postLikes, postComments, users } from "../../db/schema";
import { eq, and, isNull, desc } from "drizzle-orm";
import { randomUUID } from "crypto";

export const PostController = new Elysia({ prefix: "/api/posts" })
  .use(authMiddleware)
  
  // --- Standard CRUD ---
  .get("/", async ({ query, set }) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 5;
    const [err, data] = await PostService.getAll(page, limit, query.tag);
    if (err !== ErrorCode.SUCCESS) {
      const errorInfo = getErrorInfo(err);
      set.status = errorInfo.status;
      return Result.error(err, errorInfo.message, null);
    }
    return Result.success(data);
  }, { response: { 200: createResponseSchema(PostListResponseSchema) } })

  .post("/", async ({ body, user, set }: any) => {
    if (!user) {
      const errorInfo = getErrorInfo(ErrorCode.UNAUTHORIZED);
      set.status = errorInfo.status;
      return Result.error(ErrorCode.UNAUTHORIZED, errorInfo.message, null);
    }
    // @ts-ignore
    const [err, newPost] = await PostService.create(user.id, body);
    if (err !== ErrorCode.SUCCESS) {
      const errorInfo = getErrorInfo(err);
      set.status = errorInfo.status;
      return Result.error(err, errorInfo.message, null);
    }
    return Result.success(newPost, "Article created");
  }, { body: CreatePostSchema, response: { 200: createResponseSchema(PostItemSchema) } })

  .delete("/:id", async ({ params, user, set }: any) => {
    if (!user) {
      const errorInfo = getErrorInfo(ErrorCode.UNAUTHORIZED);
      set.status = errorInfo.status;
      return Result.error(ErrorCode.UNAUTHORIZED, errorInfo.message, null);
    }
    // @ts-ignore
    const [err] = await PostService.delete(user.id, params.id);
    if (err !== ErrorCode.SUCCESS) {
      const errorInfo = getErrorInfo(err);
      set.status = errorInfo.status;
      return Result.error(err, errorInfo.message, null);
    }
    return Result.success(null, "Article deleted");
  }, { response: { 200: createResponseSchema(t.Null()) } })


  // --- Interactions: Get Info (Likes count, Comments) ---
  .get("/:id/interactions", async ({ params, user }: any) => {
    const postId = params.id;
    const userId = user?.id;

    // 1. Get Likes
    const likesCount = (await db.select().from(postLikes).where(and(eq(postLikes.postId, postId), isNull(postLikes.deletedAt))).all()).length;
    let userLiked = false;
    if (userId) {
       const like = await db.select().from(postLikes).where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId), isNull(postLikes.deletedAt))).get();
       userLiked = !!like;
    }

    // 2. Get Comments (Flat list, frontend builds tree)
    const comments = await db.select({
        id: postComments.id,
        postId: postComments.postId,
        parentId: postComments.parentId,
        userId: postComments.userId,
        username: users.username,
        content: postComments.content,
        createdAt: postComments.createdAt
    })
    .from(postComments)
    .leftJoin(users, eq(postComments.userId, users.id))
    .where(and(eq(postComments.postId, postId), isNull(postComments.deletedAt)))
    .orderBy(desc(postComments.createdAt));

    return Result.success({ likes: likesCount, userLiked, comments });
  }, { response: { 200: createResponseSchema(InteractionsResponseSchema) } })


  // --- Interactions: Toggle Like ---
  .post("/:id/like", async ({ params, user, set }: any) => {
    if (!user) {
      const errorInfo = getErrorInfo(ErrorCode.UNAUTHORIZED);
      set.status = errorInfo.status;
      return Result.error(ErrorCode.UNAUTHORIZED, errorInfo.message, null);
    }
    const postId = params.id;
    const userId = user.id;

    const existing = await db.select().from(postLikes).where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId))).get();

    if (existing) {
        if (existing.deletedAt) {
            // Restore
            await db.update(postLikes).set({ deletedAt: null }).where(eq(postLikes.id, existing.id));
            return Result.success({ status: 'liked' });
        } else {
            // Soft Delete
            await db.update(postLikes).set({ deletedAt: new Date() }).where(eq(postLikes.id, existing.id));
             return Result.success({ status: 'unliked' });
        }
    } else {
        // Create
        await db.insert(postLikes).values({ id: randomUUID(), postId, userId });
        return Result.success({ status: 'liked' });
    }
  })


  // --- Interactions: Add Comment ---
  .post("/:id/comments", async ({ params, body, user, set }: any) => {
    if (!user) {
      const errorInfo = getErrorInfo(ErrorCode.UNAUTHORIZED);
      set.status = errorInfo.status;
      return Result.error(ErrorCode.UNAUTHORIZED, errorInfo.message, null);
    }
    
    const newComment = {
        id: randomUUID(),
        postId: params.id,
        userId: user.id,
        content: body.content,
        parentId: body.parentId || null
    };

    await db.insert(postComments).values(newComment);
    return Result.success(newComment);
  }, { body: AddCommentSchema })


  // --- Interactions: Delete Comment ---
  .delete("/comments/:id", async ({ params, user, set }: any) => {
    if (!user) {
      const errorInfo = getErrorInfo(ErrorCode.UNAUTHORIZED);
      set.status = errorInfo.status;
      return Result.error(ErrorCode.UNAUTHORIZED, errorInfo.message, null);
    }
    
    const comment = await db.select().from(postComments).where(eq(postComments.id, params.id)).get();
    if (!comment) {
      const errorInfo = getErrorInfo(ErrorCode.NOT_FOUND);
      set.status = errorInfo.status;
      return Result.error(ErrorCode.NOT_FOUND, errorInfo.message, null);
    }
    
    if (comment.userId !== user.id) {
      const errorInfo = getErrorInfo(ErrorCode.FORBIDDEN);
      set.status = errorInfo.status;
      return Result.error(ErrorCode.FORBIDDEN, errorInfo.message, null);
    }

    await db.update(postComments).set({ deletedAt: new Date() }).where(eq(postComments.id, params.id));
    return Result.success(null, "Comment deleted");
  });
