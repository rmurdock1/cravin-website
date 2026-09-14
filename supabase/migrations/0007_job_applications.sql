-- Careers applications, captured from the public /careers form.
--
-- WRITE PATH: rows are inserted ONLY server-side with the service role — by the
-- /api/careers/apply route handler and the one-time Netlify import script.
-- `anon` has no grants at all, and `authenticated` staff may read, annotate and
-- delete but never insert, so nobody can write applications straight through
-- the public REST API.

create table public.job_applications (
  id                    uuid primary key default gen_random_uuid(),
  full_name             text not null,
  email                 text not null,
  phone                 text,
  position              text,
  preferred_location    text,          -- ossining | white-plains | mount-vernon | null
  availability          text,          -- full-time | part-time | weekends | flexible | null
  experience            text,
  resume_path           text unique,   -- object in the private applicant-resumes bucket
  resume_file_name      text,
  resume_mime_type      text,
  resume_size_bytes     bigint,
  notes                 text,          -- HR-only
  viewed_at             timestamptz,   -- null = "New": HR hasn't opened it yet
  viewed_by             uuid references public.profiles(id) on delete set null,
  staff_id              uuid references public.staff(id) on delete set null,  -- set by "Hire"
  netlify_submission_id text unique,   -- makes the Netlify import idempotent
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index job_applications_created_idx on public.job_applications(created_at desc);
create index job_applications_new_idx on public.job_applications(created_at)
  where viewed_at is null and staff_id is null;

alter table public.job_applications enable row level security;
create policy "job_applications_read"   on public.job_applications for select
  using (private.is_active_staff());
create policy "job_applications_update" on public.job_applications for update
  using (private.is_active_staff()) with check (private.is_active_staff());
create policy "job_applications_delete" on public.job_applications for delete
  using (private.is_active_staff());

create trigger job_applications_updated_at before update on public.job_applications
  for each row execute function private.set_updated_at();

-- ---------- GRANTS (least privilege, matching 0005/0006) ----------
revoke all on public.job_applications from anon;
revoke insert, truncate, references, trigger on public.job_applications from authenticated;
grant select, update, delete on public.job_applications to authenticated;

-- ---------- Private resume bucket ----------
-- Size and type limits are enforced by Storage itself, as a backstop to the
-- route handler's own checks.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'applicant-resumes', 'applicant-resumes', false, 5242880,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do nothing;

-- Staff can open (via signed URL) and delete resumes. No insert policy: uploads
-- come only from the service role.
create policy "applicant_resumes_read" on storage.objects for select
  using (bucket_id = 'applicant-resumes' and private.is_active_staff());
create policy "applicant_resumes_delete" on storage.objects for delete
  using (bucket_id = 'applicant-resumes' and private.is_active_staff());
