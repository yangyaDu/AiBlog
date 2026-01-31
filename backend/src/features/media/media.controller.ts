
import { Elysia } from "elysia";
import { Result, createResponseSchema } from "../../utils/response";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { BizError, ErrorCode } from "../../utils/types";
import { EncryptUrlRequestSchema, EncryptUrlResponseSchema } from "./media.model";

export const MediaController = new Elysia({ prefix: "/api/media" })
  .use(authMiddleware)
  .post("/encrypt-url", async ({ body, sessionInfo }) => {
    if (!sessionInfo) throw new BizError(ErrorCode.UNAUTHORIZED, "Unauthorized", 401);
    
    // Logic simulated here
    const plainUrl = body.url;
    if (!plainUrl) throw new BizError(ErrorCode.VALIDATION_ERROR, "URL is required", 400);

    const hash = btoa(plainUrl);
    const encryptedUrl = `SECURE::${hash}`;

    return Result.success({ encryptedUrl }, "URL Encrypted");
  }, {
    body: EncryptUrlRequestSchema,
    response: { 200: createResponseSchema(EncryptUrlResponseSchema) }
  });
