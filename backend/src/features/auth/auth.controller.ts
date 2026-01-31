
import { Elysia } from "elysia";
import { AuthService } from "./auth.service";
import { RegisterSchema, LoginSchema, RegisterDTO, LoginDTO, AuthResponseSchema } from "./auth.model";
import { Result, createResponseSchema } from "../../utils/response";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { BizError, ErrorCode } from "../../utils/types";

export const AuthController = new Elysia({ prefix: "/api/auth" })
  .use(authMiddleware)
  .post(
    "/register",
    async ({ body }) => {
      const [err, userId] = await AuthService.register(body as RegisterDTO);
      
      if (err !== ErrorCode.SUCCESS) {
        if (err === ErrorCode.USER_EXISTS) {
             throw new BizError(ErrorCode.USER_EXISTS, "User already exists", 409);
        }
        throw new BizError(err, "Registration failed");
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
    async ({ body, jwt }) => {
      const [err, user] = await AuthService.login(body as LoginDTO);
      
      if (err !== ErrorCode.SUCCESS || !user) {
        throw new BizError(ErrorCode.INVALID_CREDENTIALS, "Invalid username or password", 401);
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
