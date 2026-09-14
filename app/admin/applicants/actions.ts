'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireActiveStaff } from '@/lib/admin-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { canonicalJobTitle } from '@/lib/staff-titles';
import { BUCKET as STAFF_BUCKET } from '@/lib/staff-data';
import {
  MAX_RESUME_BYTES,
  RESUME_BUCKET,
  resumeMimeFor,
  type ApplicationRow,
} from '@/lib/applicants-data';

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
    entity: 'application',
    entity_id: entityId,
    metadata,
  });
}

type NotesState = { ok: boolean; message: string } | null;

export async function saveApplicantNotes(_prev: NotesState, formData: FormData): Promise<NotesState> {
  const { supabase, user } = await requireActiveStaff();
  const id = String(formData.get('id') ?? '');
  const notes = String(formData.get('notes') ?? '').trim();

  const { error } = await supabase
    .from('job_applications')
    .update({ notes: notes || null })
    .eq('id', id);
  if (error) return { ok: false, message: error.message };

  await logAudit(user, 'update_application_notes', id);
  revalidatePath(`/admin/applicants/${id}`);
  return { ok: true, message: 'Notes saved.' };
}

/** Mints a short-lived signed URL. The bucket is private, so this is the only
 *  way to read a resume — and every view is recorded. */
export async function getResumeUrl(applicationId: string) {
  const { supabase, user } = await requireActiveStaff();
  const { data: app } = await supabase
    .from('job_applications')
    .select('resume_path, resume_file_name')
    .eq('id', applicationId)
    .single();
  if (!app?.resume_path) return { ok: false as const, message: 'No resume attached.' };

  const { data, error } = await supabase.storage
    .from(RESUME_BUCKET)
    .createSignedUrl(app.resume_path, 60); // 60s is enough to open it
  if (error || !data) return { ok: false as const, message: error?.message ?? 'Could not open.' };

  await logAudit(user, 'view_resume', applicationId, { file_name: app.resume_file_name });
  return { ok: true as const, url: data.signedUrl };
}

/** Step 1 of attaching a resume from the admin (e.g. one the applicant emailed
 *  later): validate, then mint a one-time signed upload URL for a server-chosen
 *  path. The browser uploads straight to private storage, so the file skips the
 *  serverless request body; the bucket still enforces its size and type limits.
 *  Uses the service role because staff have no storage INSERT policy on this
 *  bucket — the active-staff check above is the gate, and the URL covers only
 *  this one path. */
export async function createResumeUpload(applicationId: string, fileName: string, size: number) {
  const { supabase } = await requireActiveStaff();
  const mime = resumeMimeFor(fileName);
  if (!mime) return { ok: false as const, message: 'Resume must be a PDF, DOC, or DOCX file.' };
  if (size > MAX_RESUME_BYTES) return { ok: false as const, message: 'Resume must be 5 MB or smaller.' };

  const { data: app } = await supabase
    .from('job_applications')
    .select('id')
    .eq('id', applicationId)
    .single();
  if (!app) return { ok: false as const, message: 'Application not found.' };

  const path = `${applicationId}/${randomUUID()}-${fileName.replace(/[^\w.\-]+/g, '_').slice(-120)}`;
  const { data, error } = await createAdminClient()
    .storage.from(RESUME_BUCKET)
    .createSignedUploadUrl(path);
  if (error || !data) return { ok: false as const, message: error?.message ?? 'Could not start the upload.' };

  return { ok: true as const, path: data.path, token: data.token, mime };
}

/** Step 2: point the application at the uploaded file, deleting any resume it
 *  replaces so old files aren't stranded in the bucket. */
