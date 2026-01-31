
import { Elysia } from "elysia";
import { getRouteConfig } from "../config/route.config";
import { BizError, ErrorCode } from "../utils/types";

// Simple In-Memory Store: Map<IP_PATH, { count, expiresAt }>
const limitStore = new Map<string, { count: number; expiresAt: number }>();

const WINDOW_MS = 60 * 1000; // 1 Minute window

export const rateLimiterMiddleware = new Elysia()
  .onBeforeHandle({ as: 'global' }, ({ request, set, server }) => {
    const ip = server?.requestIP(request)?.address || 'unknown';
    const path = new URL(request.url).pathname;
    const config = getRouteConfig(path, request.method);

    const limit = config.rateLimit || 60; // Default 60 req/min
    const key = `${ip}:${path}`;
    const now = Date.now();

    const record = limitStore.get(key);

    // Clean up expired
    if (record && now > record.expiresAt) {
      limitStore.delete(key);
    }

    if (!limitStore.has(key)) {
      limitStore.set(key, { count: 1, expiresAt: now + WINDOW_MS });
    } else {
      const current = limitStore.get(key)!;
      if (current.count >= limit) {
        set.status = 429;
        throw new BizError(ErrorCode.RATE_LIMIT_EXCEEDED, "Too many requests, please try again later.", 429);
      }
      current.count++;
    }
  });
