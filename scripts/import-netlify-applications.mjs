// One-time import: careers applications submitted to Netlify Forms before the
// form started saving to Supabase (migration 0007). Copies each submission into
// public.job_applications and its resume into the private applicant-resumes bucket.
//
// Run after applying migration 0007:
//   NETLIFY_AUTH_TOKEN=… NEXT_PUBLIC_SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… \
//     node scripts/import-netlify-applications.mjs
//
// Safe to re-run: submissions already imported are skipped, and so is any
// submission that also reached Supabase directly (same email within 10 minutes),
// since once deployed the careers form posts to both.

import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const FORM_ID = '6a4e80b481dab700080bf030'; // Netlify form "careers-application", site cravinjc
const BUCKET = 'applicant-resumes';
const LOCATIONS = ['ossining', 'white-plains', 'mount-vernon'];
const AVAILABILITY = ['full-time', 'part-time', 'weekends', 'flexible'];
const MIME_BY_EXT = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

const { NETLIFY_AUTH_TOKEN, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
if (!NETLIFY_AUTH_TOKEN || !NEXT_PUBLIC_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Set NETLIFY_AUTH_TOKEN, NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const netlifyAuth = { Authorization: `Bearer ${NETLIFY_AUTH_TOKEN}` };

const clean = (v, max) => {
  const s = typeof v === 'string' ? v.trim().slice(0, max) : '';
  return s || null;
};

async function fetchSubmissions() {
  const all = [];
  for (let page = 1; ; page++) {
    const res = await fetch(
      `https://api.netlify.com/api/v1/forms/${FORM_ID}/submissions?per_page=100&page=${page}`,
      { headers: netlifyAuth }
    );
    if (!res.ok) throw new Error(`Netlify API ${res.status}: ${await res.text()}`);
    const batch = await res.json();
    all.push(...batch);
    if (batch.length < 100) return all;
  }
}

// File fields come back as either a URL string or { url, filename, type, size }.
async function downloadResume(field) {
  const url = typeof field === 'string' ? field : field?.url;
  if (!url) return null;
  const parsed = new URL(url);
  const fileName =
    (typeof field === 'object' && field.filename) ||
    decodeURIComponent(parsed.pathname.split('/').pop() || 'resume');
  const mime = MIME_BY_EXT[fileName.split('.').pop()?.toLowerCase() ?? ''];
  if (!mime) return { skipped: `unsupported file type (${fileName})` };

  // Try as-is first (pre-signed URLs reject an extra auth header). Only send the
  // Netlify token back to Netlify's own hosts.
  let res = await fetch(url);
  const isNetlifyHost = /(^|\.)netlify\.(com|app)$/.test(parsed.hostname);
  if ((res.status === 401 || res.status === 403) && isNetlifyHost) {
    res = await fetch(url, { headers: netlifyAuth });
  }
  if (!res.ok) return { skipped: `download failed (HTTP ${res.status})` };
  return { fileName, mime, bytes: new Uint8Array(await res.arrayBuffer()) };
}

const submissions = await fetchSubmissions();
console.log(`Found ${submissions.length} Netlify submission(s).`);

let imported = 0;
let skipped = 0;
for (const s of submissions) {
  const d = s.data ?? {};
  const fullName = clean(d.name, 200);
  const email = clean(d.email, 254);
  if (!fullName || !email) {
    console.warn(`- ${s.id}: missing name or email, skipped`);
    skipped++;
    continue;
  }

  const { data: already } = await supabase
    .from('job_applications')
    .select('id')
    .eq('netlify_submission_id', s.id)
    .maybeSingle();
  const t = new Date(s.created_at).getTime();
  const { data: direct } = await supabase
    .from('job_applications')
    .select('id')
    .eq('email', email)
    .gte('created_at', new Date(t - 10 * 60_000).toISOString())
    .lte('created_at', new Date(t + 10 * 60_000).toISOString())
    .limit(1);
  if (already || direct?.length) {
    skipped++;
    continue;
  }

  const id = randomUUID();
  let resume = {};
  if (d.resume) {
    const file = await downloadResume(d.resume);
    if (file?.skipped) {
      console.warn(`- ${fullName}: resume not imported, ${file.skipped}`);
    } else if (file) {
      const path = `${id}/${randomUUID()}-${file.fileName.replace(/[^\w.\-]+/g, '_').slice(-120)}`;
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, file.bytes, { contentType: file.mime, upsert: false });
      if (error) {
        console.warn(`- ${fullName}: resume upload failed, ${error.message}`);
      } else {
        resume = {
          resume_path: path,
          resume_file_name: file.fileName,
          resume_mime_type: file.mime,
          resume_size_bytes: file.bytes.byteLength,
        };
      }
    }
  }

  const location = clean(d.preferred_location, 40);
  const availability = clean(d.availability, 40);
  const { error } = await supabase.from('job_applications').insert({
    id,
    full_name: fullName,
    email,
    phone: clean(d.phone, 40),
    position: clean(d.position, 120),
    preferred_location: LOCATIONS.includes(location) ? location : null,
    availability: AVAILABILITY.includes(availability) ? availability : null,
    experience: clean(d.experience, 5000),
    ...resume,
    netlify_submission_id: s.id,
    created_at: s.created_at,
  });
  if (error) {
    if (resume.resume_path) await supabase.storage.from(BUCKET).remove([resume.resume_path]);
    console.error(`- ${fullName}: insert failed, ${error.message}`);
    skipped++;
    continue;
  }

  console.log(`+ ${fullName} (${clean(d.position, 120) ?? 'General Application'})`);
  imported++;
}

console.log(`Done: ${imported} imported, ${skipped} skipped.`);