export async function recordResume(
  applicationId: string,
  input: { path: string; fileName: string; size: number }
) {
  const { supabase, user } = await requireActiveStaff();
  const mime = resumeMimeFor(input.fileName);
  // Only accept a path createResumeUpload could have issued for this application.
  if (!mime || !input.path.startsWith(`${applicationId}/`) || input.path.includes('..')) {
    return { ok: false, message: 'Invalid upload.' };
  }

  const { data: app } = await supabase
    .from('job_applications')
    .select('resume_path')
    .eq('id', applicationId)
    .single();
  if (!app) return { ok: false, message: 'Application not found.' };

  const { error } = await supabase
    .from('job_applications')
    .update({
      resume_path: input.path,
      resume_file_name: input.fileName.slice(0, 255),
      resume_mime_type: mime,
      resume_size_bytes: input.size,
    })
    .eq('id', applicationId);
  if (error) {
    await supabase.storage.from(RESUME_BUCKET).remove([input.path]); // don't strand the new file
    return { ok: false, message: error.message };
  }

  if (app.resume_path && app.resume_path !== input.path) {
    await supabase.storage.from(RESUME_BUCKET).remove([app.resume_path]);
  }
  await logAudit(user, app.resume_path ? 'replace_resume' : 'upload_resume', applicationId, {
    file_name: input.fileName,
  });
  revalidatePath(`/admin/applicants/${applicationId}`);
  return { ok: true, message: app.resume_path ? 'Resume replaced.' : 'Resume uploaded.' };
}

export async function deleteApplicant(id: string) {
  const { supabase, user } = await requireActiveStaff();

  // Remove the stored resume too, so it isn't stranded in the bucket.
  const { data: app } = await supabase
    .from('job_applications')
    .select('resume_path')
    .eq('id', id)
    .single();
  if (app?.resume_path) await supabase.storage.from(RESUME_BUCKET).remove([app.resume_path]);

  await supabase.from('job_applications').delete().eq('id', id);
  await logAudit(user, 'delete_application', id, { removed_resume: Boolean(app?.resume_path) });
  revalidatePath('/admin/applicants');
  redirect('/admin/applicants');
}

/** "Hire" turns an application into a Staff profile: contact details, title
 *  (from the position applied for), preferred store and availability carry
 *  over, and the resume is copied into the staff member's private documents.
 *  HR lands on the staff editor to fill in the rest (hire date, address, …). */
export async function hireApplicant(id: string): Promise<{ ok: false; message: string } | void> {
  const { supabase, user } = await requireActiveStaff();

  const { data } = await supabase.from('job_applications').select('*').eq('id', id).single();
  if (!data) return { ok: false, message: 'Application not found.' };
  const app = data as ApplicationRow;
  if (app.staff_id) redirect(`/admin/staff/${app.staff_id}`); // already hired

  const position = app.position && app.position !== 'General Application' ? app.position : null;
  const { data: staff, error } = await supabase
    .from('staff')
    .insert({
      full_name: app.full_name,
      job_title: await canonicalJobTitle(supabase, position),
      locations: app.preferred_location ? [app.preferred_location] : [],
      // Only availability values that mean the same thing on a staff profile.
      employment_type: ['full-time', 'part-time'].includes(app.availability ?? '')
        ? app.availability
        : null,
      status: 'active',
      email: app.email,
      phone: app.phone,
      created_by: user.id,
    })
    .select('id')
    .single();
  if (error || !staff) return { ok: false, message: error?.message ?? 'Could not create the staff profile.' };

  // Copy (not move) the resume: the application keeps its own copy. A failed
  // copy doesn't block the hire — the resume is still on the application.
  let resumeCopied = false;
  if (app.resume_path) {
    const { data: file } = await supabase.storage.from(RESUME_BUCKET).download(app.resume_path);
    if (file) {
      const fileName = app.resume_file_name ?? 'resume';
      const path = `${staff.id}/${randomUUID()}-${fileName.replace(/[^\w.\-]+/g, '_')}`;
      const { error: uploadError } = await supabase.storage
        .from(STAFF_BUCKET)
        .upload(path, file, { contentType: app.resume_mime_type ?? undefined, upsert: false });
      if (!uploadError) {
        const { error: docError } = await supabase.from('staff_documents').insert({
          staff_id: staff.id,
          storage_path: path,
          file_name: fileName,
          doc_type: 'resume',
          mime_type: app.resume_mime_type,
          size_bytes: app.resume_size_bytes,
          uploaded_by: user.id,
        });
        resumeCopied = !docError;
      }
    }
  }

  await supabase.from('job_applications').update({ staff_id: staff.id }).eq('id', id);
  await logAudit(user, 'hire_applicant', id, { staff_id: staff.id, resume_copied: resumeCopied });

  revalidatePath('/admin/applicants');
  revalidatePath('/admin/staff');
  redirect(`/admin/staff/${staff.id}/edit`);
}
