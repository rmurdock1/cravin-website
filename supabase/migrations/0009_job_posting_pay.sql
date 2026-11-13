-- Optional pay/compensation shown on job postings (and carried on templates).
-- Free-text so it can hold a range, an hourly rate, or "minimum wage" wording.
alter table public.job_postings add column if not exists pay_range text;
alter table public.job_templates add column if not exists pay_range text;
