
import { Elysia } from "elysia";
import { NotificationService } from "./service";
import { NotificationListSchema } from "./model";
import { Result, createResponseSchema } from "../../utils/response";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { ErrorCode, getErrorInfo } from "../../utils/types";

export const NotificationController = new Elysia({ prefix: "/api/notifications" })
  .use(authMiddleware)
  .get("/", async ({ user, set }: any) => {
    if (!user) {
      const errorInfo = getErrorInfo(ErrorCode.UNAUTHORIZED);
      set.status = errorInfo.status;
      return Result.error(ErrorCode.UNAUTHORIZED, errorInfo.message, null);
    }
    const [err, data] = await NotificationService.getMyNotifications(user.id);
    if (err !== ErrorCode.SUCCESS) {
      const errorInfo = getErrorInfo(err);
      set.status = errorInfo.status;
      return Result.error(err, errorInfo.message, null);
    }
    return Result.success(data);
  }, {
      response: { 200: createResponseSchema(NotificationListSchema) }
  })
  .post("/:id/read", async ({ params, user, set }: any) => {
    if (!user) {
      const errorInfo = getErrorInfo(ErrorCode.UNAUTHORIZED);
      set.status = errorInfo.status;
      return Result.error(ErrorCode.UNAUTHORIZED, errorInfo.message, null);
    }
    const [err] = await NotificationService.markAsRead(user.id, params.id);
    if (err !== ErrorCode.SUCCESS) {
      const errorInfo = getErrorInfo(err);
      set.status = errorInfo.status;
      return Result.error(err, errorInfo.message, null);
    }
    return Result.success(null);
  });
