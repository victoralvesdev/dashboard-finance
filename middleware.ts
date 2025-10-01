import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public routes that don't require authentication
const publicRoutes = ["/sign-in", "/sign-up"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Allow API routes for authentication
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // For protected routes, check if user is authenticated
  // We'll use a simple cookie-based auth check
  const userCookie = request.cookies.get("user");

  if (!userCookie) {
    // Redirect to sign-in if not authenticated
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
