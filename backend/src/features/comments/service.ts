
import { db } from "../../db";
import { postComments } from "../../db/schema";
import { eq, and, isNull, desc } from "drizzle-orm";
import { randomUUID } from "crypto";
import { ErrorCode, ServiceContext } from "../../utils/types";
import { EventBus } from "../../utils/event-bus";

export interface CreateCommentOptions {
  postId: string;
  content: string;
  parentId?: string;
}

export interface GetCommentsOptions {
  page: number;
  limit: number;
}

export const CommentService = {
  async create(ctx: ServiceContext, options: CreateCommentOptions): Promise<[ErrorCode, any]> {
    const { postId, content, parentId } = options;
    
    const newComment = {
        id: randomUUID(),
        postId,
        userId: ctx.session.id,
        content,
        parentId: parentId || null
    };

    await db.insert(postComments).values(newComment);

    EventBus.emit('comment.created', { 
        commentId: newComment.id, 
        postId, 
        userId: ctx.session.id, 
        parentId: newComment.parentId, 
        content 
    });

    return [ErrorCode.SUCCESS, {
        ...newComment,
        username: ctx.session.username,
        createdAt: new Date() // Approximate for immediate return
    }];
  },

  async delete(ctx: ServiceContext, options: { id: string }): Promise<[ErrorCode, any]> {
    const comment = await db.select().from(postComments).where(eq(postComments.id, options.id)).get();
    if (!comment) return [ErrorCode.NOT_FOUND, null];
    if (comment.userId !== ctx.session.id) return [ErrorCode.FORBIDDEN, null];

    await db.update(postComments).set({ deletedAt: new Date() }).where(eq(postComments.id, options.id));
    return [ErrorCode.SUCCESS, null];
  },

  async getMine(ctx: ServiceContext, options: GetCommentsOptions): Promise<[ErrorCode, any]> {
      const { page, limit } = options;
      const offset = (page - 1) * limit;
      const data = await db.select().from(postComments)
        .where(and(eq(postComments.userId, ctx.session.id), isNull(postComments.deletedAt)))
        .orderBy(desc(postComments.createdAt))
        .limit(limit).offset(offset);
      return [ErrorCode.SUCCESS, data];
  }
};
