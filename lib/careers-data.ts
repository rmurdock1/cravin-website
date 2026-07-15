export type JobType = 'full-time' | 'part-time' | 'flexible';

export interface JobListing {
  id: string;
  title: string;
  location: string; // e.g. "Ossining" or "All Locations"
  type: JobType;
  description: string;
  responsibilities: string[];
  requirements: string[];
  perks?: string[];
}

// No active openings right now. Add JobListing objects here to re-open roles;
// each title automatically appears in the application "Position of Interest"
// dropdown, and the empty-state message on the careers page disappears.
export const jobListings: JobListing[] = [];

// Roles Cravin hires for — shown in the application form so applicants can
// express interest even when there are no active listings. "General
// Application" is always first so anyone can apply without a specific role.
export const positionOptions: string[] = [
  'General Application',
  'Cashier / Front of House',
  'Line Cook / Kitchen',
  'Catering & Events Staff',
  'Delivery Driver',
  'Baker',
  'Management',
];
