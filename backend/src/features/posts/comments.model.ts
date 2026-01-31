
import { t } from "elysia";

export const AddCommentSchema = t.Object({
  content: t.String(),
  parentId: t.Optional(t.String()) // For threaded comments
});

export const CommentItemSchema = t.Object({
  id: t.String(),
  postId: t.String(),
  parentId: t.Union([t.String(), t.Null()]),
  userId: t.String(),
  username: t.String(), // Resolved
  content: t.String(),
  createdAt: t.Any(),
});

export const InteractionsResponseSchema = t.Object({
  likes: t.Number(),
  userLiked: t.Boolean(),
  comments: t.Array(CommentItemSchema)
});
