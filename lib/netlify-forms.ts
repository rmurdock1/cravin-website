import type { FormEvent } from 'react';

/**
 * Submits a Netlify form via fetch instead of a full-page POST.
 *
 * With the Next.js runtime on Netlify, a native form POST to a page route
 * (e.g. /success) is handled by the Next server before Netlify Forms can
 * intercept it, so submissions are never captured. Posting the encoded form
 * data to "/" with fetch lets Netlify's form handler catch it. The form still
 * needs a hidden `form-name` field and a matching entry in public/__forms.html.
 *
 * Uses multipart when a file is attached (careers resume), url-encoded otherwise.
 */
export async function submitNetlifyForm(e: FormEvent<HTMLFormElement>) {
  e.preventDefault();
  const form = e.currentTarget;
  const btn = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const originalLabel = btn?.textContent ?? '';
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Submitting…';
  }

  const formData = new FormData(form);
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

  try {
    const res = await fetch('/', init);
    if (!res.ok) throw new Error(`Submission failed: ${res.status}`);
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
