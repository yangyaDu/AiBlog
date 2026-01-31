
import { Elysia, t } from "elysia";
import { FollowService } from "./service";
import { FollowStatusResponse } from "./model";
import { Result, createResponseSchema } from "../../utils/response";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { BizError, ErrorCode } from "../../utils/types";

export const FollowController = new Elysia({ prefix: "/api/follows" })
  .use(authMiddleware)
  .post("/", async ({ body, sessionInfo }) => {
    if (!sessionInfo) throw new BizError(ErrorCode.UNAUTHORIZED, "Login required", 401);
    
    const [err] = await FollowService.follow({ session: sessionInfo }, body.targetId);
    if (err !== ErrorCode.SUCCESS) throw new BizError(err, "Failed to follow user");
    
    return Result.success(null, "Followed successfully");
  }, {
    body: t.Object({
      targetId: t.String()
    }),
    response: { 200: createResponseSchema(t.Null()) }
  })
  .delete("/:targetId", async ({ params, sessionInfo }) => {
    if (!sessionInfo) throw new BizError(ErrorCode.UNAUTHORIZED, "Login required", 401);
    
    await FollowService.unfollow({ session: sessionInfo }, params.targetId);
    return Result.success(null, "Unfollowed successfully");
  }, {
    response: { 200: createResponseSchema(t.Null()) }
  })
  .get("/check/:targetId", async ({ params, sessionInfo }) => {
      if (!sessionInfo) return Result.success({ isFollowing: false });
      
      const isFollowing = await FollowService.check({ session: sessionInfo }, params.targetId);
      return Result.success({ isFollowing });
  }, { 
    response: { 200: createResponseSchema(FollowStatusResponse) } 
  });
