
import { db } from "../../db";
import { posts, users } from "../../db/schema";
import { eq, desc, getTableColumns } from "drizzle-orm";
import { randomUUID } from "crypto";
import { ErrorCode } from "../../utils/types";
import { CreatePostDTO, PostResponse } from "./post.model";
import { EventBus } from "../../utils/event-bus";

export const PostService = {
  async getAll(page: number, limit: number, tag?: string): Promise<[ErrorCode, PostResponse]> {
    const offset = (page - 1) * limit;

    const all = await db
      .select({
        ...getTableColumns(posts),
        authorName: users.username,
      })
      .from(posts)
      .leftJoin(users, eq(posts.createdBy, users.id))
      .where(eq(posts.status, 'published')) 
      .orderBy(desc(posts.createdAt));
    
    let filtered = all.map(p => ({
        ...p, 
        tags: p.tags ? JSON.parse(p.tags) as string[] : []
    }));

    if (tag) {
      filtered = filtered.filter(p => p.tags.includes(tag));
    }

    const total = filtered.length;
    const paginated = filtered.slice(offset, offset + limit);

    return [ErrorCode.SUCCESS, {
      data: paginated,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    }];
  },

  async create(userId: string, body: CreatePostDTO): Promise<[ErrorCode, any]> {
    const tagsList = body.tags.split(",").map((s) => s.trim());
    
    const wordCount = body.content.trim().split(/\s+/).length;
    const readTime = `${Math.ceil(wordCount / 200)} min read`;
    const postId = randomUUID();
    const status = body.status || 'draft';

    const newPost = {
      id: postId,
      title: body.title,
      excerpt: body.excerpt,
      content: body.content,
      readTime: readTime,
      tags: JSON.stringify(tagsList),
      status: status,
      createdBy: userId,
      updatedBy: userId,
    };

    await db.insert(posts).values(newPost);
    
    // Emit Event if published
    if (status === 'published') {
        EventBus.emit('post.created', { postId, authorId: userId });
    }
    
    const user = await db.select({ username: users.username }).from(users).where(eq(users.id, userId)).get();

    return [ErrorCode.SUCCESS, {
      ...newPost,
      tags: tagsList,
      authorName: user?.username || 'Unknown',
      createdAt: new Date(),
      updatedAt: new Date()
    }];
  },

  async delete(userId: string, postId: string): Promise<[ErrorCode, boolean | null]> {
    const existing = await db.select().from(posts).where(eq(posts.id, postId)).get();
    
    if (!existing) {
       return [ErrorCode.NOT_FOUND, null];
    }
    if (existing.createdBy !== userId) {
       return [ErrorCode.FORBIDDEN, null];
    }

    await db.delete(posts).where(eq(posts.id, postId));
    return [ErrorCode.SUCCESS, true];
  }
};
