
import { Elysia, t } from "elysia";
import { PostService } from "./post.service";
import { CreatePostSchema, PostListResponseSchema, PostItemSchema, InteractionsResponseSchema } from "./post.model";
import { Result, createResponseSchema } from "../../utils/response";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { BizError, ErrorCode, SessionInfo } from "../../utils/types";

export const PostController = new Elysia({ prefix: "/api/posts" })
  .use(authMiddleware)
  
  .get("/", async ({ query }) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 5;
    const [err, data] = await PostService.getAll(page, limit, query.tag);
    if (err !== ErrorCode.SUCCESS) throw new BizError(err, "Failed to fetch articles");
    return Result.success(data);
  }, { response: { 200: createResponseSchema(PostListResponseSchema) } })

  .post("/", async ({ body, user }) => {
    if (!user) throw new BizError(ErrorCode.UNAUTHORIZED, "Unauthorized", 401);
    
    const sessionInfo = user as SessionInfo;
    const [err, newPost] = await PostService.create(sessionInfo, body);
    if (err !== ErrorCode.SUCCESS) throw new BizError(err, "Failed to create article");
    return Result.success(newPost, "Article created");
  }, { body: CreatePostSchema, response: { 200: createResponseSchema(PostItemSchema) } })

  .delete("/:id", async ({ params, user }) => {
    if (!user) throw new BizError(ErrorCode.UNAUTHORIZED, "Unauthorized", 401);
    
    const sessionInfo = user as SessionInfo;
    const [err] = await PostService.delete(sessionInfo, params.id);
    if (err !== ErrorCode.SUCCESS) throw new BizError(err, "Failed to delete article");
    return Result.success(null, "Article deleted");
  }, { response: { 200: createResponseSchema(t.Null()) } })

  // --- Aggregated Data View ---
  .get("/:id/interactions", async ({ params, user }) => {
    const sessionInfo = user as SessionInfo | null;
    const [err, data] = await PostService.getInteractions(sessionInfo, params.id);
    if (err !== ErrorCode.SUCCESS) throw new BizError(err, "Failed to fetch interactions");
    
    return Result.success(data);
  }, { response: { 200: createResponseSchema(InteractionsResponseSchema) } });
