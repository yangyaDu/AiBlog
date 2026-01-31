
/**
 * Route Configuration
 * Define specific rules for paths.
 * Keys are regex strings or exact paths.
 */
export const RouteConfig: Record<string, { rateLimit?: number; authIgnored?: boolean }> = {
  // Auth
  '/api/auth/login': { rateLimit: 5, authIgnored: true },
  '/api/auth/register': { rateLimit: 3, authIgnored: true },
  
  // Public Data (Read-only)
  '/api/profile': { rateLimit: 20, authIgnored: true }, // GET matches prefix, careful with PUT
  '/api/projects': { rateLimit: 20, authIgnored: true },
  '/api/posts': { rateLimit: 20, authIgnored: true },
  
  // Swagger
  '/swagger': { authIgnored: true },
};

export const getRouteConfig = (path: string, method: string) => {
  // Simple exact match or prefix match logic
  // For precise control, we might check method too, but keeping it simple for now
  
  // Special case: Write operations usually require Auth, even if the path exists in config for Read
  if (['POST', 'PUT', 'DELETE'].includes(method) && !path.includes('/auth/')) {
      return { rateLimit: 10, authIgnored: false };
  }

  for (const [key, config] of Object.entries(RouteConfig)) {
    if (path === key || path.startsWith(key)) {
      return config;
    }
  }
  
  // Default Config
  return { rateLimit: 60, authIgnored: false }; 
};
