
import { Elysia, t } from "elysia";
import { NotificationService } from "./service";
import { NotificationListSchema } from "./model";
import { Result, createResponseSchema } from "../../utils/response";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { BizError, ErrorCode, SessionInfo } from "../../utils/types";

export const NotificationController = new Elysia({ prefix: "/api/notifications" })
  .use(authMiddleware)
  .get("/", async ({ user }) => {
    if (!user) throw new BizError(ErrorCode.UNAUTHORIZED, "Login required", 401);
    
    const sessionInfo = user as SessionInfo;
    const [err, data] = await NotificationService.getMyNotifications(sessionInfo);
    
    if (err !== ErrorCode.SUCCESS) {
       throw new BizError(err, "Failed to fetch notifications");
    }

    return Result.success(data);
  }, {
      response: { 200: createResponseSchema(NotificationListSchema) }
  })
  .post("/:id/read", async ({ params, user }) => {
    if (!user) throw new BizError(ErrorCode.UNAUTHORIZED, "Login required", 401);
    
    const sessionInfo = user as SessionInfo;
    await NotificationService.markAsRead(sessionInfo, params.id);
    return Result.success(null);
  }, {
    response: { 200: createResponseSchema(t.Null()) }
  });
