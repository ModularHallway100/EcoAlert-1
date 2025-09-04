import { clerkMiddleware, createRouteMatcher, auth } from "@clerk/nextjs/server";

const publicRoutes = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/sitemap.xml",
  "/robots.txt",
  "/api/health",
  "/api/auth/clerk",
  "/api/auth/webhook",
  "/api/auth/sync",
  "/api/environment",
  "/api/environment/sensors",
  "/api/environment/websocket",
  "/api/pollution",
  "/api/educational/content",
  "/api/educational/analytics",
  "/api/social/posts",
  "/api/analytics",
  "/api/analytics/events",
  "/api/integrations",
  "/api/integrations/docs",
  "/api/integrations/webhooks",
  "/api/integrations/(.*)",
  "/api/user/profile",
  "/api/user/profile?userId=anonymous",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!publicRoutes(req)) {
    // Protect non-public routes
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};