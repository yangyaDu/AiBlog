
import { db } from "../../db";
import { postComments } from "../../db/schema";
import { eq, and, isNull, desc } from "drizzle-orm";
import { randomUUID } from "crypto";
import { ErrorCode, SessionInfo } from "../../utils/types";
import { EventBus } from "../../utils/event-bus";

export const CommentService = {
  async create(sessionInfo: SessionInfo, postId: string, content: string, parentId?: string): Promise<[ErrorCode, any]> {
    const newComment = {
        id: randomUUID(),
        postId,
        userId: sessionInfo.id,
        content,
        parentId: parentId || null
    };

    await db.insert(postComments).values(newComment);

    EventBus.emit('comment.created', { 
        commentId: newComment.id, 
        postId, 
        userId: sessionInfo.id, 
        parentId: newComment.parentId, 
        content 
    });

    return [ErrorCode.SUCCESS, {
        ...newComment,
        username: sessionInfo.username,
        createdAt: new Date() // Approximate for immediate return
    }];
  },

  async delete(sessionInfo: SessionInfo, commentId: string): Promise<[ErrorCode, any]> {
    const comment = await db.select().from(postComments).where(eq(postComments.id, commentId)).get();
    if (!comment) return [ErrorCode.NOT_FOUND, null];
    if (comment.userId !== sessionInfo.id) return [ErrorCode.FORBIDDEN, null];

    await db.update(postComments).set({ deletedAt: new Date() }).where(eq(postComments.id, commentId));
    return [ErrorCode.SUCCESS, null];
  },

  async getMine(sessionInfo: SessionInfo, page: number, limit: number): Promise<[ErrorCode, any]> {
      const offset = (page - 1) * limit;
      const data = await db.select().from(postComments)
        .where(and(eq(postComments.userId, sessionInfo.id), isNull(postComments.deletedAt)))
        .orderBy(desc(postComments.createdAt))
        .limit(limit).offset(offset);
      return [ErrorCode.SUCCESS, data];
  }
};
