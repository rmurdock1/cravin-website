-- Reusable job-posting templates so HR doesn't start from scratch each time.
-- Internal-only (no anon access); active staff manage them.
create table public.job_templates (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  title            text,
  location         text,
  employment_type  public.employment_type default 'full-time',
  description      text,
  responsibilities text[] not null default '{}',
  requirements     text[] not null default '{}',
  perks            text[] not null default '{}',
  created_by       uuid references public.profiles(id),
  created_at       timestamptz not null default now()
);

alter table public.job_templates enable row level security;
create policy "job_templates_staff_all" on public.job_templates
  for all using (private.is_active_staff()) with check (private.is_active_staff());

grant select, insert, update, delete on public.job_templates to authenticated;
