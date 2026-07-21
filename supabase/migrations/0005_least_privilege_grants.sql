-- Tighten table privileges to least privilege.
--
-- Supabase's default privileges grant ALL on every new table in `public` to
-- both `anon` and `authenticated`. RLS is the real gate for SELECT/INSERT/
-- UPDATE/DELETE, so nothing was leaking — but two problems remained:
--
--   1. TRUNCATE IS NOT SUBJECT TO RLS. Any holder of the `authenticated` role
--      — including a signed-up-but-not-yet-activated user sitting on the
--      "Access pending" screen — could truncate staff, profiles or audit_log.
--   2. Blanket grants make RLS a single point of failure: one mistaken policy
--      (or RLS accidentally disabled) exposes full read/write to the public.
--
-- After this migration `anon` can read published job postings and nothing else.

-- ---------- anon: revoke everything, then re-grant only the careers feed ----------
revoke all on public.profiles        from anon;
revoke all on public.audit_log       from anon;
revoke all on public.staff           from anon;
revoke all on public.staff_documents from anon;
revoke all on public.job_templates   from anon;
revoke all on public.job_postings    from anon;
grant select on public.job_postings to anon;   -- public careers page (RLS limits to active)

-- ---------- authenticated: drop TRUNCATE / REFERENCES / TRIGGER everywhere ----------
revoke truncate, references, trigger on
  public.profiles, public.audit_log, public.staff,
  public.staff_documents, public.job_templates, public.job_postings
from authenticated;

-- audit_log is append-only, and only ever written server-side via service_role.
revoke insert, update, delete on public.audit_log from authenticated;

-- ---------- stop future tables inheriting blanket anon grants ----------
alter default privileges in schema public revoke all on tables from anon;
