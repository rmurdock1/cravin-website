import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  RESUME_BUCKET,
  MAX_RESUME_BYTES,
  resumeMimeFor,
  isKnownLocation,
  isKnownAvailability,
} from '@/lib/applicants-data';

// Receives careers applications from the public form and stores them for the
// admin Applicants view. The form ALSO posts the same data to Netlify Forms
// (see submitCareersApplication), so email notifications keep working and an
// applicant is never lost if this route fails.
//
// Writes use the service role because anon has no table or bucket access at all
// (migration 0007). Everything in the request is untrusted: lengths are capped,
// enum-like fields whitelisted, and the resume's type comes from its extension.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const fail = (status: number, message: string) =>
  NextResponse.json({ ok: false, message }, { status });

export async function POST(request: Request) {
  let fd: FormData;
  try {
    fd = await request.formData();
  } catch {
    return fail(400, 'Invalid form submission.');
  }

  // Honeypot: people never see the "website" field. Report success so bots
  // don't retry, but store nothing.
  if (String(fd.get('website') ?? '').trim()) return NextResponse.json({ ok: true });

  const text = (key: string, max: number) => {
    const v = String(fd.get(key) ?? '').trim().slice(0, max);
    return v.length ? v : null;
  };

  const fullName = text('name', 200);
  const email = text('email', 254);
  if (!fullName || !email || !EMAIL_RE.test(email)) {
    return fail(400, 'Name and a valid email are required.');
  }

  const id = randomUUID();
  const admin = createAdminClient();

  let resume = {};
  let resumePath: string | null = null;
  const file = fd.get('resume');
  if (file && typeof file !== 'string' && file.size > 0) {
    const mime = resumeMimeFor(file.name);
    if (!mime) return fail(400, 'Resume must be a PDF, DOC, or DOCX file.');
    if (file.size > MAX_RESUME_BYTES) return fail(413, 'Resume must be 5 MB or smaller.');

    const safe = file.name.replace(/[^\w.\-]+/g, '_').slice(-120);
    resumePath = `${id}/${randomUUID()}-${safe}`;
    const { error } = await admin.storage
      .from(RESUME_BUCKET)
      .upload(resumePath, file, { contentType: mime, upsert: false });
    if (error) {
      console.error('careers apply: resume upload failed:', error.message);
      return fail(500, 'Could not save the resume.');
    }
    resume = {
      resume_path: resumePath,
      resume_file_name: file.name.slice(0, 255),
      resume_mime_type: mime,
      resume_size_bytes: file.size,
    };
  }

  const location = text('preferred_location', 40);
  const availability = text('availability', 40);
  const { error } = await admin.from('job_applications').insert({
    id,
    full_name: fullName,
    email,
    phone: text('phone', 40),
    position: text('position', 120),
    preferred_location: location && isKnownLocation(location) ? location : null,
    availability: availability && isKnownAvailability(availability) ? availability : null,
    experience: text('experience', 5000),
    ...resume,
  });

  if (error) {
    // Don't strand an uploaded resume with no row pointing at it.
    if (resumePath) await admin.storage.from(RESUME_BUCKET).remove([resumePath]);
    console.error('careers apply: insert failed:', error.message);
    return fail(500, 'Could not save the application.');
  }

  return NextResponse.json({ ok: true });
}
