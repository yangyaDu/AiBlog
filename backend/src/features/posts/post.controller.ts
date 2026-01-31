
import { Elysia, t } from "elysia";
import { PostService } from "./post.service";
import { CreatePostSchema, CreatePostDTO, PostListResponseSchema, PostItemSchema } from "./post.model";
import { AddCommentSchema, InteractionsResponseSchema } from "./comments.model";
import { Result, createResponseSchema } from "../../utils/response";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { BizError, ErrorCode } from "../../utils/types";
import { db } from "../../db";
import { postLikes, postComments, users } from "../../db/schema";
import { eq, and, isNull, desc } from "drizzle-orm";
import { randomUUID } from "crypto";

export const PostController = new Elysia({ prefix: "/api/posts" })
  .use(authMiddleware)
  
  // --- Standard CRUD ---
  .get("/", async ({ query }) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 5;
    const [err, data] = await PostService.getAll(page, limit, query.tag);
    if (err !== ErrorCode.SUCCESS) throw new BizError(err, "Failed to fetch articles");
    return Result.success(data);
  }, { response: { 200: createResponseSchema(PostListResponseSchema) } })

  .post("/", async ({ body, user }: any) => {
    if (!user) throw new BizError(ErrorCode.UNAUTHORIZED, "Unauthorized", 401);
    // @ts-ignore
    const [err, newPost] = await PostService.create(user.id, body);
    if (err !== ErrorCode.SUCCESS) throw new BizError(err, "Failed to create article");
    return Result.success(newPost, "Article created");
  }, { body: CreatePostSchema, response: { 200: createResponseSchema(PostItemSchema) } })

  .delete("/:id", async ({ params, user }: any) => {
    if (!user) throw new BizError(ErrorCode.UNAUTHORIZED, "Unauthorized", 401);
    // @ts-ignore
    const [err] = await PostService.delete(user.id, params.id);
    if (err !== ErrorCode.SUCCESS) throw new BizError(err, "Failed to delete article");
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
  .post("/:id/like", async ({ params, user }: any) => {
    if (!user) throw new BizError(ErrorCode.UNAUTHORIZED, "Login required", 401);
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
  .post("/:id/comments", async ({ params, body, user }: any) => {
    if (!user) throw new BizError(ErrorCode.UNAUTHORIZED, "Login required", 401);
    
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
  .delete("/comments/:id", async ({ params, user }: any) => {
    if (!user) throw new BizError(ErrorCode.UNAUTHORIZED, "Login required", 401);
    
    const comment = await db.select().from(postComments).where(eq(postComments.id, params.id)).get();
    if (!comment) throw new BizError(ErrorCode.NOT_FOUND, "Comment not found", 404);
    
    if (comment.userId !== user.id) throw new BizError(ErrorCode.FORBIDDEN, "Can only delete own comments", 403);

    await db.update(postComments).set({ deletedAt: new Date() }).where(eq(postComments.id, params.id));
    return Result.success(null, "Comment deleted");
  });
