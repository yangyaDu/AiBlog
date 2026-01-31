
import { Elysia, t } from "elysia";
import { FollowService } from "./service";
import { FollowStatusResponse, FollowBodySchema, UnfollowQuerySchema, CheckFollowQuerySchema } from "./model";
import { Result, createResponseSchema } from "../../utils/response";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { BizError, ErrorCode } from "../../utils/types";

export const FollowController = new Elysia({ prefix: "/api/follows" })
  .use(authMiddleware)
  .post("/", async ({ body, sessionInfo }) => {
    if (!sessionInfo) throw new BizError(ErrorCode.UNAUTHORIZED, "Login required", 401);
    
    const [err] = await FollowService.follow({ session: sessionInfo }, { targetId: body.targetId });
    if (err !== ErrorCode.SUCCESS) throw new BizError(err, "Failed to follow user");
    
    return Result.success(null, "Followed successfully");
  }, {
    body: FollowBodySchema,
    response: { 200: createResponseSchema(t.Null()) }
  })
  .delete("/", async ({ query, sessionInfo }) => {
    if (!sessionInfo) throw new BizError(ErrorCode.UNAUTHORIZED, "Login required", 401);
    
    await FollowService.unfollow({ session: sessionInfo }, { targetId: query.targetId });
    return Result.success(null, "Unfollowed successfully");
  }, {
    query: UnfollowQuerySchema,
    response: { 200: createResponseSchema(t.Null()) }
  })
  .get("/check", async ({ query, sessionInfo }) => {
      if (!sessionInfo) return Result.success({ isFollowing: false });
      
      const isFollowing = await FollowService.check({ session: sessionInfo }, { targetId: query.targetId });
      return Result.success({ isFollowing });
  }, { 
    query: CheckFollowQuerySchema,
    response: { 200: createResponseSchema(FollowStatusResponse) } 
  });
