
import { Elysia, t } from "elysia";
import { LikeService } from "./service";
import { ToggleLikeResponse } from "./model";
import { Result, createResponseSchema } from "../../utils/response";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { ErrorCode, getErrorInfo } from "../../utils/types";

export const LikeController = new Elysia({ prefix: "/api/likes" })
  .use(authMiddleware)
  .post("/", async ({ body, user, set }: any) => {
    if (!user) {
      const errorInfo = getErrorInfo(ErrorCode.UNAUTHORIZED);
      set.status = errorInfo.status;
      return Result.error(ErrorCode.UNAUTHORIZED, errorInfo.message, null);
    }
    
    const [err, data] = await LikeService.toggle(user.id, body.postId);
    if (err !== ErrorCode.SUCCESS) {
      const errorInfo = getErrorInfo(err);
      set.status = errorInfo.status;
      return Result.error(err, errorInfo.message, null);
    }

    return Result.success(data);
  }, { 
    body: t.Object({
      postId: t.String()
    }),
    response: { 200: createResponseSchema(ToggleLikeResponse) } 
  });
