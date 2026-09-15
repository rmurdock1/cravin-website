'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireActiveStaff } from '@/lib/admin-auth';

type ActionError = { ok: false; message: string };
type ActionResult = { ok: true } | ActionError;

function list(formData: FormData, name: string): string[] {
  return formData.getAll(name).map((v) => String(v).trim()).filter(Boolean);
}

function fieldsFrom(formData: FormData) {
  return {
    title: String(formData.get('title') ?? '').trim(),
    location: String(formData.get('location') ?? '').trim(),
    employment_type: String(formData.get('employment_type') ?? 'full-time'),
    description: String(formData.get('description') ?? '').trim(),
    responsibilities: list(formData, 'responsibilities'),
    requirements: list(formData, 'requirements'),
    perks: list(formData, 'perks'),
  };
}

// Writes go through the user's session, so RLS (is_active_staff) stays the real
// gate. Every write checks its result: a database error, or an update/delete
// that matched no row (deleted meanwhile, or access revoked), comes back as a
// message instead of looking like it worked.
const NO_ROW = 'it no longer exists or you no longer have access.';

export async function savePosting(formData: FormData): Promise<ActionError | void> {
  const { supabase, user } = await requireActiveStaff();
  const id = formData.get('id') as string | null;
  const intent = String(formData.get('intent') ?? 'save'); // save | publish | unpublish
  const currentActive = formData.get('current_active') === 'true';

  const is_active =
    intent === 'publish' ? true : intent === 'unpublish' ? false : id ? currentActive : false;

  const row = { ...fieldsFrom(formData), is_active };
  if (!row.title || !row.location || !row.description) {
    return { ok: false, message: 'Job title, location and short description are required.' };
  }

  const verb = intent === 'publish' ? 'publish' : intent === 'unpublish' ? 'unpublish' : 'save';
  if (id) {
    const { data, error } = await supabase.from('job_postings').update(row).eq('id', id).select('id');
    if (error) return { ok: false, message: `Couldn't ${verb} the posting: ${error.message}` };
    if (!data?.length) return { ok: false, message: `Couldn't ${verb} the posting: ${NO_ROW}` };
  } else {
    const { error } = await supabase.from('job_postings').insert({ ...row, created_by: user.id });
    if (error) return { ok: false, message: `Couldn't ${verb} the posting: ${error.message}` };
  }

  revalidatePath('/careers');
  revalidatePath('/admin/postings');
  redirect('/admin/postings');
}

export async function togglePosting(id: string, next: boolean): Promise<ActionResult> {
  const { supabase } = await requireActiveStaff();
  const verb = next ? 'publish' : 'unpublish';
  const { data, error } = await supabase
    .from('job_postings')
    .update({ is_active: next })
    .eq('id', id)
    .select('id');
  if (error) return { ok: false, message: `Couldn't ${verb} the posting: ${error.message}` };
  if (!data?.length) return { ok: false, message: `Couldn't ${verb} the posting: ${NO_ROW}` };

  revalidatePath('/careers');
  revalidatePath('/admin/postings');
  return { ok: true };
}

export async function deletePosting(id: string): Promise<ActionResult> {
  const { supabase } = await requireActiveStaff();
  const { data, error } = await supabase.from('job_postings').delete().eq('id', id).select('id');
  if (error) return { ok: false, message: `Couldn't delete the posting: ${error.message}` };
  if (!data?.length) return { ok: false, message: `Couldn't delete the posting: ${NO_ROW}` };

  revalidatePath('/careers');
  revalidatePath('/admin/postings');
  return { ok: true };
}

// Save the current form content as a reusable template (does not navigate away).
export async function saveTemplate(formData: FormData): Promise<ActionResult> {
  const { supabase, user } = await requireActiveStaff();
  const name = String(formData.get('template_name') ?? '').trim() || 'Untitled template';
  const { error } = await supabase
    .from('job_templates')
    .insert({ name, ...fieldsFrom(formData), created_by: user.id });
  if (error) return { ok: false, message: `Couldn't save the template: ${error.message}` };

  revalidatePath('/admin/postings');
  revalidatePath('/admin/postings/new');
  return { ok: true };
}

export async function updateTemplate(formData: FormData): Promise<ActionError | void> {
  const { supabase } = await requireActiveStaff();
  const id = String(formData.get('id') ?? '');
  const name = String(formData.get('template_name') ?? '').trim() || 'Untitled template';
  const { data, error } = await supabase
    .from('job_templates')
    .update({ name, ...fieldsFrom(formData) })
    .eq('id', id)
    .select('id');
  if (error) return { ok: false, message: `Couldn't save the template: ${error.message}` };
  if (!data?.length) return { ok: false, message: `Couldn't save the template: ${NO_ROW}` };

  revalidatePath('/admin/postings');
  revalidatePath('/admin/postings/new');
  redirect('/admin/postings');
}

export async function deleteTemplate(id: string): Promise<ActionResult> {
  const { supabase } = await requireActiveStaff();
  const { data, error } = await supabase.from('job_templates').delete().eq('id', id).select('id');
  if (error) return { ok: false, message: `Couldn't delete the template: ${error.message}` };
  if (!data?.length) return { ok: false, message: `Couldn't delete the template: ${NO_ROW}` };

  revalidatePath('/admin/postings');
  revalidatePath('/admin/postings/new');
  return { ok: true };
}
