-- Staff profiles + private document storage.
--
-- DELIBERATE OMISSION: there is no SSN and no date-of-birth column anywhere in
-- this schema, by design. Those values may exist INSIDE uploaded documents
-- (I-9s, W-4s), which live in a PRIVATE storage bucket reachable only through
-- short-lived signed URLs generated server-side. They are never extracted into
-- queryable columns, never logged, and never sent to any third party.

create table public.staff (
  id                      uuid primary key default gen_random_uuid(),
  full_name               text not null,
  job_title               text,
  location                text,                    -- ossining | white-plains | mount-vernon | all
  employment_type         text,                    -- full-time | part-time | seasonal
  status                  text not null default 'active',  -- active | inactive | former
  email                   text,
  phone                   text,
  address                 text,
  emergency_contact_name  text,
  emergency_contact_phone text,
  hired_on                date,
  notes                   text,
  created_by              uuid references public.profiles(id),
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create index staff_status_idx   on public.staff(status);
create index staff_location_idx on public.staff(location);

alter table public.staff enable row level security;
create policy "staff_read"  on public.staff for select using (private.is_active_staff());
create policy "staff_write" on public.staff for all
  using (private.is_active_staff()) with check (private.is_active_staff());

create trigger staff_updated_at before update on public.staff
  for each row execute function private.set_updated_at();

-- ---------- Documents (metadata only; bytes live in private storage) ----------
create table public.staff_documents (
  id           uuid primary key default gen_random_uuid(),
  staff_id     uuid not null references public.staff(id) on delete cascade,
  storage_path text not null unique,
  file_name    text not null,
  doc_type     text not null default 'other',  -- i9 | w4 | offer_letter | certification | id | other
  mime_type    text,
  size_bytes   bigint,
  uploaded_by  uuid references public.profiles(id),
  created_at   timestamptz not null default now()
);

create index staff_documents_staff_idx on public.staff_documents(staff_id);

alter table public.staff_documents enable row level security;
create policy "staff_documents_read"  on public.staff_documents for select using (private.is_active_staff());
create policy "staff_documents_write" on public.staff_documents for all
  using (private.is_active_staff()) with check (private.is_active_staff());

-- ---------- GRANTS (RLS remains the real gate; anon gets nothing) ----------
grant select, insert, update, delete on public.staff           to authenticated;
grant select, insert, update, delete on public.staff_documents to authenticated;

-- ---------- Private document bucket ----------
insert into storage.buckets (id, name, public)
values ('staff-documents', 'staff-documents', false)
on conflict (id) do nothing;

-- Only active staff may touch objects in this bucket. The bucket is private, so
-- reads still require a short-lived signed URL minted server-side.
create policy "staff_docs_read" on storage.objects for select
  using (bucket_id = 'staff-documents' and private.is_active_staff());
create policy "staff_docs_insert" on storage.objects for insert
  with check (bucket_id = 'staff-documents' and private.is_active_staff());
create policy "staff_docs_delete" on storage.objects for delete
  using (bucket_id = 'staff-documents' and private.is_active_staff());
