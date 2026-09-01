import type { Metadata } from 'next';
import { locations } from '@/lib/site-data';
import { getLocationJsonLd } from '@/lib/json-ld';
import { LocationPageContent } from '@/components/locations/LocationPageContent';

const loc = locations.find((l) => l.id === 'ossining')!;

export const metadata: Metadata = {
  title: 'Jamaican Restaurant in Ossining, NY',
  description:
    'Cravin Jamaican Cuisine in Ossining — jerk chicken, oxtail, curry goat, and ackee & saltfish for takeout, Uber Eats delivery, and catering. 109 Main Street, open six days a week.',
  alternates: { canonical: '/ossining' },
  openGraph: { url: '/ossining' },
};

export default function OssiningPage() {
  const jsonLd = getLocationJsonLd('ossining');
  return (
    <>
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}
      <LocationPageContent
        loc={loc}
        tagline="Our original location, where it all began in 2015 — authentic Jamaican cooking on Main Street in downtown Ossining."
      />
    </>
  );
}
