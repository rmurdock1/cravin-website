-- Staff refinements: reusable job titles + multi-location assignment.

-- ---------- Reusable job titles ----------
-- Grows as HR uses it: saving a staff member with a new title adds it here, so
-- next time it appears in the title picker.
create table public.job_titles (
  title      text primary key,
  created_at timestamptz not null default now()
);
alter table public.job_titles enable row level security;
create policy "job_titles_read"  on public.job_titles for select using (private.is_active_staff());
create policy "job_titles_write" on public.job_titles for all
  using (private.is_active_staff()) with check (private.is_active_staff());

-- ---------- Multi-location: staff.location (text) -> staff.locations (text[]) ----------
alter table public.staff add column locations text[] not null default '{}';
update public.staff set locations = case
  when location is null or location = '' then '{}'
  when location = 'all' then array['ossining','white-plains','mount-vernon']
  else array[location]
end;
alter table public.staff drop column location;
create index staff_locations_gin on public.staff using gin (locations);

-- ---------- Grants (least privilege, matching migration 0005) ----------
grant select, insert, update, delete on public.job_titles to authenticated;
revoke truncate, references, trigger on public.job_titles from authenticated;

-- Future public tables: no blanket grants to either role (0005 covered anon).
alter default privileges in schema public revoke truncate, references, trigger on tables from authenticated;
alter default privileges in schema public revoke all on tables from anon;
