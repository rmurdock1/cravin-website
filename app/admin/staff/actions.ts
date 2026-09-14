'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireActiveStaff } from '@/lib/admin-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  BUCKET,
  EMPLOYMENT_TYPES,
  LOCATIONS,
  hasParsedValue,
  type ParsedFields,
} from '@/lib/staff-data';
import { canonicalJobTitle } from '@/lib/staff-titles';
import { parseDocumentBytes, isParseable } from '@/lib/parse-document';

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

type Supabase = Awaited<ReturnType<typeof requireActiveStaff>>['supabase'];
type ActionError = { ok: false; message: string };

/** "Add Staff" creates an empty draft row immediately and drops the user on the
 *  full editor — so they can upload a document and scan-to-prefill, or type
 *  fields, and attach documents, all on one page. The draft has an empty name
 *  until saved; saveStaff requires a name. An abandoned draft stays nameless:
 *  the Staff list shows it under "Unsaved drafts" to continue or delete. */
export async function createDraftStaff() {
  const { supabase, user } = await requireActiveStaff();
  const { data } = await supabase
    .from('staff')
    .insert({ full_name: '', status: 'active', created_by: user.id })
    .select('id')
    .single();
  redirect(data ? `/admin/staff/${data.id}/edit` : '/admin/staff');
}

export type SaveStaffState = ActionError | null;

export async function saveStaff(_prev: SaveStaffState, formData: FormData): Promise<SaveStaffState> {
  const { supabase, user } = await requireActiveStaff();
  const id = text(formData, 'id');
  const fullName = String(formData.get('full_name') ?? '').trim();
  if (!fullName) return { ok: false, message: 'Full name is required.' };

  // NOTE: deliberately no SSN / date-of-birth fields. Those live only inside
  // uploaded documents, never as queryable columns.
  const payload = {
    full_name: fullName,
    job_title: await canonicalJobTitle(supabase, text(formData, 'job_title')),
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
    emergency_contact_relationship: text(formData, 'emergency_contact_relationship'),
    hired_on: text(formData, 'hired_on'),
    notes: text(formData, 'notes'),
  };

  // Failures come back to the form instead of redirecting as if the save worked.
  let staffId = id;
  if (id) {
    // .select() so an update that matched no row (deleted profile, lost access)
    // counts as a failure, not a silent no-op.
    const { data, error } = await supabase.from('staff').update(payload).eq('id', id).select('id');
    if (error) return { ok: false, message: `Couldn't save the profile: ${error.message}` };
    if (!data?.length) return { ok: false, message: "Couldn't save: this profile no longer exists or you no longer have access." };
    await logAudit(user, 'update_staff', id, { full_name: payload.full_name });
  } else {
    const { data, error } = await supabase
      .from('staff')
      .insert({ ...payload, created_by: user.id })
      .select('id')
      .single();
    if (error || !data) return { ok: false, message: `Couldn't save the profile: ${error?.message ?? 'no row returned'}` };
    staffId = data.id as string;
    await logAudit(user, 'create_staff', staffId, { full_name: payload.full_name });
  }

  revalidatePath('/admin/staff');
  redirect(`/admin/staff/${staffId}`);
}

/** Delete a staff row and its stored documents. The row goes first (document
 *  rows cascade) so a failed delete never leaves a profile whose files are gone;
 *  the files are removed after, so they aren't stranded in the bucket.
 *  `draftOnly` makes the delete match only an unsaved (nameless) draft. */
async function removeStaffAndFiles(supabase: Supabase, id: string, draftOnly: boolean) {
  const { data: docs } = await supabase
    .from('staff_documents')
    .select('storage_path')
    .eq('staff_id', id);
  const paths = (docs ?? []).map((d) => d.storage_path as string);

  let query = supabase.from('staff').delete().eq('id', id);
  if (draftOnly) query = query.eq('full_name', '');
  const { data, error } = await query.select('id');
  if (error) return { ok: false as const, message: error.message };
  if (!data?.length) return { ok: false as const, message: 'Nothing was deleted.' };

  if (paths.length) await supabase.storage.from(BUCKET).remove(paths);
  return { ok: true as const, removedDocuments: paths.length };
}

