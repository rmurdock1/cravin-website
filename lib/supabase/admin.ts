import { createClient } from '@supabase/supabase-js';

/** SERVER-ONLY service-role client. Bypasses RLS — never import into client
 *  components. Used for owner-only user management (create/invite users). */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
