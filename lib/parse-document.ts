import Anthropic from '@anthropic-ai/sdk';
import { BUCKET } from '@/lib/staff-data';

/** Fields we let Claude extract from an uploaded HR document. Deliberately a
 *  short, non-sensitive allow-list — there is no SSN or date-of-birth field in
 *  the schema OR the prompt, so those values can't come back even if the
 *  document is an I-9 full of them. */
export interface ParsedFields {
  full_name: string | null;
  job_title: string | null;
  phone: string | null;
  address: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
}

const EXTRACTION_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    full_name: { type: ['string', 'null'], description: "Employee's full name" },
    job_title: { type: ['string', 'null'], description: 'Job title or position, if stated' },
    phone: { type: ['string', 'null'], description: "Employee's phone number" },
    address: { type: ['string', 'null'], description: "Employee's home/mailing address" },
    emergency_contact_name: { type: ['string', 'null'], description: 'Emergency contact person, if listed' },
    emergency_contact_phone: { type: ['string', 'null'], description: 'Emergency contact phone number, if listed' },
  },
  required: [
    'full_name',
    'job_title',
    'phone',
    'address',
    'emergency_contact_name',
    'emergency_contact_phone',
  ],
} as const;

const SYSTEM_PROMPT = `You extract a small set of non-sensitive contact basics from a scanned HR document (offer letter, onboarding form, I-9, etc.) to help pre-fill a staff profile.

Extract ONLY these fields: full name, job title, phone, home address, emergency contact name, emergency contact phone.

CRITICAL PRIVACY RULE: Never extract, transcribe, echo, or infer a Social Security number, date of birth, driver's license or passport number, bank/account number, or any other government or financial identifier — even if it is clearly printed in the document. There are no schema fields for those; leave them out entirely.

Return null for any field not clearly present. Do not guess.`;

// Image formats Claude's vision input accepts. HEIC and Word docs are excluded —
// we surface a clear message instead of attempting a bad extraction.
const SUPPORTED_IMAGE = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as const;
type SupportedImage = (typeof SUPPORTED_IMAGE)[number];

export function isParseable(mime: string | null): boolean {
  if (!mime) return false;
  return mime === 'application/pdf' || (SUPPORTED_IMAGE as readonly string[]).includes(mime);
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
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    output_config: { format: { type: 'json_schema', schema: EXTRACTION_SCHEMA } },
    messages: [
      {
        role: 'user',
        content: [
          docBlock,
          { type: 'text', text: 'Extract the allowed contact basics from this document.' },
        ],
      },
    ],
  });

  const text = response.content.find((b) => b.type === 'text');
  if (!text || text.type !== 'text') throw new Error('No structured output returned.');
  const raw = JSON.parse(text.text) as Record<string, unknown>;

  const clean = (v: unknown) => {
    const s = typeof v === 'string' ? v.trim() : '';
    return s.length ? s : null;
  };
  return {
    full_name: clean(raw.full_name),
    job_title: clean(raw.job_title),
    phone: clean(raw.phone),
    address: clean(raw.address),
    emergency_contact_name: clean(raw.emergency_contact_name),
    emergency_contact_phone: clean(raw.emergency_contact_phone),
  };
}

export { BUCKET };
