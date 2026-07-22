'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireActiveStaff } from '@/lib/admin-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { BUCKET } from '@/lib/staff-data';
import { parseDocumentBytes, isParseable, type ParsedFields } from '@/lib/parse-document';

/** Audit writes go through the service role: `authenticated` has SELECT-only
 *  on audit_log so the trail can't be edited by the app's own session. */
async function logAudit(
  actor: { id: string; email?: string },
  action: string,
  entityId: string,
  metadata: Record<string, unknown> = {}
) {
  const admin = createAdminClient();
  await admin.from('audit_log').insert({
    actor_id: actor.id,
    actor_email: actor.email ?? null,
    action,
    entity: 'staff',
    entity_id: entityId,
    metadata,
  });
}

const text = (fd: FormData, key: string) => {
  const v = String(fd.get(key) ?? '').trim();
  return v.length ? v : null;
};

/** Canonicalize a job title so "Chef", "chef" and "Chef " don't become three
 *  separate options. Collapses whitespace, then reuses the casing of any
 *  existing title that matches case-insensitively; otherwise saves the new one. */
async function canonicalJobTitle(
  supabase: Awaited<ReturnType<typeof requireActiveStaff>>['supabase'],
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

export async function saveStaff(formData: FormData) {
  const { supabase, user } = await requireActiveStaff();
  const id = text(formData, 'id');
  const jobTitle = await canonicalJobTitle(supabase, text(formData, 'job_title'));

  // NOTE: deliberately no SSN / date-of-birth fields. Those live only inside
  // uploaded documents, never as queryable columns.
  const payload = {
    full_name: String(formData.get('full_name') ?? '').trim(),
    job_title: jobTitle,
    // Checkboxes → text[]. Keep only known store values so a tampered form
    // can't inject arbitrary strings.
    locations: formData
      .getAll('locations')
      .map(String)
      .filter((v) => ['ossining', 'white-plains', 'mount-vernon'].includes(v)),
    employment_type: text(formData, 'employment_type'),
    status: text(formData, 'status') ?? 'active',
    email: text(formData, 'email'),
    phone: text(formData, 'phone'),
    address: text(formData, 'address'),
    emergency_contact_name: text(formData, 'emergency_contact_name'),
    emergency_contact_phone: text(formData, 'emergency_contact_phone'),
    hired_on: text(formData, 'hired_on'),
    notes: text(formData, 'notes'),
  };

  if (!payload.full_name) return;

  let staffId = id;
  if (id) {
    await supabase.from('staff').update(payload).eq('id', id);
    await logAudit(user, 'update_staff', id, { full_name: payload.full_name });
  } else {
    const { data } = await supabase
      .from('staff')
      .insert({ ...payload, created_by: user.id })
      .select('id')
      .single();
    staffId = data?.id ?? null;
    if (staffId) await logAudit(user, 'create_staff', staffId, { full_name: payload.full_name });
  }

  revalidatePath('/admin/staff');
  redirect(staffId ? `/admin/staff/${staffId}` : '/admin/staff');
}

export async function deleteStaff(id: string) {
  const { supabase, user } = await requireActiveStaff();

  // Remove the stored files too — deleting only the rows would strand private
  // documents in the bucket with nothing pointing at them.
  const { data: docs } = await supabase
    .from('staff_documents')
    .select('storage_path')
    .eq('staff_id', id);
  const paths = (docs ?? []).map((d) => d.storage_path);
  if (paths.length) await supabase.storage.from(BUCKET).remove(paths);

  await supabase.from('staff').delete().eq('id', id); // rows cascade
  await logAudit(user, 'delete_staff', id, { removed_documents: paths.length });
  revalidatePath('/admin/staff');
  redirect('/admin/staff');
}

/** Records metadata for a file the browser uploaded straight to storage.
 *  Direct-to-storage keeps large PDFs out of the serverless request body,
 *  and storage RLS still requires an active staff session. */
export async function recordDocument(input: {
  staff_id: string;
  storage_path: string;
  file_name: string;
  doc_type: string;
  mime_type: string | null;
  size_bytes: number | null;
}) {
  const { supabase, user } = await requireActiveStaff();
  const { error } = await supabase.from('staff_documents').insert({
    ...input,
    uploaded_by: user.id,
  });
  if (error) return { ok: false, message: error.message };

  await logAudit(user, 'upload_document', input.staff_id, {
    file_name: input.file_name,
    doc_type: input.doc_type,
  });
  revalidatePath(`/admin/staff/${input.staff_id}`);
  return { ok: true, message: 'Uploaded.' };
}

/** Mints a short-lived signed URL. The bucket is private, so this is the only
 *  way to read a document — and every view is recorded. */
export async function getDocumentUrl(documentId: string) {
  const { supabase, user } = await requireActiveStaff();
  const { data: doc } = await supabase
    .from('staff_documents')
    .select('storage_path, file_name, staff_id')
    .eq('id', documentId)
    .single();
  if (!doc) return { ok: false as const, message: 'Document not found.' };

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(doc.storage_path, 60); // 60s is enough to open it
  if (error || !data) return { ok: false as const, message: error?.message ?? 'Could not open.' };

  await logAudit(user, 'view_document', doc.staff_id, { file_name: doc.file_name });
  return { ok: true as const, url: data.signedUrl };
}

export async function deleteDocument(documentId: string) {
  const { supabase, user } = await requireActiveStaff();
  const { data: doc } = await supabase
    .from('staff_documents')
    .select('storage_path, file_name, staff_id')
    .eq('id', documentId)
    .single();
  if (!doc) return;

  await supabase.storage.from(BUCKET).remove([doc.storage_path]);
  await supabase.from('staff_documents').delete().eq('id', documentId);
  await logAudit(user, 'delete_document', doc.staff_id, { file_name: doc.file_name });
  revalidatePath(`/admin/staff/${doc.staff_id}`);
}

type ParseResult =
  | { ok: true; fields: ParsedFields }
  | { ok: false; message: string };

/** Read a stored document and let Claude extract non-sensitive basics. Returns a
 *  DRAFT for human review — it never writes to the profile on its own. */
export async function parseStaffDocument(documentId: string): Promise<ParseResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { ok: false, message: 'AI parsing is not configured yet (missing API key).' };
  }
  const { supabase, user } = await requireActiveStaff();

  const { data: doc } = await supabase
    .from('staff_documents')
    .select('storage_path, mime_type, file_name, staff_id')
    .eq('id', documentId)
    .single();
  if (!doc) return { ok: false, message: 'Document not found.' };
  if (!isParseable(doc.mime_type)) {
    return { ok: false, message: 'Only PDF, JPG, PNG, GIF or WebP files can be scanned.' };
  }

  const { data: file, error } = await supabase.storage.from(BUCKET).download(doc.storage_path);
  if (error || !file) return { ok: false, message: 'Could not read the document.' };

  try {
    const fields = await parseDocumentBytes(await file.arrayBuffer(), doc.mime_type!);
    // Log only which fields were found — never the extracted values themselves.
    await logAudit(user, 'parse_document', doc.staff_id, {
      file_name: doc.file_name,
      fields_found: Object.entries(fields).filter(([, v]) => v).map(([k]) => k),
    });
    return { ok: true, fields };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : 'Parsing failed.' };
  }
}

/** Apply reviewed fields to the profile. Only the keys the user kept are sent;
 *  each overwrites the current value. Runs after a human has looked at the draft. */
export async function applyParsedFields(staffId: string, fields: Partial<ParsedFields>) {
  const { supabase, user } = await requireActiveStaff();

  const update: Record<string, string> = {};
  for (const [k, v] of Object.entries(fields)) {
    if (typeof v === 'string' && v.trim()) update[k] = v.trim();
  }
  if (update.job_title) {
    update.job_title = (await canonicalJobTitle(supabase, update.job_title)) ?? update.job_title;
  }
  if (Object.keys(update).length === 0) return;

  await supabase.from('staff').update(update).eq('id', staffId);
  await logAudit(user, 'apply_parsed', staffId, { applied: Object.keys(update) });
  revalidatePath(`/admin/staff/${staffId}`);
}
