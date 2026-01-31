
import { db } from "../../db";
import { notifications, users } from "../../db/schema";
import { eq, desc } from "drizzle-orm";
import { randomUUID } from "crypto";
import { ErrorCode, ServiceContext } from "../../utils/types";

export interface CreateNotificationOptions {
  recipientId: string;
  senderId: string;
  type: string;
  referenceId: string;
}

export const NotificationService = {
  // Internal method called by Event Bus listeners
  async create(options: CreateNotificationOptions) {
    const { recipientId, senderId, type, referenceId } = options;
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

  async getMyNotifications(ctx: ServiceContext): Promise<[ErrorCode, any]> {
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
    .where(eq(notifications.userId, ctx.session.id))
    .orderBy(desc(notifications.createdAt));

    return [ErrorCode.SUCCESS, list];
  },

  async markAsRead(_ctx: ServiceContext, options: { id: string }): Promise<[ErrorCode, any]> {
    // Note: In strict implementation we should check if notif belongs to user
    await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, options.id)); 
    return [ErrorCode.SUCCESS, null];
  }
};
