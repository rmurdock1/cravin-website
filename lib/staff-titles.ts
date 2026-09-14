import type { createClient } from '@/lib/supabase/server';

/** Canonicalize a job title so "Chef", "chef" and "Chef " don't become three
 *  separate options. Collapses whitespace, then reuses the casing of any
 *  existing title that matches case-insensitively; otherwise saves the new one.
 *  Server-only: shared by the staff and applicant (hire) actions. */
export async function canonicalJobTitle(
  supabase: Awaited<ReturnType<typeof createClient>>,
  raw: string | null
): Promise<string | null> {
  if (!raw) return null;
  const cleaned = raw.replace(/\s+/g, ' ').trim();
  if (!cleaned) return null;

  // Exact case-insensitive match against the existing list (escape LIKE metachars).
  const escaped = cleaned.replace(/[\\%_]/g, '\\$&');
  const { data: existing } = await supabase
    .from('job_titles')
    .select('title')
    .ilike('title', escaped)
    .limit(1);

  if (existing && existing.length) return existing[0].title as string;
  await supabase.from('job_titles').insert({ title: cleaned });
  return cleaned;
}
