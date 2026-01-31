
import { t, Static } from "elysia";

export const CreatePostSchema = t.Object({
  title: t.String(),
  excerpt: t.String(),
  content: t.String(), // Markdown text
  tags: t.String(),
  status: t.Optional(t.Union([t.Literal('draft'), t.Literal('published')])),
});

export const PostItemSchema = t.Object({
  id: t.String(),
  title: t.String(),
  excerpt: t.String(),
  content: t.String(),
  readTime: t.String(),
  status: t.String(),
  tags: t.Array(t.String()),
  coverImage: t.Union([t.String(), t.Null(), t.Undefined()]),
  
  createdBy: t.String(),
  authorName: t.Union([t.String(), t.Null()]),
  createdAt: t.Any(), 
  updatedAt: t.Any(),
});

export const PostListResponseSchema = t.Object({
  data: t.Array(PostItemSchema),
  total: t.Number(),
  page: t.Number(),
  totalPages: t.Number()
});

export const InteractionsResponseSchema = t.Object({
    likes: t.Number(),
    userLiked: t.Boolean(),
    comments: t.Array(t.Object({
        id: t.String(),
        postId: t.String(),
        parentId: t.Union([t.String(), t.Null()]),
        userId: t.String(),
        username: t.String(),
        content: t.String(),
        createdAt: t.Any()
    }))
});

export const DeletePostQuerySchema = t.Object({
  id: t.String()
});

export const GetInteractionsQuerySchema = t.Object({
  postId: t.String()
});

export type CreatePostDTO = Static<typeof CreatePostSchema>;

export interface PostResponse {
    data: any[];
    total: number;
    page: number;
    totalPages: number;
}
