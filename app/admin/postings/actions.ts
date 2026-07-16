'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

function parseLines(v: FormDataEntryValue | null): string[] {
  return String(v ?? '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
}

// All writes go through the user's session — RLS (is_active_staff) is the real
// authorization gate; an inactive/anon caller simply affects zero rows.
async function requireSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');
  return { supabase, user };
}

export async function savePosting(formData: FormData) {
  const { supabase, user } = await requireSession();
  const id = formData.get('id') as string | null;

  const row = {
    title: String(formData.get('title') ?? '').trim(),
    location: String(formData.get('location') ?? '').trim(),
    employment_type: String(formData.get('employment_type') ?? 'full-time'),
    description: String(formData.get('description') ?? '').trim(),
    responsibilities: parseLines(formData.get('responsibilities')),
    requirements: parseLines(formData.get('requirements')),
    perks: parseLines(formData.get('perks')),
    is_active: formData.get('is_active') === 'on',
    sort_order: Number(formData.get('sort_order') ?? 0) || 0,
  };

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
