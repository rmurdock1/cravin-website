import { LOCATIONS } from '@/lib/staff-data';

/** Private bucket holding resumes from careers applications. Reads go through
 *  short-lived signed URLs minted server-side. */
export const RESUME_BUCKET = 'applicant-resumes';

/** Matches the careers form label and the bucket's own file_size_limit. */
export const MAX_RESUME_BYTES = 5 * 1024 * 1024;

const RESUME_MIME_BY_EXT: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

/** Content type for a resume, decided by its extension (never the browser-sent
 *  MIME type). Null means the format isn't accepted. */
export const resumeMimeFor = (fileName: string) =>
  RESUME_MIME_BY_EXT[fileName.split('.').pop()?.toLowerCase() ?? ''] ?? null;

// Values the careers form sends for "Availability".
export const AVAILABILITY = [
  { value: 'full-time', label: 'Full-Time' },
  { value: 'part-time', label: 'Part-Time' },
  { value: 'weekends', label: 'Weekends Only' },
  { value: 'flexible', label: 'Flexible' },
];

export const isKnownLocation = (v: string) => LOCATIONS.some((l) => l.value === v);
export const isKnownAvailability = (v: string) => AVAILABILITY.some((a) => a.value === v);

export interface ApplicationRow {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  position: string | null;
  preferred_location: string | null;
  availability: string | null;
  experience: string | null;
  resume_path: string | null;
  resume_file_name: string | null;
  resume_mime_type: string | null;
  resume_size_bytes: number | null;
  notes: string | null;
  viewed_at: string | null;
  staff_id: string | null;
  created_at: string;
}

/** Applied date in the stores' time zone (server components render in UTC). */
export const formatAppliedDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'America/New_York',
  });
