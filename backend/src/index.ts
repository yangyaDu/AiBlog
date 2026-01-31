
import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { staticPlugin } from "@elysiajs/static";
import { loggerMiddleware } from "./middlewares/logger.middleware";
import { rateLimiterMiddleware } from "./middlewares/rate-limiter.middleware";
import { authMiddleware } from "./middlewares/auth.middleware";

// Import Controllers from Features
import { AuthController } from "./features/auth/auth.controller";
import { ProfileController } from "./features/profile/profile.controller";
import { ProjectController } from "./features/projects/project.controller";
import { PostController } from "./features/posts/post.controller";
import { MediaController } from "./features/media/media.controller"; // Added

import { BizError, ErrorCode } from "./utils/types";
import { Result } from "./utils/response";

declare const Bun: any;

const API_PORT = parseInt(Bun.env.PORT || "3000");

const app = new Elysia()
  // 1. Global Utilities
  .use(cors())
  .use(swagger({
    documentation: {
      info: {
        title: 'DevFolio API',
        version: '1.0.0'
      }
    }
  }))
  .use(staticPlugin())
  
  // 2. Global Middleware (Order matters)
  .use(loggerMiddleware)
  .use(rateLimiterMiddleware)
  
  // 3. Auth Middleware (Injects 'user' into context or throws if protected)
  .use(authMiddleware)

  // 4. Global Error Handling
  .onError(({ code, error, set }) => {
    console.error(`[Error] ${code}:`, error);

    // Biz Logic Errors
    if (error instanceof BizError) {
      set.status = error.status;
      return Result.error(error.code, error.message);
    }
    
    // Validation Errors (Elysia)
    if (code === 'VALIDATION') {
      set.status = 400;
      return Result.error(ErrorCode.VALIDATION_ERROR, "Validation Failed", JSON.parse(error.message));
    }

    // 404
    if (code === 'NOT_FOUND') {
      set.status = 404;
      return Result.error(ErrorCode.NOT_FOUND, "Resource not found");
    }

    // Default
    set.status = 500;
    return Result.error(ErrorCode.UNKNOWN_ERROR, "Internal Server Error");
  })

  // 5. Register Feature Controllers
  .use(AuthController)
  .use(ProfileController)
  .use(ProjectController)
  .use(PostController)
  .use(MediaController)
  
  // 6. Start
  .listen(API_PORT);

console.log(
  `🦊 Backend is running in Feature-based MVC mode at ${app.server?.hostname}:${app.server?.port}`
);
