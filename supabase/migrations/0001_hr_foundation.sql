-- ============================================================================
-- HR module — Phase 1 foundation
-- Security model: default-deny RLS, role-based access, PUBLIC read limited to
-- ACTIVE job postings only. Roles set only server-side (never via signup input).
-- ============================================================================

-- ---------- ROLES / PROFILES ----------
create type public.user_role as enum ('owner', 'hr_manager');

-- One row per auth user; source of truth for role-based access control.
create table public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  full_name  text,
  role       public.user_role not null default 'hr_manager',
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- SECURITY DEFINER helpers bypass RLS on profiles to avoid policy recursion.
-- They only ever reveal the *current* user's own role, so they leak nothing.
create or replace function public.is_owner()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'owner' and is_active = true
  );
$$;

create or replace function public.is_active_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and is_active = true
  );
$$;

alter table public.profiles enable row level security;

create policy "profiles_select_own"   on public.profiles for select using (id = auth.uid());
create policy "profiles_select_owner" on public.profiles for select using (public.is_owner());
create policy "profiles_write_owner"  on public.profiles for all
  using (public.is_owner()) with check (public.is_owner());

-- Auto-create a profile on new auth user. IMPORTANT: role is HARD-CODED to the
-- least-privileged 'hr_manager' and NEVER read from signup metadata, so a user
-- cannot self-escalate to owner. New accounts are is_active=FALSE by default —
-- they have ZERO access until an owner explicitly activates them (defense in
-- depth on top of disabled public signups). Owners are promoted only via server/SQL.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, role, is_active)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', 'hr_manager', false)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users for each row execute function public.handle_new_user();

-- ---------- JOB POSTINGS ----------
create type public.employment_type as enum ('full-time', 'part-time', 'flexible');

create table public.job_postings (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  location         text not null,  -- 'Ossining' | 'White Plains' | 'Mount Vernon' | 'All Locations'
  employment_type  public.employment_type not null default 'full-time',
  description      text not null,
  responsibilities text[] not null default '{}',
  requirements     text[] not null default '{}',
  perks            text[] not null default '{}',
  is_active        boolean not null default false,
  sort_order       int not null default 0,
  created_by       uuid references public.profiles(id),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table public.job_postings enable row level security;

-- Public (anon) may read ONLY active postings — this is what the careers page uses.
create policy "job_postings_public_read_active" on public.job_postings
  for select using (is_active = true);
-- Active staff (owner or hr_manager) may read everything, including drafts.
create policy "job_postings_staff_read_all" on public.job_postings
  for select using (public.is_active_staff());
-- Active staff may create / edit / delete postings.
create policy "job_postings_staff_write" on public.job_postings
  for all using (public.is_active_staff()) with check (public.is_active_staff());

-- ---------- AUDIT LOG ----------
create table public.audit_log (
  id         uuid primary key default gen_random_uuid(),
  actor_id   uuid,
  actor_email text,
  action     text not null,
  entity     text,
  entity_id  text,
  metadata   jsonb,
  created_at timestamptz not null default now()
);

alter table public.audit_log enable row level security;
-- Only owners can read the audit trail. Writes happen server-side (service role).
create policy "audit_log_owner_read" on public.audit_log for select using (public.is_owner());

-- ---------- updated_at maintenance ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql security definer set search_path = public as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger profiles_updated_at    before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger job_postings_updated_at before update on public.job_postings
  for each row execute function public.set_updated_at();

-- ---------- GRANTS (RLS remains the real gate) ----------
grant select on public.job_postings to anon;                       -- public careers page
grant select, insert, update, delete on public.job_postings to authenticated;
grant select, insert, update, delete on public.profiles     to authenticated;
grant select on public.audit_log to authenticated;
