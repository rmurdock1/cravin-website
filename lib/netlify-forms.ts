import type { FormEvent } from 'react';
import { stashFormConversion } from '@/lib/analytics';
import { MAX_RESUME_BYTES } from '@/lib/applicants-data';

/**
 * Submits a Netlify form via fetch instead of a full-page POST.
 *
 * With the Next.js runtime on Netlify, a POST to any page route (/, /success,
 * /catering) is handled by the Next server before Netlify Forms can intercept
 * it, so submissions are never captured. Posting to the STATIC file
 * /__forms.html (served directly by Netlify's CDN, bypassing Next) lets
 * Netlify's form handler catch it — verified empirically. The form still needs
 * a hidden `form-name` field and a matching entry in that same __forms.html.
 *
 * Uses multipart when a file is attached (careers resume), url-encoded otherwise.
 */
const NETLIFY_FORM_ENDPOINT = '/__forms.html';
const CAREERS_ENDPOINT = '/api/careers/apply';

function postToNetlify(formData: FormData) {
  const hasFile = Array.from(formData.values()).some(
    (v) => v instanceof File && v.size > 0
  );

  const init: RequestInit = hasFile
    ? { method: 'POST', body: formData }
    : {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData as unknown as Record<string, string>).toString(),
      };

  return fetch(NETLIFY_FORM_ENDPOINT, init);
}

/** Shared submit flow: lock the button, send, then relay the conversion and go
 *  to /success — or restore the button and explain on failure. */
async function submitWith(
  e: FormEvent<HTMLFormElement>,
  send: (formData: FormData) => Promise<boolean>
) {
  e.preventDefault();
  const form = e.currentTarget;
  const btn = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const originalLabel = btn?.textContent ?? '';
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Submitting…';
  }

  const formData = new FormData(form);

  try {
    if (!(await send(formData))) throw new Error('Submission failed');
    // Stash the GA4 conversion payload and fire it on /success instead of here:
    // firing now would race the /success navigation's page unload and lose the
    // gtag beacon (why catering conversions weren't reaching GA4).
    try {
      stashFormConversion(formData);
    } catch {
      // Never let analytics block the user's redirect to the thank-you page.
    }
    window.location.href = '/success';
  } catch {
    if (btn) {
      btn.disabled = false;
      btn.textContent = originalLabel;
    }
    alert(
      'Sorry — something went wrong submitting the form. Please call us at (914) 432-7776 or email catering@cravinjc.com.'
    );
  }
}

export function submitNetlifyForm(e: FormEvent<HTMLFormElement>) {
  return submitWith(e, async (formData) => (await postToNetlify(formData)).ok);
}

/**
 * Careers applications go to BOTH the app's own endpoint (saved to Supabase for
 * the admin Applicants view) and Netlify Forms (keeps the existing email
 * notifications). It succeeds if either one lands, so a failure on one side
 * never loses an applicant.
 */
export function submitCareersApplication(e: FormEvent<HTMLFormElement>) {
  const resume = e.currentTarget.querySelector<HTMLInputElement>('input[name="resume"]')?.files?.[0];
  if (resume && resume.size > MAX_RESUME_BYTES) {
    e.preventDefault();
    alert('That resume is over 5 MB. Please attach a smaller file.');
    return;
  }

  return submitWith(e, async (formData) => {
    const results = await Promise.allSettled([
      fetch(CAREERS_ENDPOINT, { method: 'POST', body: formData }),
      postToNetlify(formData),
    ]);
    return results.some((r) => r.status === 'fulfilled' && r.value.ok);
  });
}
