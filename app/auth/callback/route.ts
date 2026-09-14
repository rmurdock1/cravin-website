import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { brand } from '@/lib/site-data';

// Supabase redirects here with a `code` after Google or email-link sign-in;
// exchange it for a session (sets the auth cookies) and forward to the admin.
const fail = (origin: string, message: string) =>
  NextResponse.redirect(`${origin}/admin/login?error=${encodeURIComponent(message)}`);

// `next` comes from the URL, so only allow same-site paths: "@evil.com" or
// "//evil.com" appended to the origin would send the user to another host.
const safeNext = (next: string | null) =>
  next && next.startsWith('/') && !next.startsWith('//') ? next : '/admin';

// Plain-language reason for each way a PKCE sign-in can fail. These used to be
// lumped into one "already used or expired" message, which hid the real cause.
function messageFor(error: { name: string; code?: string; message: string }) {
  // The browser that finished sign-in never started it (no verifier cookie):
  // e.g. Google opened inside another app, or an email link opened elsewhere.
  if (error.name === 'AuthPKCECodeVerifierMissingError') {
    return 'Sign-in has to finish in the same browser it started in. Open www.cravinjc.com/admin in Safari or Chrome directly (not inside another app like Gmail or Slack) and try again.';
  }
  switch (error.code) {
    case 'bad_code_verifier':
      return 'Sign-in was started more than once, so this attempt was cancelled. Please sign in again from a single tab.';
    case 'flow_state_expired':
      return 'That sign-in took too long and expired. Please try again.';
    case 'flow_state_not_found':
      return 'That sign-in link was already used. Please sign in again.';
    default:
      return error.message;
  }
}

export async function GET(request: Request) {
  const { searchParams, origin: requestOrigin } = new URL(request.url);
  // On Netlify, request.url carries the internal deploy host
  // (<deploy-id>--cravinjc.netlify.app), not the domain the browser used. The
  // session cookies belong to www, and middleware on the netlify.app host runs
  // before the canonical-host redirect, so redirecting there bounced a
  // just-signed-in user back to the login page. Always return to the public
  // site; the request origin is only right for local dev.
  const origin = process.env.NODE_ENV === 'production' ? brand.domain : requestOrigin;
  const code = searchParams.get('code');
  const next = safeNext(searchParams.get('next'));

  // The provider can hand back its own failure (consent denied, bad config…).
  const providerError = searchParams.get('error_description') ?? searchParams.get('error');
  if (providerError) return fail(origin, providerError);

  if (!code) return fail(origin, 'That sign-in link was missing its code. Please try again.');

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (!error) return NextResponse.redirect(`${origin}${next}`);

  // Record the real cause (never the code) so it shows in the Netlify function logs.
  console.error('auth callback: code exchange failed:', error.name, error.code ?? '-', error.message);

  // Codes are single-use, so a refresh, the back button, or a repeated request
  // for this callback fails even when the first attempt signed the user in.
  // If a session already exists, carry on instead of showing an error.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) return NextResponse.redirect(`${origin}${next}`);

  return fail(origin, messageFor(error));
}
