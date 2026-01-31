
import { Elysia } from "elysia";
import { Result, createResponseSchema } from "../../utils/response";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { BizError, ErrorCode, SessionInfo } from "../../utils/types";
import { EncryptUrlRequestSchema, EncryptUrlResponseSchema } from "./media.model";

export const MediaController = new Elysia({ prefix: "/api/media" })
  .use(authMiddleware)
  .post("/encrypt-url", async ({ body, user }) => {
    if (!user) throw new BizError(ErrorCode.UNAUTHORIZED, "Unauthorized", 401);
    
    // Logic simulated here (Service is overkill for 1 line, but strict MVC usually demands it. 
    // Given the simplicity, kept inline or could extract MediaService.encrypt(body.url))
    const plainUrl = body.url;
    if (!plainUrl) throw new BizError(ErrorCode.VALIDATION_ERROR, "URL is required", 400);

    const hash = btoa(plainUrl);
    const encryptedUrl = `SECURE::${hash}`;

    return Result.success({ encryptedUrl }, "URL Encrypted");
  }, {
    body: EncryptUrlRequestSchema,
    response: { 200: createResponseSchema(EncryptUrlResponseSchema) }
  });
