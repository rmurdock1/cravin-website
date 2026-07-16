import type { JobListing } from '@/lib/careers-data';
import { createPublicClient } from '@/lib/supabase/public';

export const JOB_LOCATIONS = ['Ossining', 'White Plains', 'Mount Vernon', 'All Locations'] as const;
export const EMPLOYMENT_TYPES = ['full-time', 'part-time', 'flexible'] as const;

export interface JobPostingRow {
  id: string;
  title: string;
  location: string;
  employment_type: 'full-time' | 'part-time' | 'flexible';
  description: string;
  responsibilities: string[];
  requirements: string[];
  perks: string[];
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

/** Map a DB row to the JobListing shape the careers UI expects. */
export function rowToListing(r: JobPostingRow): JobListing {
  return {
    id: r.id,
    title: r.title,
    location: r.location,
    type: r.employment_type,
    description: r.description,
    responsibilities: r.responsibilities ?? [],
    requirements: r.requirements ?? [],
    perks: r.perks ?? [],
  };
}

/** Public: active postings only (RLS also enforces this), ordered for display. */
export async function getActiveJobListings(): Promise<JobListing[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from('job_postings')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });
  return (data ?? []).map((r) => rowToListing(r as JobPostingRow));
}
