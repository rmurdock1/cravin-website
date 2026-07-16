'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

function list(formData: FormData, name: string): string[] {
  return formData.getAll(name).map((v) => String(v).trim()).filter(Boolean);
}

// Writes go through the user's session — RLS (is_active_staff) is the real gate.
async function requireSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');
  return { supabase, user };
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

export async function savePosting(formData: FormData) {
  const { supabase, user } = await requireSession();
  const id = formData.get('id') as string | null;
  const intent = String(formData.get('intent') ?? 'save'); // save | publish | unpublish
  const currentActive = formData.get('current_active') === 'true';

  const is_active =
    intent === 'publish' ? true : intent === 'unpublish' ? false : id ? currentActive : false;

  const row = { ...fieldsFrom(formData), is_active };

  if (id) {
    await supabase.from('job_postings').update(row).eq('id', id);
  } else {
    await supabase.from('job_postings').insert({ ...row, created_by: user.id });
  }

  revalidatePath('/careers');
  revalidatePath('/admin/postings');
  redirect('/admin/postings');
}

export async function togglePosting(id: string, next: boolean) {
  const { supabase } = await requireSession();
  await supabase.from('job_postings').update({ is_active: next }).eq('id', id);
  revalidatePath('/careers');
  revalidatePath('/admin/postings');
}

export async function deletePosting(id: string) {
  const { supabase } = await requireSession();
  await supabase.from('job_postings').delete().eq('id', id);
  revalidatePath('/careers');
  revalidatePath('/admin/postings');
}

// Save the current form content as a reusable template (does not navigate away).
export async function saveTemplate(formData: FormData) {
  const { supabase, user } = await requireSession();
  const name = String(formData.get('template_name') ?? '').trim() || 'Untitled template';
  await supabase
    .from('job_templates')
    .insert({ name, ...fieldsFrom(formData), created_by: user.id });
  revalidatePath('/admin/postings/new');
}
