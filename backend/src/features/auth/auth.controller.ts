
import { Elysia } from "elysia";
import { AuthService } from "./auth.service";
import { RegisterSchema, LoginSchema, RegisterDTO, LoginDTO, AuthResponseSchema } from "./auth.model";
import { Result, createResponseSchema } from "../../utils/response";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { ErrorCode, getErrorInfo } from "../../utils/types";

export const AuthController = new Elysia({ prefix: "/api/auth" })
  .use(authMiddleware)
  .post(
    "/register",
    async ({ body, set }) => {
      const [err, userId] = await AuthService.register(body);
      
      if (err !== ErrorCode.SUCCESS) {
        const errorInfo = getErrorInfo(err);
        set.status = errorInfo.status;
        return Result.error(err, errorInfo.message, null);
      }

      return Result.success({ userId }, "Registered successfully");
    },
    {
      body: RegisterSchema,
      response: {
        200: createResponseSchema(AuthResponseSchema)
      }
    }
  )
  .post(
    "/login",
    async ({ body, jwt, set }) => {
      const [err, user] = await AuthService.login(body as LoginDTO);
      
      if (err !== ErrorCode.SUCCESS || !user) {
        const errorInfo = getErrorInfo(ErrorCode.INVALID_CREDENTIALS);
        set.status = errorInfo.status;
        return Result.error(ErrorCode.INVALID_CREDENTIALS, errorInfo.message, null);
      }
      
      const token = await jwt.sign({
        id: user.id,
        username: user.username,
      });

      return Result.success({ token, user });
    },
    {
      body: LoginSchema,
      response: {
        200: createResponseSchema(AuthResponseSchema)
      }
    }
  );
