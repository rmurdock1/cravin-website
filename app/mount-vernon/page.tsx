import type { Metadata } from 'next';
import { locations } from '@/lib/site-data';
import { getLocationJsonLd } from '@/lib/json-ld';
import { LocationPageContent } from '@/components/locations/LocationPageContent';

const loc = locations.find((l) => l.id === 'mount-vernon')!;

export const metadata: Metadata = {
  title: 'Jamaican Restaurant in Mount Vernon, NY',
  description:
    'Cravin Jamaican Cuisine on Gramatan Ave in Mount Vernon — jerk chicken, oxtail, curry goat, and fried plantain for takeout, Uber Eats delivery, and catering. Open six days a week.',
  alternates: { canonical: '/mount-vernon' },
  openGraph: { url: '/mount-vernon' },
};

export default function MountVernonPage() {
  const jsonLd = getLocationJsonLd('mount-vernon');
  return (
    <>
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}
      <LocationPageContent
        loc={loc}
        tagline="Bringing island flavors to Gramatan Ave in Mount Vernon — Jamaican comfort food for takeout, delivery, and events."
      />
    </>
  );
}
