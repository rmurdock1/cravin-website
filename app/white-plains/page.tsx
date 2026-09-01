import type { Metadata } from 'next';
import { locations } from '@/lib/site-data';
import { getLocationJsonLd } from '@/lib/json-ld';
import { LocationPageContent } from '@/components/locations/LocationPageContent';

const loc = locations.find((l) => l.id === 'white-plains')!;

export const metadata: Metadata = {
  title: 'Jamaican Restaurant in White Plains, NY',
  description:
    'Cravin Jamaican Cuisine on Mamaroneck Ave in downtown White Plains — jerk chicken, oxtail, curry goat, and rice & peas for takeout, Uber Eats delivery, and catering. Open six days a week.',
  alternates: { canonical: '/white-plains' },
  openGraph: { url: '/white-plains' },
};

export default function WhitePlainsPage() {
  const jsonLd = getLocationJsonLd('white-plains');
  return (
    <>
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}
      <LocationPageContent
        loc={loc}
        tagline="Right on Mamaroneck Ave in the heart of downtown White Plains — Jamaican classics for lunch, dinner, and catering."
      />
    </>
  );
}
