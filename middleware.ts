import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Refreshes the Supabase session cookie and guards /admin routes: any
// unauthenticated request to /admin (except the login page) is redirected to
// /admin/login. Role/active-status checks happen in the admin pages + RLS.
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isLogin = path === '/admin/login' || path.startsWith('/admin/login/');

  // Defense-in-depth: if a magic-link `code` lands on an /admin page instead of
  // /auth/callback (e.g. Supabase fell back to a Site URL pointing at /admin/login),
  // forward it to the callback so the session is actually exchanged. Only works
  // when the host is correct — a wrong Site URL host must be fixed in Supabase.
  const code = request.nextUrl.searchParams.get('code');
  if (code) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/callback';
    url.search = '';
    url.searchParams.set('code', code);
    url.searchParams.set('next', '/admin');
    return NextResponse.redirect(url);
  }

  if (path.startsWith('/admin') && !isLogin && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*'],
};
