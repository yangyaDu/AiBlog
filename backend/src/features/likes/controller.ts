
import { Elysia, t } from "elysia";
import { LikeService } from "./service";
import { ToggleLikeResponse } from "./model";
import { Result, createResponseSchema } from "../../utils/response";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { BizError, ErrorCode, SessionInfo } from "../../utils/types";

export const LikeController = new Elysia({ prefix: "/api/likes" })
  .use(authMiddleware)
  .post("/", async ({ body, user }) => {
    if (!user) throw new BizError(ErrorCode.UNAUTHORIZED, "Login required", 401);
    
    const sessionInfo = user as SessionInfo;
    const [err, data] = await LikeService.toggle(sessionInfo, body.postId);
    if (err !== ErrorCode.SUCCESS) throw new BizError(err, "Failed to toggle like");

    return Result.success(data);
  }, { 
    body: t.Object({
      postId: t.String()
    }),
    response: { 200: createResponseSchema(ToggleLikeResponse) } 
  });
