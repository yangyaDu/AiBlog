import { Elysia, t } from "elysia";
import { ProjectService } from "./project.service";
import { CreateProjectSchema, CreateProjectDTO, ProjectListResponseSchema, ProjectItemSchema } from "./project.model";
import { Result, createResponseSchema } from "../../utils/response";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { ErrorCode, getErrorInfo } from "../../utils/types";

export const ProjectController = new Elysia({ prefix: "/api/projects" })
  .use(authMiddleware)
  .get("/", async ({ query, set }) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 6;
    const [err, data] = await ProjectService.getAll(page, limit, query.tag);
    
    if (err !== ErrorCode.SUCCESS) {
      const errorInfo = getErrorInfo(err);
      set.status = errorInfo.status;
      return Result.error(err, errorInfo.message, null);
    }

    return Result.success(data);
  }, {
    response: {
      200: createResponseSchema(ProjectListResponseSchema)
    }
  })
  .post("/", async ({ body, user, set }: any) => {
    if (!user) {
      const errorInfo = getErrorInfo(ErrorCode.UNAUTHORIZED);
      set.status = errorInfo.status;
      return Result.error(ErrorCode.UNAUTHORIZED, errorInfo.message, null);
    }
    
    // @ts-ignore: Bun specific types for File
    const [err, newProject] = await ProjectService.create(user.id, body);
    
    if (err !== ErrorCode.SUCCESS) {
      const errorInfo = getErrorInfo(err);
      set.status = errorInfo.status;
      return Result.error(err, errorInfo.message, null);
    }

    return Result.success(newProject, "Project created");
  }, {
    body: CreateProjectSchema,
    response: {
      200: createResponseSchema(ProjectItemSchema)
    }
  })
  .delete("/:id", async ({ params, user, set }: any) => {
    if (!user) {
      const errorInfo = getErrorInfo(ErrorCode.UNAUTHORIZED);
      set.status = errorInfo.status;
      return Result.error(ErrorCode.UNAUTHORIZED, errorInfo.message, null);
    }
    
    // @ts-ignore
    const [err] = await ProjectService.delete(user.id, params.id);
    
    if (err !== ErrorCode.SUCCESS) {
      const errorInfo = getErrorInfo(err);
      set.status = errorInfo.status;
      return Result.error(err, errorInfo.message, null);
    }

    return Result.success(null, "Project deleted");
  }, {
    response: {
      200: createResponseSchema(t.Null())
    }
  });