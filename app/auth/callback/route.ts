import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// Supabase magic-link redirects here with a `code`; exchange it for a session
// (sets the auth cookies) and forward to the admin.
const fail = (origin: string, message: string) =>
  NextResponse.redirect(`${origin}/admin/login?error=${encodeURIComponent(message)}`);

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/admin';

  // The provider can hand back its own failure (consent denied, bad config…).
  const providerError = searchParams.get('error_description') ?? searchParams.get('error');
  if (providerError) return fail(origin, providerError);

  if (!code) return fail(origin, 'That sign-in link was missing its code. Please try again.');

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    // Sign-in codes are single-use, so a refresh or a second click on the same
    // link lands here even though the first attempt worked. Say so plainly —
    // an opaque error here is expensive to debug later.
    const reused = /code verifier|invalid request|expired|already/i.test(error.message);
    return fail(
      origin,
      reused
        ? 'That sign-in link was already used or has expired. Please sign in again.'
        : error.message
    );
  }
  return NextResponse.redirect(`${origin}${next}`);
}
