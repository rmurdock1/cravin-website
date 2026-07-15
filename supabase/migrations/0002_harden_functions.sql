-- Move SECURITY DEFINER helper + trigger functions out of the API-exposed
-- `public` schema into a private schema so they can't be invoked via
-- /rest/v1/rpc. RLS policies still reference them; triggers still fire.
-- (Resolves the "Public/Authenticated can execute SECURITY DEFINER function"
--  advisor warnings.)

create schema if not exists private;
grant usage on schema private to anon, authenticated;

-- Role helpers (used inside RLS policies → callers need EXECUTE)
create or replace function private.is_owner()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'owner' and is_active = true
  );
$$;
create or replace function private.is_active_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and is_active = true
  );
$$;
grant execute on function private.is_owner()        to anon, authenticated;
grant execute on function private.is_active_staff() to anon, authenticated;

-- Trigger functions (invoked only by triggers → no caller EXECUTE granted)
create or replace function private.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, role, is_active)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', 'hr_manager', false)
  on conflict (id) do nothing;
  return new;
end;
$$;
create or replace function private.set_updated_at()
returns trigger language plpgsql security definer set search_path = public as $$
begin new.updated_at = now(); return new; end;
$$;

-- Repoint triggers to the private functions
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function private.handle_new_user();

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles
  for each row execute function private.set_updated_at();

drop trigger if exists job_postings_updated_at on public.job_postings;
create trigger job_postings_updated_at before update on public.job_postings
  for each row execute function private.set_updated_at();

-- Repoint RLS policies to the private helpers
drop policy "profiles_select_owner" on public.profiles;
create policy "profiles_select_owner" on public.profiles for select using (private.is_owner());
drop policy "profiles_write_owner" on public.profiles;
create policy "profiles_write_owner" on public.profiles for all
  using (private.is_owner()) with check (private.is_owner());

drop policy "job_postings_staff_read_all" on public.job_postings;
create policy "job_postings_staff_read_all" on public.job_postings
  for select using (private.is_active_staff());
drop policy "job_postings_staff_write" on public.job_postings;
create policy "job_postings_staff_write" on public.job_postings
  for all using (private.is_active_staff()) with check (private.is_active_staff());

drop policy "audit_log_owner_read" on public.audit_log;
create policy "audit_log_owner_read" on public.audit_log for select using (private.is_owner());

-- Remove the API-exposed public versions
drop function public.is_owner();
drop function public.is_active_staff();
drop function public.handle_new_user();
drop function public.set_updated_at();
