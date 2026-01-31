
import { Elysia, t } from "elysia";
import { ProjectService } from "./project.service";
import { CreateProjectSchema, ProjectListResponseSchema, ProjectItemSchema, DeleteProjectQuerySchema } from "./project.model";
import { Result, createResponseSchema } from "../../utils/response";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { BizError, ErrorCode } from "../../utils/types";

export const ProjectController = new Elysia({ prefix: "/api/projects" })
  .use(authMiddleware)
  .get("/", async ({ query }) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 6;
    const [err, data] = await ProjectService.getAll({ page, limit, tag: query.tag });
    
    if (err !== ErrorCode.SUCCESS) throw new BizError(err, "Failed to fetch projects");

    return Result.success(data);
  }, {
    response: {
      200: createResponseSchema(ProjectListResponseSchema)
    }
  })
  .post("/", async ({ body, sessionInfo }) => {
    if (!sessionInfo) throw new BizError(ErrorCode.UNAUTHORIZED, "Unauthorized", 401);
    
    // @ts-ignore: Bun specific types for File
    const [err, newProject] = await ProjectService.create({ session: sessionInfo }, body);
    
    if (err !== ErrorCode.SUCCESS) throw new BizError(err, "Failed to create project");

    return Result.success(newProject, "Project created");
  }, {
    body: CreateProjectSchema,
    response: {
      200: createResponseSchema(ProjectItemSchema)
    }
  })
  .delete("/", async ({ query, sessionInfo }) => {
    if (!sessionInfo) throw new BizError(ErrorCode.UNAUTHORIZED, "Unauthorized", 401);
    
    const [err] = await ProjectService.delete({ session: sessionInfo }, { id: query.id });
    
    if (err !== ErrorCode.SUCCESS) {
        if (err === ErrorCode.NOT_FOUND) throw new BizError(err, "Project not found", 404);
        if (err === ErrorCode.FORBIDDEN) throw new BizError(err, "Access denied", 403);
        throw new BizError(err, "Failed to delete project");
    }

    return Result.success(null, "Project deleted");
  }, {
    query: DeleteProjectQuerySchema,
    response: {
      200: createResponseSchema(t.Null())
    }
  });
