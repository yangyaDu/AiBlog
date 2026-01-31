
import { db } from "../../db";
import { postComments } from "../../db/schema";
import { eq, and, isNull, desc } from "drizzle-orm";
import { randomUUID } from "crypto";
import { ErrorCode } from "../../utils/types";
import { EventBus } from "../../utils/event-bus";

export const CommentService = {
  async create(userId: string, postId: string, content: string, parentId?: string): Promise<[ErrorCode, any | null]> {
    const newComment = {
        id: randomUUID(),
        postId,
        userId,
        content,
        parentId: parentId || null
    };

    await db.insert(postComments).values(newComment);

    // Emit Event for Notifications
    EventBus.emit('comment.created', { 
        commentId: newComment.id, 
        postId, 
        userId, 
        parentId: newComment.parentId, 
        content 
    });

    return [ErrorCode.SUCCESS, newComment];
  },

  async delete(userId: string, commentId: string): Promise<[ErrorCode, null]> {
    const comment = await db.select().from(postComments).where(eq(postComments.id, commentId)).get();
    if (!comment) return [ErrorCode.NOT_FOUND, null];
    if (comment.userId !== userId) return [ErrorCode.FORBIDDEN, null];

    await db.update(postComments).set({ deletedAt: new Date() }).where(eq(postComments.id, commentId));
    return [ErrorCode.SUCCESS, null];
  },

  async getMine(userId: string, page: number, limit: number): Promise<[ErrorCode, any | null]> {
      const offset = (page - 1) * limit;
      const data = await db.select().from(postComments)
        .where(and(eq(postComments.userId, userId), isNull(postComments.deletedAt)))
        .orderBy(desc(postComments.createdAt))
        .limit(limit).offset(offset);
      return [ErrorCode.SUCCESS, data];
  }
};
