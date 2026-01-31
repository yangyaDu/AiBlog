
import { t, Static } from "elysia";

export const CreatePostSchema = t.Object({
  title: t.String(),
  excerpt: t.String(),
  content: t.String(), // Markdown text containing images/videos syntax
  tags: t.String(),
});

export const PostItemSchema = t.Object({
  id: t.String(),
  title: t.String(),
  excerpt: t.String(),
  content: t.String(),
  readTime: t.String(),
  tags: t.Array(t.String()),
  coverImage: t.Union([t.String(), t.Null(), t.Undefined()]),
  
  // Audit info
  createdBy: t.String(),
  authorName: t.Union([t.String(), t.Null()]), // Resolved from users table
  createdAt: t.Any(), // Date object or ISO string
  updatedAt: t.Any(), // Date object or ISO string
});

export const PostListResponseSchema = t.Object({
  data: t.Array(PostItemSchema),
  total: t.Number(),
  page: t.Number(),
  totalPages: t.Number()
});

export type CreatePostDTO = Static<typeof CreatePostSchema>;

export interface PostResponse {
    data: any[];
    total: number;
    page: number;
    totalPages: number;
}
