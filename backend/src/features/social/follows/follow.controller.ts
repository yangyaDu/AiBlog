
import { Elysia } from "elysia";
import { Result } from "../../../utils/response";
import { authMiddleware } from "../../../middlewares/auth.middleware";
import { BizError, ErrorCode } from "../../../utils/types";
import { db } from "../../../db";
import { follows, users } from "../../../db/schema";
import { eq, and } from "drizzle-orm";
import { NotificationService } from "../../notifications/notification.service";

export const FollowController = new Elysia({ prefix: "/api/follows" })
  .use(authMiddleware)
  
  .post("/:targetId", async ({ params, user }: any) => {
    if (!user) throw new BizError(ErrorCode.UNAUTHORIZED, "Login required", 401);
    
    const followerId = user.id;
    const followingId = params.targetId;

    if (followerId === followingId) {
        throw new BizError(ErrorCode.VALIDATION_ERROR, "Cannot follow yourself");
    }

    const target = await db.select().from(users).where(eq(users.id, followingId)).get();
    if (!target) throw new BizError(ErrorCode.NOT_FOUND, "User not found", 404);

    try {
        await db.insert(follows).values({ followerId, followingId });
        await NotificationService.notify(followingId, followerId, 'follow', followerId);
    } catch (e) {
        // Ignore duplicate
    }

    return Result.success(null, "Followed successfully");
  })

  .delete("/:targetId", async ({ params, user }: any) => {
    if (!user) throw new BizError(ErrorCode.UNAUTHORIZED, "Login required", 401);
    
    await db.delete(follows).where(
        and(eq(follows.followerId, user.id), eq(follows.followingId, params.targetId))
    );

    return Result.success(null, "Unfollowed successfully");
  })
  
  .get("/check/:targetId", async ({ params, user }: any) => {
      if (!user) return Result.success({ isFollowing: false });
      
      const rel = await db.select().from(follows)
        .where(and(eq(follows.followerId, user.id), eq(follows.followingId, params.targetId)))
        .get();
        
      return Result.success({ isFollowing: !!rel });
  });
