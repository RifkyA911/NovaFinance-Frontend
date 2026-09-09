import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// API proxy middleware - proxy /api requests to backend
export async function apiProxyMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Only proxy API requests
  if (pathname.startsWith("/api")) {
    const backendUrl = new URL(pathname, "http://localhost:8080");
    
    try {
      const response = await fetch(backendUrl.toString(), {
        method: request.method,
        headers: request.headers,
        body: request.body,
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
