import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// API proxy middleware - proxy /api requests to backend
export async function apiProxyMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Only proxy API requests except internal Next.js /api/ai endpoints
  if (pathname.startsWith("/api") && !pathname.startsWith("/api/ai")) {
    const backendUrl = new URL(pathname + request.nextUrl.search, "http://localhost:8080");
    
    try {
      const response = await fetch(backendUrl.toString(), {
        method: request.method,
        headers: request.headers,
        body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
        credentials: 'include',
      });
      
      const data = await response.text();
      const nextResponse = new NextResponse(data, {
        status: response.status,
        headers: response.headers,
      });
      
      return nextResponse;
    } catch (error) {
      console.error("API proxy error:", error);
      return NextResponse.json({ error: "Backend connection failed" }, { status: 502 });
    }
  }
  
  return NextResponse.next();
}
