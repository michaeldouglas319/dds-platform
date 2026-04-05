import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

/**
 * Shared DDS middleware config.
 * Landing pages are public. Protected routes require auth.
 * Import and use in any app's middleware.ts.
 */
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/admin(.*)',
  '/puck(.*)',
  '/api/protected(.*)',
]);

export const ddsMiddleware = clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const middlewareConfig = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
