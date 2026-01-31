
import { Elysia, t } from "elysia";
import { FollowService } from "./service";
import { FollowStatusResponse } from "./model";
import { Result, createResponseSchema } from "../../utils/response";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { BizError, ErrorCode } from "../../utils/types";

export const FollowController = new Elysia({ prefix: "/api/follows" })
  .use(authMiddleware)
  .post("/", async ({ body, user }: any) => {
    if (!user) throw new BizError(ErrorCode.UNAUTHORIZED, "Login required", 401);
    
    const [err] = await FollowService.follow(user.id, body.targetId);
    if (err !== ErrorCode.SUCCESS) throw new BizError(err, "Failed to follow user");
    
    return Result.success(null, "Followed successfully");
  }, {
    body: t.Object({
      targetId: t.String()
    })
  })
  .delete("/:targetId", async ({ params, user }: any) => {
    if (!user) throw new BizError(ErrorCode.UNAUTHORIZED, "Login required", 401);
    await FollowService.unfollow(user.id, params.targetId);
    return Result.success(null, "Unfollowed successfully");
  })
  .get("/check/:targetId", async ({ params, user }: any) => {
      if (!user) return Result.success({ isFollowing: false });
      const isFollowing = await FollowService.check(user.id, params.targetId);
      return Result.success({ isFollowing });
  }, { response: { 200: createResponseSchema(FollowStatusResponse) } });
