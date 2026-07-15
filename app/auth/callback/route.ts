import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// Supabase magic-link redirects here with a `code`; exchange it for a session
// (sets the auth cookies) and forward to the admin.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/admin';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }
  return NextResponse.redirect(`${origin}/admin/login?error=link`);
}
