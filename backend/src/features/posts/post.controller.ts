
import { Elysia, t } from "elysia";
import { PostService } from "./post.service";
import { CreatePostSchema, PostListResponseSchema, PostItemSchema, InteractionsResponseSchema, DeletePostQuerySchema, GetInteractionsQuerySchema } from "./post.model";
import { Result, createResponseSchema } from "../../utils/response";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { BizError, ErrorCode } from "../../utils/types";

export const PostController = new Elysia({ prefix: "/api/posts" })
  .use(authMiddleware)
  
  .get("/", async ({ query }) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 5;
    const [err, data] = await PostService.getAll({ page, limit, tag: query.tag });
    if (err !== ErrorCode.SUCCESS) throw new BizError(err, "Failed to fetch articles");
    return Result.success(data);
  }, { response: { 200: createResponseSchema(PostListResponseSchema) } })

  .post("/", async ({ body, sessionInfo }) => {
    if (!sessionInfo) throw new BizError(ErrorCode.UNAUTHORIZED, "Unauthorized", 401);
    
    const [err, newPost] = await PostService.create({ session: sessionInfo }, body);
    if (err !== ErrorCode.SUCCESS) throw new BizError(err, "Failed to create article");
    return Result.success(newPost, "Article created");
  }, { body: CreatePostSchema, response: { 200: createResponseSchema(PostItemSchema) } })

  .delete("/", async ({ query, sessionInfo }) => {
    if (!sessionInfo) throw new BizError(ErrorCode.UNAUTHORIZED, "Unauthorized", 401);
    
    const [err] = await PostService.delete({ session: sessionInfo }, { id: query.id });
    if (err !== ErrorCode.SUCCESS) throw new BizError(err, "Failed to delete article");
    return Result.success(null, "Article deleted");
  }, { 
    query: DeletePostQuerySchema,
    response: { 200: createResponseSchema(t.Null()) } 
  })

  // --- Aggregated Data View ---
  .get("/interactions", async ({ query, sessionInfo }) => {
    const [err, data] = await PostService.getInteractions({ session: sessionInfo }, { postId: query.postId });
    if (err !== ErrorCode.SUCCESS) throw new BizError(err, "Failed to fetch interactions");
    
    return Result.success(data);
  }, { 
    query: GetInteractionsQuerySchema,
    response: { 200: createResponseSchema(InteractionsResponseSchema) } 
  });
