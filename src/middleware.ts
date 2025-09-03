import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const publicRoutes = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/sitemap.xml",
  "/robots.txt",
  "/api/health",
  "/api/auth/clerk",
  "/api/auth/webhook",
  "/api/environment",
  "/api/environment/sensors",
  "/api/environment/websocket",
  "/api/pollution",
  "/api/educational/content",
  "/api/educational/analytics",
  "/api/social/posts",
  "/api/analytics",
  "/api/integrations",
  "/api/integrations/docs",
  "/api/integrations/webhooks",
  "/api/integrations/(.*)",
  "/api/user/profile",
]);

export default clerkMiddleware((auth, req) => {
  if (!publicRoutes(req)) {
    auth();
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