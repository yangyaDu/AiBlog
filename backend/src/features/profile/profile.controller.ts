import { Elysia, t } from "elysia";
import { ProfileService } from "./profile.service";
import { UpdateProfileSchema, UpdateProfileDTO, ProfileResponseSchema } from "./profile.model";
import { Result, createResponseSchema } from "../../utils/response";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { ErrorCode, getErrorInfo } from "../../utils/types";

export const ProfileController = new Elysia({ prefix: "/api/profile" })
  .use(authMiddleware)
  .get("/", async ({ set }) => {
    const [err, data] = await ProfileService.getProfile();
    // Assuming getProfile implies success in current logic, but handling for consistency
    if (err !== ErrorCode.SUCCESS) {
      const errorInfo = getErrorInfo(err);
      set.status = errorInfo.status;
      return Result.error(err, errorInfo.message, null);
    }
    
    return Result.success(data);
  }, {
    response: {
      200: createResponseSchema(ProfileResponseSchema)
    }
  })
  .put(
    "/",
    async ({ body, user, set }: any) => {
      if (!user) {
        const errorInfo = getErrorInfo(ErrorCode.UNAUTHORIZED);
        set.status = errorInfo.status;
        return Result.error(ErrorCode.UNAUTHORIZED, errorInfo.message, null);
      }
      
      const [err] = await ProfileService.updateProfile(body);
      if (err !== ErrorCode.SUCCESS) {
        const errorInfo = getErrorInfo(err);
        set.status = errorInfo.status;
        return Result.error(err, errorInfo.message, null);
      }

      return Result.success(null, "Profile updated");
    },
    {
      body: UpdateProfileSchema,
      response: {
        200: createResponseSchema(t.Null())
      }
    }
  );