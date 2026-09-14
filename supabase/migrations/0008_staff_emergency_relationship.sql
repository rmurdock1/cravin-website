-- Staff: store the emergency contact's relationship (e.g. Spouse, Parent). Onboarding
-- forms capture it and Scan ✨ now extracts it. The existing table grants and RLS
-- policies on public.staff already cover a new column.
alter table public.staff add column if not exists emergency_contact_relationship text;
