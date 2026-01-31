
import { t } from "elysia";

export const HistoryItemSchema = t.Object({
  postId: t.String(),
  postTitle: t.String(),
  postExcerpt: t.String(),
  viewedAt: t.Any(),
});

export const HistoryResponseSchema = t.Array(HistoryItemSchema);
