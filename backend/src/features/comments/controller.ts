
import { Elysia, t } from "elysia";
import { CommentService } from "./service";
import { AddCommentSchema, CommentItemSchema, DeleteCommentQuerySchema } from "./model";
import { Result, createResponseSchema } from "../../utils/response";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { BizError, ErrorCode } from "../../utils/types";

export const CommentController = new Elysia({ prefix: "/api/comments" })
  .use(authMiddleware)
  .post("/", async ({ body, sessionInfo }) => {
    if (!sessionInfo) throw new BizError(ErrorCode.UNAUTHORIZED, "Login required", 401);
    
    const [err, data] = await CommentService.create(
      { session: sessionInfo }, 
      { 
        postId: body.postId, 
        content: body.content, 
        parentId: body.parentId 
      }
    );

    if (err !== ErrorCode.SUCCESS) throw new BizError(err, "Failed to post comment");
    
    return Result.success(data);
  }, { 
    body: AddCommentSchema,
    response: { 200: createResponseSchema(CommentItemSchema) }
  })

  .delete("/", async ({ query, sessionInfo }) => {
    if (!sessionInfo) throw new BizError(ErrorCode.UNAUTHORIZED, "Login required", 401);
    
    const [err] = await CommentService.delete({ session: sessionInfo }, { id: query.id });
    if (err !== ErrorCode.SUCCESS) {
        if (err === ErrorCode.FORBIDDEN) throw new BizError(err, "Forbidden", 403);
        if (err === ErrorCode.NOT_FOUND) throw new BizError(err, "Not Found", 404);
        throw new BizError(err, "Failed to delete comment");
    }
    
    return Result.success(null, "Comment deleted");
  }, {
    query: DeleteCommentQuerySchema,
    response: { 200: createResponseSchema(t.Null()) }
  })
  
  .get("/mine", async ({ sessionInfo, query }) => {
      if (!sessionInfo) throw new BizError(ErrorCode.UNAUTHORIZED, "Login required", 401);
      
      const page = Number(query.page) || 1;
      const limit = Number(query.limit) || 10;
      
      const [err, data] = await CommentService.getMine({ session: sessionInfo }, { page, limit });
      if (err !== ErrorCode.SUCCESS) throw new BizError(err, "Failed to fetch comments");
      
      return Result.success(data);
  }, {
    response: { 200: createResponseSchema(t.Array(CommentItemSchema)) }
  });
