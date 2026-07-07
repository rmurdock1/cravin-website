import type { Metadata } from 'next';
import { CateringPageClient } from '@/components/catering/CateringPageClient';
import { getCateringJsonLd, getFaqJsonLd } from '@/lib/json-ld';
import { FaqSection } from '@/components/layout/FaqSection';
import { cateringFaqs } from '@/lib/faq-data';

export const metadata: Metadata = {
  title: 'Catering',
  description:
    'Cravin Jamaican Cuisine catering for events of 10 to 500 guests. Jerk chicken, oxtail, curry goat, rice & peas, and more. Corporate events, weddings, birthdays. Serving Westchester County, NY.',
  alternates: { canonical: '/catering' },
  openGraph: {
    title: 'Jamaican Catering in Westchester | Cravin Jamaican Cuisine',
    description: 'Full-service Jamaican catering for 10–500 guests. Corporate events, weddings, and celebrations. Rated 4.9/5 on ezCater. Build a quote in minutes.',
    url: '/catering',
  },
};

export default function CateringPage() {
  const jsonLd = getCateringJsonLd();
  const faqJsonLd = getFaqJsonLd(cateringFaqs);

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <CateringPageClient />
      <FaqSection
        title="Catering Questions, Answered"
        subtitle="Everything you need to know before booking your event."
        faqs={cateringFaqs}
      />
    </main>
  );
}
