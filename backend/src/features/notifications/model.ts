
import { t } from "elysia";

export const NotificationItemSchema = t.Object({
  id: t.String(),
  type: t.String(),
  referenceId: t.Union([t.String(), t.Null()]),
  senderId: t.Union([t.String(), t.Null()]),
  senderName: t.Union([t.String(), t.Null()]), // Resolved name
  isRead: t.Boolean(),
  createdAt: t.Any()
});

export const NotificationListSchema = t.Array(NotificationItemSchema);

export const MarkReadBodySchema = t.Object({
    id: t.String()
});
