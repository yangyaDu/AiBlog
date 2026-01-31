import { t, Static } from "elysia";

export const CreatePostSchema = t.Object({
  title: t.String(),
  date: t.String(),
  excerpt: t.String(),
  content: t.String(),
  tags: t.String(),
});

export const PostItemSchema = t.Object({
  id: t.String(),
  authorId: t.String(),
  title: t.String(),
  date: t.String(),
  timestamp: t.Number(),
  readTime: t.String(),
  excerpt: t.String(),
  content: t.String(),
  tags: t.Array(t.String()),
  coverImage: t.Union([t.String(), t.Null(), t.Undefined()]),
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
