
import { EventBus } from "../utils/event-bus";
import { NotificationService } from "../features/notifications/service";
import { db } from "../db";
import { posts, postComments, follows } from "../db/schema";
import { eq } from "drizzle-orm";

// 1. Comment Notification
EventBus.on('comment.created', async (payload) => {
    const { commentId, postId, userId, parentId, content } = payload;

    if (parentId) {
        // Reply: Notify Parent Comment Author
        const parent = await db.select().from(postComments).where(eq(postComments.id, parentId)).get();
        if (parent) {
            await NotificationService.create(parent.userId, userId, 'comment_reply', postId);
        }
    } else {
        // Root Comment: Notify Post Author
        const post = await db.select().from(posts).where(eq(posts.id, postId)).get();
        if (post) {
            await NotificationService.create(post.createdBy, userId, 'post_comment', postId);
        }
    }
});

// 2. Like Notification
EventBus.on('post.liked', async (payload) => {
    const { postId, userId } = payload;
    const post = await db.select().from(posts).where(eq(posts.id, postId)).get();
    if (post) {
        await NotificationService.create(post.createdBy, userId, 'post_like', postId);
    }
});

// 3. Follow Notification
EventBus.on('user.followed', async (payload) => {
    const { followerId, targetId } = payload;
    await NotificationService.create(targetId, followerId, 'follow', followerId);
});

// 4. New Post Notification (Push to Followers)
EventBus.on('post.created', async (payload) => {
    const { postId, authorId } = payload;
    
    // Find all followers
    const myFollowers = await db.select().from(follows).where(eq(follows.followingId, authorId));
    
    // Fan-out write (Batch insert ideally, simple loop here)
    for (const f of myFollowers) {
        await NotificationService.create(f.followerId, authorId, 'post_new', postId);
    }
});

console.log("🔔 Notification Listener Initialized");
