import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
  if (pathname.startsWith('/admin')) {
    if (!ADMIN_EMAIL) {
      console.error("ADMIN_EMAIL environment variable is not configured.");
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
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
  if (user && isAuthRoute && !pathname.includes('/auth/logout')) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
