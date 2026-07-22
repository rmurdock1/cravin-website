/** Private bucket holding staff documents. Never public — reads go through
 *  short-lived signed URLs minted server-side. */
export const BUCKET = 'staff-documents';

export interface StaffRow {
  id: string;
  full_name: string;
  job_title: string | null;
  locations: string[] | null;
  employment_type: string | null;
  status: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  hired_on: string | null;
  notes: string | null;
}

export interface StaffDocumentRow {
  id: string;
  staff_id: string;
  file_name: string;
  doc_type: string;
  mime_type: string | null;
  size_bytes: number | null;
  created_at: string;
}

// The three real stores. Multi-select — someone assigned to 2+ is a "floater".
export const LOCATIONS = [
  { value: 'ossining', label: 'Ossining' },
  { value: 'white-plains', label: 'White Plains' },
  { value: 'mount-vernon', label: 'Mount Vernon' },
];

/** Human-readable location summary for a staff member's assignments. */
export const locationsLabel = (values: string[] | null) => {
  if (!values || values.length === 0) return 'Unassigned';
  return values.map((v) => labelFor(LOCATIONS, v)).join(', ');
};

export const EMPLOYMENT_TYPES = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'seasonal', label: 'Seasonal' },
];

export const STAFF_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'former', label: 'Former' },
];

export const DOC_TYPES = [
  { value: 'i9', label: 'I-9' },
  { value: 'w4', label: 'W-4' },
  { value: 'offer_letter', label: 'Offer Letter' },
  { value: 'certification', label: 'Certification' },
  { value: 'id', label: 'ID Document' },
  { value: 'other', label: 'Other' },
];

export const labelFor = (list: { value: string; label: string }[], v: string | null) =>
  list.find((x) => x.value === v)?.label ?? v ?? '—';

export const formatBytes = (n: number | null) => {
  if (!n) return '';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
};

/** Documents can carry SSNs and DOBs, so uploads are restricted to formats we
 *  expect and a size a scanned form realistically needs. */
export const ACCEPTED_MIME = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/heic',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB
