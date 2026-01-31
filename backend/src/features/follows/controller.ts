
import { Elysia, t } from "elysia";
import { FollowService } from "./service";
import { FollowStatusResponse } from "./model";
import { Result, createResponseSchema } from "../../utils/response";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { BizError, ErrorCode, SessionInfo } from "../../utils/types";

export const FollowController = new Elysia({ prefix: "/api/follows" })
  .use(authMiddleware)
  .post("/", async ({ body, user }) => {
    if (!user) throw new BizError(ErrorCode.UNAUTHORIZED, "Login required", 401);
    
    const sessionInfo = user as SessionInfo;
    const [err] = await FollowService.follow(sessionInfo, body.targetId);
    if (err !== ErrorCode.SUCCESS) throw new BizError(err, "Failed to follow user");
    
    return Result.success(null, "Followed successfully");
  }, {
    body: t.Object({
      targetId: t.String()
    }),
    response: { 200: createResponseSchema(t.Null()) }
  })
  .delete("/:targetId", async ({ params, user }) => {
    if (!user) throw new BizError(ErrorCode.UNAUTHORIZED, "Login required", 401);
    
    const sessionInfo = user as SessionInfo;
    await FollowService.unfollow(sessionInfo, params.targetId);
    return Result.success(null, "Unfollowed successfully");
  }, {
    response: { 200: createResponseSchema(t.Null()) }
  })
  .get("/check/:targetId", async ({ params, user }) => {
      const sessionInfo = user as SessionInfo | null;
      if (!sessionInfo) return Result.success({ isFollowing: false });
      
      const isFollowing = await FollowService.check(sessionInfo, params.targetId);
      return Result.success({ isFollowing });
  }, { 
    response: { 200: createResponseSchema(FollowStatusResponse) } 
  });
