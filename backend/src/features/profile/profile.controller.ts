import { Elysia, t } from "elysia";
import { ProfileService } from "./profile.service";
import { UpdateProfileSchema, UpdateProfileDTO, ProfileResponseSchema } from "./profile.model";
import { Result, createResponseSchema } from "../../utils/response";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { BizError, ErrorCode } from "../../utils/types";

export const ProfileController = new Elysia({ prefix: "/api/profile" })
  .use(authMiddleware)
  .get("/", async () => {
    const [err, data] = await ProfileService.getProfile();
    // Assuming getProfile implies success in current logic, but handling for consistency
    if (err !== ErrorCode.SUCCESS) throw new BizError(err, "Failed to fetch profile");
    
    return Result.success(data);
  }, {
    response: {
      200: createResponseSchema(ProfileResponseSchema)
    }
  })
  .put(
    "/",
    async ({ body, user }: any) => {
      if (!user) throw new BizError(ErrorCode.UNAUTHORIZED, "Unauthorized", 401);
      
      const [err] = await ProfileService.updateProfile(body);
      if (err !== ErrorCode.SUCCESS) throw new BizError(err, "Failed to update profile");

      return Result.success(null, "Profile updated");
    },
    {
      body: UpdateProfileSchema,
      response: {
        200: createResponseSchema(t.Null())
      }
    }
  );