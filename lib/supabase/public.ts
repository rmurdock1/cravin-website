import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/** Anonymous Supabase client with no cookie/session handling — for public
 *  reads (e.g. the careers page). Keeps those pages cacheable (ISR) since it
 *  never touches cookies(). RLS still limits anon to active job postings. */
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
