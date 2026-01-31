
import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { staticPlugin } from "@elysiajs/static";
import { loggerMiddleware } from "./middlewares/logger.middleware";
import { rateLimiterMiddleware } from "./middlewares/rate-limiter.middleware";
import { authMiddleware } from "./middlewares/auth.middleware";

// Initialize Listeners
import "./listeners/notification.listener";

// Controllers
import { AuthController } from "./features/auth/auth.controller";
import { ProfileController } from "./features/profile/profile.controller";
import { ProjectController } from "./features/projects/project.controller";
import { PostController } from "./features/posts/post.controller";
import { MediaController } from "./features/media/media.controller";

// Refactored Modular Controllers
import { FollowController } from "./features/follows/controller";
import { NotificationController } from "./features/notifications/controller";
import { LikeController } from "./features/likes/controller";
import { CommentController } from "./features/comments/controller";
import { HistoryController } from "./features/history/controller";

import { BizError, ErrorCode, getErrorInfo } from "./utils/types";
import { Result } from "./utils/response";


const modules = [
  AuthController,
  ProfileController,
  ProjectController,
  PostController,
  MediaController,
  FollowController,
  NotificationController,
  LikeController,
  CommentController,
  HistoryController,
];

declare const Bun: any;

const API_PORT = parseInt(Bun.env.PORT || "3000");

const app = new Elysia()
  .use(cors())
  .use(swagger({ documentation: { info: { title: 'DevFolio API', version: '2.0.0' } } }))
  .use(staticPlugin())
  
  .use(loggerMiddleware)
  .use(rateLimiterMiddleware)
  .use(authMiddleware)

  .onError(({ code, error, set }) => {
    console.error(`[Error] ${code}:`, error);
    
    // 统一处理：根据错误类型获取错误码和消息
    let errorCode = ErrorCode.UNKNOWN_ERROR;
    let errorMessage = "Internal Server Error";
    let status = 500;
    
    if (error instanceof BizError) {
      errorCode = error.code;
      errorMessage = error.message;
      status = error.status;
    } else if (code === 'VALIDATION') {
      errorCode = ErrorCode.VALIDATION_ERROR;
      errorMessage = "Validation Failed";
      status = 400;
    } else if (code === 'NOT_FOUND') {
      errorCode = ErrorCode.NOT_FOUND;
      errorMessage = "Resource not found";
      status = 404;
    }
    
    set.status = status;
    return Result.error(errorCode, errorMessage, null);
  })

  // Feature Modules
  .use(modules)
  .listen(API_PORT);

console.log(
  `🦊 Backend is running in MVC mode at ${app.server?.hostname}:${app.server?.port}`
);
