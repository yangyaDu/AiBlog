
import { Elysia } from "elysia";
import { Result } from "../../utils/response";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { BizError, ErrorCode } from "../../utils/types";
import { NotificationService } from "./notification.service";

export const NotificationController = new Elysia({ prefix: "/api/notifications" })
  .use(authMiddleware)
  .get("/", async ({ user }: any) => {
    if (!user) throw new BizError(ErrorCode.UNAUTHORIZED, "Login required", 401);
    const data = await NotificationService.getMyNotifications(user.id);
    return Result.success(data);
  })
  .post("/:id/read", async ({ params, user }: any) => {
    if (!user) throw new BizError(ErrorCode.UNAUTHORIZED, "Login required", 401);
    await NotificationService.markAsRead(params.id, user.id);
    return Result.success(null);
  });
