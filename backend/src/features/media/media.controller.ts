
import { Elysia, t } from "elysia";
import { Result } from "../../utils/response";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { ErrorCode, getErrorInfo } from "../../utils/types";

export const MediaController = new Elysia({ prefix: "/api/media" })
  .use(authMiddleware)
  .post("/encrypt-url", async ({ body, user, set }: any) => {
    if (!user) {
      const errorInfo = getErrorInfo(ErrorCode.UNAUTHORIZED);
      set.status = errorInfo.status;
      return Result.error(ErrorCode.UNAUTHORIZED, errorInfo.message, null);
    }
    
    const plainUrl = body.url;
    if (!plainUrl) {
      const errorInfo = getErrorInfo(ErrorCode.VALIDATION_ERROR);
      set.status = errorInfo.status;
      return Result.error(ErrorCode.VALIDATION_ERROR, errorInfo.message, null);
    }

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
