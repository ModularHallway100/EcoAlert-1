import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)", "/"]);

export default clerkMiddleware((auth, req) => {
  // Check if the current route is public
  if (!isPublicRoute(req)) {
    // If user is not authenticated, redirect to sign-in
    if (!auth().userId) {
      const loginUrl = new URL("/sign-in", req.url);
      loginUrl.searchParams.set("redirect_url", req.url);
      return Response.redirect(loginUrl);
    }
  }
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};