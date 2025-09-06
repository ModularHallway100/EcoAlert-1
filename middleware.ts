import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Helper function to get cookie value
function getCookie(request: NextRequest, name: string): string | null {
  const cookie = request.cookies.get(name);
  return cookie?.value || null;
}

export function middleware(request: NextRequest) {
  // Define public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/sign-in",
    "/sign-up",
    "/api/auth",
    "/api/analytics/events"
  ];

  const { pathname } = request.nextUrl;

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(route => {
    if (route.endsWith("(.*)")) {
      const regex = new RegExp(route.replace("(.*)", ".*"));
      return regex.test(pathname);
    }
    return pathname === route || pathname.startsWith(route + "/");
  });

  // If it's a public route, allow access
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // For API routes, authenticate via token
  if (pathname.startsWith("/api/")) {
    const token = getCookie(request, "auth-token");
    
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify token for protected API routes
    const protectedApiRoutes = [
      "/api/user",
      "/api/analytics/reports",
      "/api/pollution",
      "/api/environment"
    ];

    const isProtectedApiRoute = protectedApiRoutes.some(route =>
      pathname.startsWith(route)
    );

    if (isProtectedApiRoute) {
      // In a real implementation, you would verify the token here
      // For now, we'll just check if it exists
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("Authorization", `Bearer ${token}`);
      
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    return NextResponse.next();
  }

  // For all other client routes, check if user is authenticated
  const token = getCookie(request, "auth-token");
  
  if (!token) {
    // Redirect to sign-in if not authenticated
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Verify token for protected routes
  const protectedRoutes = [
    "/dashboard",
    "/community",
    "/settings",
    "/pollution-map",
    "/onboarding"
  ];

  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    // In a real implementation, you would verify the token here
    // For now, we'll just check if it exists
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api (API routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
};