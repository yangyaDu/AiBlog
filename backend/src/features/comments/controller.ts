
import { Elysia, t } from "elysia";
import { CommentService } from "./service";
import { AddCommentSchema } from "./model";
import { Result } from "../../utils/response";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { ErrorCode, getErrorInfo } from "../../utils/types";

export const CommentController = new Elysia({ prefix: "/api/comments" })
  .use(authMiddleware)
  .post("/", async ({ body, user, set }: any) => {
    if (!user) {
      const errorInfo = getErrorInfo(ErrorCode.UNAUTHORIZED);
      set.status = errorInfo.status;
      return Result.error(ErrorCode.UNAUTHORIZED, errorInfo.message, null);
    }
    
    const [err, data] = await CommentService.create(user.id, body.postId, body.content, body.parentId);
    if (err !== ErrorCode.SUCCESS) {
      const errorInfo = getErrorInfo(err);
      set.status = errorInfo.status;
      return Result.error(err, errorInfo.message, null);
    }
    
    return Result.success(data);
  }, { 
    body: t.Object({
      postId: t.String(),
      content: t.String(),
      parentId: t.Optional(t.String())
    })
  })

  .delete("/:id", async ({ params, user, set }: any) => {
    if (!user) {
      const errorInfo = getErrorInfo(ErrorCode.UNAUTHORIZED);
      set.status = errorInfo.status;
      return Result.error(ErrorCode.UNAUTHORIZED, errorInfo.message, null);
    }
    
    const [err] = await CommentService.delete(user.id, params.id);
    if (err !== ErrorCode.SUCCESS) {
      const errorInfo = getErrorInfo(err);
      set.status = errorInfo.status;
      return Result.error(err, errorInfo.message, null);
    }
    
    return Result.success(null, "Comment deleted");
  })
  
  .get("/mine", async ({ user, query, set }: any) => {
      if (!user) {
        const errorInfo = getErrorInfo(ErrorCode.UNAUTHORIZED);
        set.status = errorInfo.status;
        return Result.error(ErrorCode.UNAUTHORIZED, errorInfo.message, null);
      }
      const page = Number(query.page) || 1;
      const limit = Number(query.limit) || 10;
      
      const [err, data] = await CommentService.getMine(user.id, page, limit);
      if (err !== ErrorCode.SUCCESS) {
        const errorInfo = getErrorInfo(err);
        set.status = errorInfo.status;
        return Result.error(err, errorInfo.message, null);
      }
      return Result.success(data);
  });