export async function deleteStaff(id: string): Promise<ActionError | void> {
  const { supabase, user } = await requireActiveStaff();
  const res = await removeStaffAndFiles(supabase, id, false);
  if (!res.ok) return { ok: false, message: `Couldn't delete the profile: ${res.message}` };

  await logAudit(user, 'delete_staff', id, { removed_documents: res.removedDocuments });
  revalidatePath('/admin/staff');
  redirect('/admin/staff');
}

/** Throw away an unsaved Add Staff draft and anything uploaded to it. Only ever
 *  deletes a nameless draft, never a saved profile. */
export async function discardDraft(id: string): Promise<ActionError | void> {
  const { supabase, user } = await requireActiveStaff();
  const res = await removeStaffAndFiles(supabase, id, true);
  if (!res.ok) {
    return {
      ok: false,
      message:
        res.message === 'Nothing was deleted.'
          ? "This isn't an unsaved draft (it may already be saved or deleted)."
          : `Couldn't discard the draft: ${res.message}`,
    };
  }

  await logAudit(user, 'discard_draft', id, { removed_documents: res.removedDocuments });
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
  const { data, error } = await supabase
    .from('staff_documents')
    .insert({ ...input, uploaded_by: user.id })
    .select('id')
    .single();
  if (error || !data) return { ok: false as const, message: error?.message ?? 'Could not record the upload.' };

  await logAudit(user, 'upload_document', input.staff_id, {
    file_name: input.file_name,
    doc_type: input.doc_type,
  });
  revalidatePath(`/admin/staff/${input.staff_id}`);
  // The id lets Add Staff scan the new document straight away.
  return { ok: true as const, message: 'Uploaded.', id: data.id as string };
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
      fields_found: Object.entries(fields).filter(([, v]) => hasParsedValue(v)).map(([k]) => k),
    });
    return { ok: true, fields };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : 'Parsing failed.' };
  }
}

const SCANNED_TEXT_FIELDS = [
  'full_name',
  'job_title',
  'email',
  'phone',
  'address',
  'emergency_contact_name',
  'emergency_contact_phone',
  'emergency_contact_relationship',
] as const;

/** Apply reviewed fields to the profile. Only the keys the user kept are sent;
 *  each overwrites the current value (locations are added to the existing
 *  stores). Runs after a human has looked at the draft. The payload comes from
 *  the browser, so only known columns with valid values are written. */
export async function applyParsedFields(
  staffId: string,
  fields: Partial<ParsedFields>
): Promise<{ ok: boolean; message: string }> {
  const { supabase, user } = await requireActiveStaff();

  const update: Record<string, string | string[]> = {};
  for (const key of SCANNED_TEXT_FIELDS) {
    const v = fields[key];
    if (typeof v === 'string' && v.trim()) update[key] = v.trim();
  }
  if (typeof fields.hired_on === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(fields.hired_on)) {
    update.hired_on = fields.hired_on;
  }
  if (EMPLOYMENT_TYPES.some((t) => t.value === fields.employment_type)) {
    update.employment_type = fields.employment_type as string;
  }
  if (Array.isArray(fields.locations)) {
    const scanned = fields.locations.filter((l) => LOCATIONS.some((x) => x.value === l));
    if (scanned.length) {
      const { data: current } = await supabase.from('staff').select('locations').eq('id', staffId).single();
      update.locations = [...new Set([...((current?.locations as string[] | null) ?? []), ...scanned])];
    }
  }
  if (typeof update.job_title === 'string') {
    update.job_title = (await canonicalJobTitle(supabase, update.job_title)) ?? update.job_title;
  }
  if (Object.keys(update).length === 0) return { ok: false, message: 'None of those values could be applied.' };

  const { data, error } = await supabase.from('staff').update(update).eq('id', staffId).select('id');
  if (error) return { ok: false, message: `Couldn't update the profile: ${error.message}` };
  if (!data?.length) return { ok: false, message: "Couldn't update: this profile no longer exists or you no longer have access." };

  await logAudit(user, 'apply_parsed', staffId, { applied: Object.keys(update) });
  revalidatePath(`/admin/staff/${staffId}`);
  return { ok: true, message: 'Profile updated from the document.' };
}
