
import { db } from "../../db";
import { notifications } from "../../db/schema";
import { randomUUID } from "crypto";
import { eq, desc } from "drizzle-orm";

export const NotificationService = {
  async notify(recipientId: string, senderId: string, type: 'post' | 'comment' | 'like' | 'follow', referenceId: string) {
    if (recipientId === senderId) return; // Don't notify self

    await db.insert(notifications).values({
      id: randomUUID(),
      userId: recipientId,
      senderId,
      type,
      referenceId,
      isRead: false
    });
  },

  async getMyNotifications(userId: string) {
    return await db.select().from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  },

  async markAsRead(notifId: string, userId: string) {
    await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, notifId)); // Add userId check in real app
  }
};
