
import { t } from "elysia";

export const AddCommentSchema = t.Object({
  content: t.String(),
  parentId: t.Optional(t.String()),
  postId: t.String()
});

export const CommentItemSchema = t.Object({
  id: t.String(),
  postId: t.String(),
  parentId: t.Union([t.String(), t.Null()]),
  userId: t.String(),
  username: t.String(), 
  content: t.String(),
  createdAt: t.Any(),
});

export const DeleteCommentQuerySchema = t.Object({
  id: t.String()
});
