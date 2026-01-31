
import { Elysia, t } from "elysia";
import { PostService } from "./post.service";
import { CreatePostSchema, CreatePostDTO, PostListResponseSchema, PostItemSchema } from "./post.model";
import { Result, createResponseSchema } from "../../utils/response";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { BizError, ErrorCode } from "../../utils/types";

export const PostController = new Elysia({ prefix: "/api/posts" })
  .use(authMiddleware)
  .get("/", async ({ query }) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 5;
    const [err, data] = await PostService.getAll(page, limit, query.tag);
    
    if (err !== ErrorCode.SUCCESS) throw new BizError(err, "Failed to fetch articles");

    return Result.success(data);
  }, {
    response: {
      200: createResponseSchema(PostListResponseSchema)
    }
  })
  .post("/", async ({ body, user }: any) => {
    if (!user) throw new BizError(ErrorCode.UNAUTHORIZED, "Unauthorized", 401);
    
    // @ts-ignore
    const [err, newPost] = await PostService.create(user.id, body);
    
    if (err !== ErrorCode.SUCCESS) throw new BizError(err, "Failed to create article");

    return Result.success(newPost, "Article created");
  }, {
    body: CreatePostSchema,
    response: {
      200: createResponseSchema(PostItemSchema)
    }
  })
  .delete("/:id", async ({ params, user }: any) => {
    if (!user) throw new BizError(ErrorCode.UNAUTHORIZED, "Unauthorized", 401);
    
    // @ts-ignore
    const [err] = await PostService.delete(user.id, params.id);
    
    if (err !== ErrorCode.SUCCESS) {
        if (err === ErrorCode.NOT_FOUND) throw new BizError(err, "Post not found", 404);
        if (err === ErrorCode.FORBIDDEN) throw new BizError(err, "Access denied", 403);
        throw new BizError(err, "Failed to delete article");
    }

    return Result.success(null, "Article deleted");
  }, {
    response: {
      200: createResponseSchema(t.Null())
    }
  });
