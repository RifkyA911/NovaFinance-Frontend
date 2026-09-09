import type { NextRequest } from "next/server";
import { corsMiddleware } from "./middlewares/cors";
import { authMiddleware } from "./middlewares/auth";
import { apiProxyMiddleware } from "./middlewares/api-proxy";

// Manual middleware chain - execute in order
export async function proxy(request: NextRequest) {
  // Step 1: CORS
  const response = await corsMiddleware();
  
  // Step 2: Auth (only if CORS didn't return a redirect)
  if (response.status === 200 || response.status === 304) {
    const authResponse = await authMiddleware(request);
    if (authResponse.status !== 200 && authResponse.status !== 304) {
      return authResponse;
    }
  }
  
  // Step 3: API Proxy
  const apiResponse = await apiProxyMiddleware(request);
  return apiResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
