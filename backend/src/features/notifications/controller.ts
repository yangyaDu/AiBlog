
import { Elysia, t } from "elysia";
import { NotificationService } from "./service";
import { NotificationListSchema } from "./model";
import { Result, createResponseSchema } from "../../utils/response";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { BizError, ErrorCode } from "../../utils/types";

export const NotificationController = new Elysia({ prefix: "/api/notifications" })
  .use(authMiddleware)
  .get("/", async ({ sessionInfo }) => {
    if (!sessionInfo) throw new BizError(ErrorCode.UNAUTHORIZED, "Login required", 401);
    
    const [err, data] = await NotificationService.getMyNotifications({ session: sessionInfo });
    
    if (err !== ErrorCode.SUCCESS) {
       throw new BizError(err, "Failed to fetch notifications");
    }

    return Result.success(data);
  }, {
      response: { 200: createResponseSchema(NotificationListSchema) }
  })
  .post("/:id/read", async ({ params, sessionInfo }) => {
    if (!sessionInfo) throw new BizError(ErrorCode.UNAUTHORIZED, "Login required", 401);
    
    await NotificationService.markAsRead({ session: sessionInfo }, params.id);
    return Result.success(null);
  }, {
    response: { 200: createResponseSchema(t.Null()) }
  });
