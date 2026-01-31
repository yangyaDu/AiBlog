
import { Elysia } from "elysia";

export const loggerMiddleware = new Elysia()
  .derive({ as: 'global' }, () => {
    return {
      startTime: Date.now()
    }
  })
  .onAfterHandle({ as: 'global' }, ({ request, startTime, path }) => {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Calculate Request Size
    const contentLength = request.headers.get('content-length');
    const size = contentLength ? `${(parseInt(contentLength) / 1024).toFixed(2)}KB` : '0KB';

    console.log(`[${new Date().toISOString()}] ${request.method} ${path} - ${duration}ms - Size: ${size}`);
  });
