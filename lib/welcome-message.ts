import { brand } from '@/lib/site-data';

/** The welcome message an Admin sends to someone they've just invited. Invites
 *  don't send email (Team Access only creates the account), so the Admin sends
 *  this from their own inbox. Kept short on purpose: the full walkthrough lives
 *  on the in-app Getting Started guide, which stays current as the admin changes. */
export interface WelcomeInput {
  email: string;
  fullName: string | null;
  role: string;
  senderName: string | null;
}

export function welcomeMessage({ email, fullName, role, senderName }: WelcomeInput) {
  const firstName = fullName?.trim().split(/\s+/)[0] || 'there';
  const isAdmin = role === 'owner';

  const body = [
    `Hi ${firstName},`,
    '',
    `You now have ${isAdmin ? 'Admin' : 'HR Manager'} access to the Cravin admin, where we manage job postings, applicants and staff records.`,
    '',
    'SIGNING IN',
    `1. Go to ${brand.domain}/admin/login`,
    `2. Click "Continue with Google" and choose ${email}. That's the only way in, so there's no password to remember.`,
    '3. For privacy, you\'re signed out automatically after 30 minutes without activity.',
    '',
    'Once you\'re in, the Getting Started guide walks through everything step by step:',
    `${brand.domain}/admin/guide`,
    '',
    'QUICK OVERVIEW',
    '- Job Postings: create openings for each location. Save a draft, then Publish to put it on the careers page. Save roles you post often as templates.',
    '- Applicants: everyone who applies on the careers page. Read resumes, keep notes, upload a resume someone sends later, and use Hire → Staff to turn an applicant into a staff profile.',
    '- Staff: team profiles and private documents. Click Add Staff and upload a document such as an offer letter or onboarding form. Scan ✨ reads it automatically and fills in their contact details, job title, start date, store and emergency contact for you. Check the details and click Save Profile.',
    ...(isAdmin ? ['- Team Access (Admins only): invite people and change or remove their access.'] : []),
    '',
    'Documents are stored privately, and every time one is opened it\'s logged. Scanning never pulls out Social Security numbers or dates of birth.',
    '',
    'If anything doesn\'t work, just reply to this email.',
    '',
    senderName?.trim() || 'The Cravin team',
  ].join('\n');

  return { subject: 'Welcome to the Cravin Admin', body };
}

/** Opens a Gmail compose window with the message filled in. */
export const gmailComposeUrl = (to: string, subject: string, body: string) =>
  `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
