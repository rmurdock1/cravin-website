import type { Metadata } from 'next';
import { CateringPageClient } from '@/components/catering/CateringPageClient';
import { getCateringJsonLd } from '@/lib/json-ld';

export const metadata: Metadata = {
  title: 'Catering',
  description:
    'Cravin Jamaican Cuisine catering for events of 10 to 500 guests. Jerk chicken, oxtail, curry goat, rice & peas, and more. Corporate events, weddings, birthdays. Serving Westchester County, NY.',
};

export default function CateringPage() {
  const jsonLd = getCateringJsonLd();

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CateringPageClient />
    </main>
  );
}
