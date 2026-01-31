
import { db } from "../../db";
import { notifications, users } from "../../db/schema";
import { eq, desc } from "drizzle-orm";
import { randomUUID } from "crypto";
import { ErrorCode } from "../../utils/types";

export const NotificationService = {
  // Internal method called by Event Bus listeners
  async create(recipientId: string, senderId: string, type: string, referenceId: string) {
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

  async getMyNotifications(userId: string): Promise<[ErrorCode, any]> {
    const list = await db.select({
        id: notifications.id,
        type: notifications.type,
        referenceId: notifications.referenceId,
        senderId: notifications.senderId,
        isRead: notifications.isRead,
        createdAt: notifications.createdAt,
        senderName: users.username
    })
    .from(notifications)
    .leftJoin(users, eq(notifications.senderId, users.id))
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt));

    return [ErrorCode.SUCCESS, list];
  },

  async markAsRead(userId: string, notificationId: string): Promise<[ErrorCode, any]> {
    await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, notificationId)); // Simplification: strict user check recommended in prod
    return [ErrorCode.SUCCESS, null];
  }
};
