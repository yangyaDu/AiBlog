
import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { getRouteConfig } from "../config/route.config";
import { BizError, ErrorCode } from "../utils/types";

// Declare Bun global
declare const Bun: any;

export const authMiddleware = new Elysia()
  .use(
    jwt({
      name: "jwt",
      secret: Bun.env.JWT_SECRET || "devfolio-secret-key-change-me",
      schema: t.Object({
        id: t.String(),
        username: t.String(),
      }),
    })
  )
  .derive(async ({ jwt, request, headers }) => {
    const path = new URL(request.url).pathname;
    const config = getRouteConfig(path, request.method);

    // Skip auth for public routes
    if (config.authIgnored) {
        return { sessionInfo: null };
    }

    const authHeader = headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new BizError(ErrorCode.UNAUTHORIZED, "Missing or invalid authorization header", 401);
    }

    const token = authHeader.split(" ")[1];
    const payload = await jwt.verify(token);

    if (!payload) {
      throw new BizError(ErrorCode.UNAUTHORIZED, "Invalid or expired token", 401);
    }

    return { sessionInfo: payload };
  });
