import type { Metadata } from 'next';
import { CareersPageClient } from '@/components/careers/CareersPageClient';

export const metadata: Metadata = {
  title: 'Careers',
  description:
    'Join the Cravin Jamaican Cuisine team. We\'re hiring line cooks, cashiers, catering assistants, and delivery drivers across our Westchester County locations.',
};

export default function CareersPage() {
  return (
    <main>
      <CareersPageClient />
    </main>
  );
}
