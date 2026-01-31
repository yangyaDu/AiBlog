
import { Elysia, t } from "elysia";
import { CommentService } from "./service";
import { AddCommentSchema, CommentItemSchema } from "./model";
import { Result, createResponseSchema } from "../../utils/response";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { BizError, ErrorCode, SessionInfo } from "../../utils/types";

export const CommentController = new Elysia({ prefix: "/api/comments" })
  .use(authMiddleware)
  .post("/", async ({ body, user }) => {
    if (!user) throw new BizError(ErrorCode.UNAUTHORIZED, "Login required", 401);
    
    const sessionInfo = user as SessionInfo;
    const [err, data] = await CommentService.create(sessionInfo, body.postId, body.content, body.parentId);
    if (err !== ErrorCode.SUCCESS) throw new BizError(err, "Failed to post comment");
    
    return Result.success(data);
  }, { 
    body: t.Object({
      postId: t.String(),
      content: t.String(),
      parentId: t.Optional(t.String())
    }),
    response: { 200: createResponseSchema(CommentItemSchema) }
  })

  .delete("/:id", async ({ params, user }) => {
    if (!user) throw new BizError(ErrorCode.UNAUTHORIZED, "Login required", 401);
    
    const sessionInfo = user as SessionInfo;
    const [err] = await CommentService.delete(sessionInfo, params.id);
    if (err !== ErrorCode.SUCCESS) {
        if (err === ErrorCode.FORBIDDEN) throw new BizError(err, "Forbidden", 403);
        if (err === ErrorCode.NOT_FOUND) throw new BizError(err, "Not Found", 404);
        throw new BizError(err, "Failed to delete comment");
    }
    
    return Result.success(null, "Comment deleted");
  }, {
    response: { 200: createResponseSchema(t.Null()) }
  })
  
  .get("/mine", async ({ user, query }) => {
      if (!user) throw new BizError(ErrorCode.UNAUTHORIZED, "Login required", 401);
      
      const sessionInfo = user as SessionInfo;
      const page = Number(query.page) || 1;
      const limit = Number(query.limit) || 10;
      
      const [err, data] = await CommentService.getMine(sessionInfo, page, limit);
      if (err !== ErrorCode.SUCCESS) throw new BizError(err, "Failed to fetch comments");
      
      return Result.success(data);
  }, {
    response: { 200: createResponseSchema(t.Array(CommentItemSchema)) }
  });
