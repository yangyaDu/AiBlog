
import { EventBus } from "../utils/event-bus";
import { NotificationService } from "../features/notifications/service";
import { db } from "../db";
import { posts, postComments, follows } from "../db/schema";
import { eq } from "drizzle-orm";

// 1. Comment Notification
EventBus.on('comment.created', async (payload) => {
    const { postId, userId, parentId } = payload;

    if (parentId) {
        // Reply: Notify Parent Comment Author
        const parent = await db.select().from(postComments).where(eq(postComments.id, parentId)).get();
        if (parent) {
            await NotificationService.create({
                recipientId: parent.userId, 
                senderId: userId, 
                type: 'comment_reply', 
                referenceId: postId
            });
        }
    } else {
        // Root Comment: Notify Post Author
        const post = await db.select().from(posts).where(eq(posts.id, postId)).get();
        if (post) {
            await NotificationService.create({
                recipientId: post.createdBy, 
                senderId: userId, 
                type: 'post_comment', 
                referenceId: postId
            });
        }
    }
});

// 2. Like Notification
EventBus.on('post.liked', async (payload) => {
    const { postId, userId } = payload;
    const post = await db.select().from(posts).where(eq(posts.id, postId)).get();
    if (post) {
        await NotificationService.create({
            recipientId: post.createdBy, 
            senderId: userId, 
            type: 'post_like', 
            referenceId: postId
        });
    }
});

// 3. Follow Notification
EventBus.on('user.followed', async (payload) => {
    const { followerId, targetId } = payload;
    await NotificationService.create({
        recipientId: targetId, 
        senderId: followerId, 
        type: 'follow', 
        referenceId: followerId
    });
});

// 4. New Post Notification (Push to Followers)
EventBus.on('post.created', async (payload) => {
    const { postId, authorId } = payload;
    
    // Find all followers
    const myFollowers = await db.select().from(follows).where(eq(follows.followingId, authorId));
    
    // Fan-out write (Batch insert ideally, simple loop here)
    for (const f of myFollowers) {
        await NotificationService.create({
            recipientId: f.followerId, 
            senderId: authorId, 
            type: 'post_new', 
            referenceId: postId
        });
    }
});

console.log("🔔 Notification Listener Initialized");
