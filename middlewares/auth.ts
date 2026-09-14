import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Protected routes that require authentication
const PROTECTED_ROUTES = [
  "/dashboard",
  "/portfolio",
  "/transactions",
  "/workspaces",
  "/settings",
  "/api/dashboard",
  "/api/transactions",
  "/api/portfolio",
  "/api/workspaces",
  "/api/settings",
];

// Public routes that should redirect to dashboard if already authenticated
const AUTH_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password"];

// Auth middleware - check session cookie and handle redirects
export async function authMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip auth check for API auth endpoints
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }
  
  // Check for session cookie (better-auth session)
  const sessionCookie = request.cookies.get("better-auth.session_token");
  const hasSession = !!sessionCookie;
  
  // If user has session and tries to access auth routes, redirect to dashboard
  if (hasSession && AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If user doesn't have session and tries to access protected route, redirect to login
  if (!hasSession && PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}
