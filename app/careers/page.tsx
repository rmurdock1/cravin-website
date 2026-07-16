import type { Metadata } from 'next';
import { CareersPageClient } from '@/components/careers/CareersPageClient';
import { getActiveJobListings } from '@/lib/job-postings';

export const metadata: Metadata = {
  title: 'Careers',
  description:
    'Join the Cravin Jamaican Cuisine team. We\'re hiring line cooks, cashiers, catering assistants, and delivery drivers across our Westchester County locations.',
  alternates: { canonical: '/careers' },
  openGraph: { url: '/careers' },
};

// Revalidate the cached page periodically; admin actions also revalidate on change.
export const revalidate = 60;

export default async function CareersPage() {
  const jobListings = await getActiveJobListings();
  return (
    <main>
      <CareersPageClient jobListings={jobListings} />
    </main>
  );
}
