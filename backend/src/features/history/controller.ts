
import { Elysia, t } from "elysia";
import { HistoryService } from "./service";
import { HistoryResponseSchema } from "./model";
import { Result, createResponseSchema } from "../../utils/response";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { ErrorCode, getErrorInfo } from "../../utils/types";

export const HistoryController = new Elysia({ prefix: "/api/history" })
  .use(authMiddleware)
  .post("/", async ({ body, user, set }: any) => {
     if (!user) return Result.success(null); // Silent success for anon
     
     const [err] = await HistoryService.recordView(user.id, body.postId);
     if (err !== ErrorCode.SUCCESS) {
       const errorInfo = getErrorInfo(err);
       set.status = errorInfo.status;
       return Result.error(err, errorInfo.message, null);
     }

     return Result.success(null);
  }, {
     body: t.Object({
       postId: t.String()
     })
  })
  .get("/mine", async ({ user, query, set }: any) => {
      if (!user) {
        const errorInfo = getErrorInfo(ErrorCode.UNAUTHORIZED);
        set.status = errorInfo.status;
        return Result.error(ErrorCode.UNAUTHORIZED, errorInfo.message, null);
      }
      const page = Number(query.page) || 1;
      const limit = Number(query.limit) || 10;
      
      const [err, data] = await HistoryService.getMyHistory(user.id, page, limit);
      if (err !== ErrorCode.SUCCESS) {
        const errorInfo = getErrorInfo(err);
        set.status = errorInfo.status;
        return Result.error(err, errorInfo.message, null);
      }

      return Result.success(data);
  }, {
      response: { 200: createResponseSchema(HistoryResponseSchema) }
  });
