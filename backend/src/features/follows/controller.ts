
import { Elysia, t } from "elysia";
import { FollowService } from "./service";
import { FollowStatusResponse } from "./model";
import { Result, createResponseSchema } from "../../utils/response";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { ErrorCode, getErrorInfo } from "../../utils/types";

export const FollowController = new Elysia({ prefix: "/api/follows" })
  .use(authMiddleware)
  .post("/", async ({ body, user, set }: any) => {
    if (!user) {
      const errorInfo = getErrorInfo(ErrorCode.UNAUTHORIZED);
      set.status = errorInfo.status;
      return Result.error(ErrorCode.UNAUTHORIZED, errorInfo.message, null);
    }
    
    const [err] = await FollowService.follow(user.id, body.targetId);
    if (err !== ErrorCode.SUCCESS) {
      const errorInfo = getErrorInfo(err);
      set.status = errorInfo.status;
      return Result.error(err, errorInfo.message, null);
    }
    
    return Result.success(null, "Followed successfully");
  }, {
    body: t.Object({
      targetId: t.String()
    })
  })
  .delete("/:targetId", async ({ params, user, set }: any) => {
    if (!user) {
      const errorInfo = getErrorInfo(ErrorCode.UNAUTHORIZED);
      set.status = errorInfo.status;
      return Result.error(ErrorCode.UNAUTHORIZED, errorInfo.message, null);
    }
    const [err] = await FollowService.unfollow(user.id, params.targetId);
    if (err !== ErrorCode.SUCCESS) {
      const errorInfo = getErrorInfo(err);
      set.status = errorInfo.status;
      return Result.error(err, errorInfo.message, null);
    }
    return Result.success(null, "Unfollowed successfully");
  })
  .get("/check/:targetId", async ({ params, user }: any) => {
      if (!user) return Result.success({ isFollowing: false });
      const isFollowing = await FollowService.check(user.id, params.targetId);
      return Result.success({ isFollowing });
  }, { response: { 200: createResponseSchema(FollowStatusResponse) } });
