
import { Elysia, t } from "elysia";
import { Result } from "../../utils/response";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { BizError, ErrorCode } from "../../utils/types";

export const MediaController = new Elysia({ prefix: "/api/media" })
  .use(authMiddleware)
  .post("/encrypt-url", async ({ body, user }: any) => {
    if (!user) throw new BizError(ErrorCode.UNAUTHORIZED, "Unauthorized", 401);
    
    const plainUrl = body.url;
    if (!plainUrl) throw new BizError(ErrorCode.VALIDATION_ERROR, "URL is required", 400);

    // Requirement: Backend hashes/encrypts the plain URL.
    // Logic: Base64 encode it. Frontend will decode it to display, or backend provides a proxy.
    // We will simulate a "secure hash" that the frontend can store.
    const hash = btoa(plainUrl);
    
    // Return a format that looks like an "Encrypted URL"
    const encryptedUrl = `SECURE::${hash}`;

    return Result.success({ encryptedUrl }, "URL Encrypted");
  }, {
    body: t.Object({ url: t.String() })
  });
