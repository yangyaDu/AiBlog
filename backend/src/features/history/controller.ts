
import { Elysia, t } from "elysia";
import { HistoryService } from "./service";
import { HistoryResponseSchema } from "./model";
import { Result, createResponseSchema } from "../../utils/response";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { BizError, ErrorCode } from "../../utils/types";

export const HistoryController = new Elysia({ prefix: "/api/history" })
  .use(authMiddleware)
  .post("/", async ({ body, sessionInfo }) => {
     if (!sessionInfo) return Result.success(null); // Silent success for anon
     
     const [err] = await HistoryService.recordView({ session: sessionInfo }, { postId: body.postId });
     if (err !== ErrorCode.SUCCESS) throw new BizError(err, "Failed to record history");

     return Result.success(null);
  }, {
     body: t.Object({
       postId: t.String()
     }),
     response: { 200: createResponseSchema(t.Null()) }
  })
  .get("/mine", async ({ sessionInfo, query }) => {
      if (!sessionInfo) throw new BizError(ErrorCode.UNAUTHORIZED, "Login required", 401);
      
      const page = Number(query.page) || 1;
      const limit = Number(query.limit) || 10;
      
      const [err, data] = await HistoryService.getMyHistory({ session: sessionInfo }, { page, limit });
      if (err !== ErrorCode.SUCCESS) throw new BizError(err, "Failed to fetch history");

      return Result.success(data);
  }, {
      response: { 200: createResponseSchema(HistoryResponseSchema) }
  });
