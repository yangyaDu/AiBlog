import { db } from "../../db";
import { posts } from "../../db/schema";
import { eq, desc } from "drizzle-orm";
import { randomUUID } from "crypto";
import { ErrorCode } from "../../utils/types";
import { CreatePostDTO, PostResponse } from "./post.model";

export const PostService = {
  async getAll(page: number, limit: number, tag?: string): Promise<[ErrorCode, PostResponse]> {
    const offset = (page - 1) * limit;

    const all = await db.select().from(posts).orderBy(desc(posts.timestamp));
    
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
    const newPost = {
      id: randomUUID(),
      authorId: userId,
      title: body.title,
      date: body.date,
      timestamp: Date.now(),
      readTime: "5 min read", 
      excerpt: body.excerpt,
      content: body.content,
      tags: JSON.stringify(tagsList),
    };

    await db.insert(posts).values(newPost);
    return [ErrorCode.SUCCESS, {
      ...newPost,
      tags: tagsList
    }];
  },

  async delete(userId: string, postId: string): Promise<[ErrorCode, boolean | null]> {
    const existing = await db.select().from(posts).where(eq(posts.id, postId)).get();
    
    if (!existing) {
       return [ErrorCode.NOT_FOUND, null];
    }
    if (existing.authorId !== userId) {
       return [ErrorCode.FORBIDDEN, null];
    }

    await db.delete(posts).where(eq(posts.id, postId));
    return [ErrorCode.SUCCESS, true];
  }
};