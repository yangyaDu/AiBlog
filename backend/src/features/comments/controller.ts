
import { Elysia, t } from "elysia";
import { CommentService } from "./service";
import { AddCommentSchema } from "./model";
import { Result } from "../../utils/response";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { BizError, ErrorCode } from "../../utils/types";

export const CommentController = new Elysia({ prefix: "/api/comments" })
  .use(authMiddleware)
  .post("/", async ({ body, user }: any) => {
    if (!user) throw new BizError(ErrorCode.UNAUTHORIZED, "Login required", 401);
    
    const [err, data] = await CommentService.create(user.id, body.postId, body.content, body.parentId);
    if (err !== ErrorCode.SUCCESS) throw new BizError(err, "Failed to post comment");
    
    return Result.success(data);
  }, { 
    body: t.Object({
      postId: t.String(),
      content: t.String(),
      parentId: t.Optional(t.String())
    })
  })

  .delete("/:id", async ({ params, user }: any) => {
    if (!user) throw new BizError(ErrorCode.UNAUTHORIZED, "Login required", 401);
    
    const [err] = await CommentService.delete(user.id, params.id);
    if (err !== ErrorCode.SUCCESS) {
        if (err === ErrorCode.FORBIDDEN) throw new BizError(err, "Forbidden", 403);
        if (err === ErrorCode.NOT_FOUND) throw new BizError(err, "Not Found", 404);
        throw new BizError(err, "Failed to delete comment");
    }
    
    return Result.success(null, "Comment deleted");
  })
  
  .get("/mine", async ({ user, query }: any) => {
      if (!user) throw new BizError(ErrorCode.UNAUTHORIZED, "Login required", 401);
      const page = Number(query.page) || 1;
      const limit = Number(query.limit) || 10;
      
      const [err, data] = await CommentService.getMine(user.id, page, limit);
      if (err !== ErrorCode.SUCCESS) throw new BizError(err, "Failed to fetch comments");
      
      return Result.success(data);
  });
