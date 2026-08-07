import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-url.supabase.co";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with cross-browser cookies, so just do it exactly like this.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  const isAuthRoute = pathname.startsWith('/auth');
  const isPublicRoute =
    pathname === '/' ||
    pathname === '/about' ||
    pathname === '/features' ||
    pathname === '/privacy' ||
    pathname === '/terms' ||
    pathname === '/contact';

  const isApiRoute = pathname.startsWith('/api');

  // --- VULN-02 FIX: Server-side admin route protection ---
  // Any request to /admin must come from the designated admin user.
  // This is enforced at the middleware level, not just client-side.
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@vitalcore.ai";
  if (pathname.startsWith('/admin')) {
    if (!user || user.email !== ADMIN_EMAIL) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  // Redirect unauthenticated users to login for protected routes.
  // Note: API routes handle their own auth internally via supabase.auth.getUser().
  if (!user && !isAuthRoute && !isPublicRoute && !isApiRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    return NextResponse.redirect(url);
  }

  // If user is logged in but tries to access /auth/login or /auth/signup, redirect to dashboard
  // Exception: /auth/onboarding (still needs to complete profile)
  // Exception: /auth/get-started and /auth (choice pages — will redirect themselves via Link)
  const isChoiceRoute = pathname === '/auth' || pathname === '/auth/get-started';
  if (user && isAuthRoute && !pathname.includes('/auth/logout') && pathname !== '/auth/onboarding' && !isChoiceRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
