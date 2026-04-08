import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createDdsSupabaseAdmin } from '@dds/auth/supabase';

// Only the landing page and the partner registration form endpoint are public.
// Everything else (including all other routes and APIs) is locked behind auth.
// Sign-in/sign-up and webhooks remain reachable so the lock mechanism itself works.
const isPublicRoute = createRouteMatcher([
  '/',
  '/api/register-partner',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
]);

const ALLOWED_LEVELS = new Set(['MEMBER', 'MEMBER_PLUS', 'ADMIN']);

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  const { userId } = await auth();

  if (!userId) {
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(signInUrl);
  }

  let accessLevel: string | null = null;

  try {
    const supabase = createDdsSupabaseAdmin();
    const { data } = await supabase
      .from('users')
      .select('access_level')
      .eq('clerk_id', userId)
      .maybeSingle();
    accessLevel = (data?.access_level as string | undefined) ?? null;
  } catch (error) {
    console.error('[blackdot-partners middleware] supabase lookup failed:', error);
  }

  if (!accessLevel || !ALLOWED_LEVELS.has(accessLevel)) {
    return NextResponse.redirect(new URL('/pending', req.url));
  }

  const response = NextResponse.next();
  response.headers.set('x-user-clerk-id', userId);
  response.headers.set('x-user-access-level', accessLevel);
  return response;
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|otf)$).*)',
    '/api/:path*',
  ],
};
