import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { staticPlugin } from "@elysiajs/static";
import { loggerMiddleware } from "./middlewares/logger.middleware";
import { rateLimiterMiddleware } from "./middlewares/rate-limiter.middleware";
import { authMiddleware } from "./middlewares/auth.middleware";

// Initialize Listeners (Side Effects)
import "./listeners/notification.listener";

// Feature Controllers
import { AuthController } from "./features/auth/auth.controller";
import { ProfileController } from "./features/profile/profile.controller";
import { ProjectController } from "./features/projects/project.controller";
import { PostController } from "./features/posts/post.controller";
import { MediaController } from "./features/media/media.controller";

// MVC Refactored Modules
import { FollowController } from "./features/follows/controller";
import { NotificationController } from "./features/notifications/controller";
import { LikeController } from "./features/likes/controller";
import { CommentController } from "./features/comments/controller";
import { HistoryController } from "./features/history/controller";

import { BizError, ErrorCode } from "./utils/types";
import { Result } from "./utils/response";

declare const Bun: any;

const API_PORT = parseInt(Bun.env.PORT || "3000");

const app = new Elysia()
  .use(cors())
  .use(swagger({ 
    documentation: { 
      info: { 
        title: 'DevFolio API', 
        version: '2.0.0',
        description: 'High-performance API for DevFolio powered by Bun & Elysia'
      },
      tags: [
        { name: 'Auth', description: 'Authentication endpoints' },
        { name: 'Profile', description: 'User profile management' },
        { name: 'Projects', description: 'Portfolio projects' },
        { name: 'Posts', description: 'Blog posts and articles' },
        { name: 'Interactions', description: 'Social features (Likes, Comments, Follows)' }
      ]
    } 
  }))
  .use(staticPlugin())
  
  // Middlewares
  .use(loggerMiddleware)
  .use(rateLimiterMiddleware)
  .use(authMiddleware)

  // Global Error Handler
  .onError(({ code, error, set }) => {
    console.error(`[Error] ${code}:`, error);
    if (error instanceof BizError) {
      set.status = error.status;
      return Result.error(error.code, error.message);
    }
    if (code === 'VALIDATION') {
      set.status = 400;
      return Result.error(ErrorCode.VALIDATION_ERROR, "Validation Failed", JSON.parse(error.message));
    }
    if (code === 'NOT_FOUND') {
      set.status = 404;
      return Result.error(ErrorCode.NOT_FOUND, "Resource not found");
    }
    set.status = 500;
    return Result.error(ErrorCode.UNKNOWN_ERROR, "Internal Server Error");
  })

  // Register Modules
  .use(AuthController)
  .use(ProfileController)
  .use(ProjectController)
  .use(PostController)
  .use(MediaController)
  
  // Social Modules
  .use(FollowController)
  .use(NotificationController)
  .use(LikeController)
  .use(CommentController)
  .use(HistoryController)
  
  .listen(API_PORT);

console.log(
  `🦊 Backend is running at ${app.server?.hostname}:${app.server?.port}`
);