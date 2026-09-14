import Anthropic from '@anthropic-ai/sdk';
import { BUCKET, EMPLOYMENT_TYPES, LOCATIONS, type ParsedFields } from '@/lib/staff-data';

export type { ParsedFields };

const LOCATION_VALUES = LOCATIONS.map((l) => l.value);
const EMPLOYMENT_VALUES = EMPLOYMENT_TYPES.map((t) => t.value);

const nullableString = (description: string) => ({ type: ['string', 'null'], description });

// Mirrors ParsedFields. There is no SSN, date-of-birth, license or bank field in
// the schema OR the prompt, so those values can't come back even if the document
// is an I-9 full of them.
const EXTRACTION_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    full_name: nullableString("Employee's full name"),
    job_title: nullableString('Job title or position, if stated'),
    email: nullableString("Employee's email address"),
    phone: nullableString("Employee's phone number"),
    address: nullableString("Employee's home/mailing address"),
    hired_on: nullableString('Start date or hire date, as YYYY-MM-DD'),
    employment_type: {
      anyOf: [{ type: 'string', enum: EMPLOYMENT_VALUES }, { type: 'null' }],
      description: 'Employment type, only if the document states it',
    },
    locations: {
      type: 'array',
      items: { type: 'string', enum: LOCATION_VALUES },
      description: 'Cravin store(s) named as the work location; empty if none is named',
    },
    emergency_contact_name: nullableString('Emergency contact person, if listed'),
    emergency_contact_phone: nullableString('Emergency contact phone number, if listed'),
    emergency_contact_relationship: nullableString(
      "Emergency contact's relationship to the employee (e.g. Spouse, Parent), if listed"
    ),
  },
  required: [
    'full_name',
    'job_title',
    'email',
    'phone',
    'address',
    'hired_on',
    'employment_type',
    'locations',
    'emergency_contact_name',
    'emergency_contact_phone',
    'emergency_contact_relationship',
  ],
};

const SYSTEM_PROMPT = `You extract details from a scanned HR document (onboarding form, offer letter, I-9, etc.) to pre-fill a staff profile for Cravin Jamaican Cuisine.

Extract only the fields in the schema: full name, job title, email, phone, home address, start or hire date, employment type, work location, and the emergency contact's name, phone and relationship.

- hired_on: the start or hire date, converted to YYYY-MM-DD.
- employment_type: full-time, part-time or seasonal, only when the document says which.
- locations: Cravin's stores are Ossining (ossining), White Plains (white-plains) and Mount Vernon (mount-vernon). Include a store only when the document names it as where the employee will work. Never infer a store from the employee's home address.

CRITICAL PRIVACY RULE: Never extract, transcribe, echo, or infer a Social Security number, date of birth, driver's license or passport number, bank/account number, or any other government or financial identifier — even if it is clearly printed in the document. There are no schema fields for those; leave them out entirely.

Return null (or an empty list for locations) for anything not clearly present. Do not guess.`;

// Image formats Claude's vision input accepts. HEIC and Word docs are excluded —
// we surface a clear message instead of attempting a bad extraction.
const SUPPORTED_IMAGE = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as const;
type SupportedImage = (typeof SUPPORTED_IMAGE)[number];

export function isParseable(mime: string | null): boolean {
  if (!mime) return false;
  return mime === 'application/pdf' || (SUPPORTED_IMAGE as readonly string[]).includes(mime);
}

const clean = (v: unknown) => {
  const s = typeof v === 'string' ? v.trim() : '';
  return s.length ? s : null;
};

/** Structured output guarantees the shape; these checks guarantee the values are
 *  ones the staff form can actually save. */
function toParsedFields(raw: Record<string, unknown>): ParsedFields {
  const hiredOn = clean(raw.hired_on);
  const employmentType = clean(raw.employment_type);
  const locations = Array.isArray(raw.locations)
    ? raw.locations.filter((l): l is string => typeof l === 'string' && LOCATION_VALUES.includes(l))
    : [];

  return {
    full_name: clean(raw.full_name),
    job_title: clean(raw.job_title),
    email: clean(raw.email),
    phone: clean(raw.phone),
    address: clean(raw.address),
    hired_on:
      hiredOn && /^\d{4}-\d{2}-\d{2}$/.test(hiredOn) && !Number.isNaN(Date.parse(hiredOn)) ? hiredOn : null,
    employment_type: employmentType && EMPLOYMENT_VALUES.includes(employmentType) ? employmentType : null,
    locations: [...new Set(locations)],
    emergency_contact_name: clean(raw.emergency_contact_name),
    emergency_contact_phone: clean(raw.emergency_contact_phone),
    emergency_contact_relationship: clean(raw.emergency_contact_relationship),
  };
}

export async function parseDocumentBytes(
  bytes: ArrayBuffer,
  mimeType: string
): Promise<ParsedFields> {
  const client = new Anthropic(); // reads ANTHROPIC_API_KEY from the server env
  const data = Buffer.from(bytes).toString('base64');

  const docBlock =
    mimeType === 'application/pdf'
      ? ({ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data } } as const)
      : ({ type: 'image', source: { type: 'base64', media_type: mimeType as SupportedImage, data } } as const);

  const response = await client.messages.create({
    model: 'claude-opus-4-8',
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    output_config: { format: { type: 'json_schema', schema: EXTRACTION_SCHEMA } },
    messages: [
      {
        role: 'user',
        content: [
          docBlock,
          { type: 'text', text: 'Extract the staff profile details from this document.' },
        ],
      },
    ],
  });

  if (response.stop_reason === 'refusal') {
    throw new Error("This document couldn't be scanned. Please enter the details by hand.");
  }
  if (response.stop_reason === 'max_tokens') {
    throw new Error('The scan was cut off before it finished. Please try again.');
  }

  const text = response.content.find((b) => b.type === 'text');
  if (!text || text.type !== 'text') throw new Error('No structured output returned.');
  return toParsedFields(JSON.parse(text.text) as Record<string, unknown>);
}

export { BUCKET };
