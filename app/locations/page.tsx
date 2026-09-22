import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { comingSoonLocations, locations } from '@/lib/site-data';
import { storefrontPhotos } from '@/lib/images';
import { getLocationsJsonLd, getFaqJsonLd } from '@/lib/json-ld';
import { mapEmbeds } from '@/lib/location-embeds';
import { FaqSection } from '@/components/layout/FaqSection';
import { visitFaqs } from '@/lib/faq-data';

export const metadata: Metadata = {
  title: 'Locations & Hours',
  description: 'Visit Cravin Jamaican Cuisine at three Westchester County locations: Ossining, White Plains, and Mount Vernon. View hours, addresses, and get directions.',
  alternates: { canonical: '/locations' },
};

const locationTaglines: Record<string, string> = {
  ossining: 'Our original location, where it all began in 2015.',
  'white-plains': 'Right on Mamaroneck Ave in the heart of downtown.',
  'mount-vernon': 'Our newest location, bringing island flavors to Gramatan Ave.',
};

export default function LocationsPage() {
  const jsonLdArray = getLocationsJsonLd();
  const faqJsonLd = getFaqJsonLd(visitFaqs);

  return (
    <main>
      {jsonLdArray.map((jsonLd, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ))}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {/* PAGE HERO */}
      <section className="page-hero" id="main-content">
        <div className="container">
          <h1>Our Locations</h1>
          <p>Three restaurants across Westchester County, New York, with the South Bronx coming soon.</p>
        </div>
      </section>

      {/* QUICK LINKS */}
      <div className="location-quicklinks">
        <div className="container">
          {locations.map((loc) => (
            <a key={loc.id} href={`#${loc.id}`} className="quicklink">{loc.shortName}</a>
          ))}
          {comingSoonLocations.map((loc) => (
            <a key={loc.id} href={`#${loc.id}`} className="quicklink quicklink-soon">
              {loc.shortName}{' '}
              <span className="quicklink-soon-sep" aria-hidden="true">&middot;</span>{' '}
              <span className="quicklink-soon-label">Coming soon</span>
            </a>
          ))}
        </div>
      </div>

      {/* LOCATION DETAILS */}
      {locations.map((loc, i) => (
        <section
          key={loc.id}
          className={`location-detail-section ${i % 2 === 1 ? 'location-detail-section-alt' : ''}`}
          id={loc.id}
        >
          <div className="container">
            <div className="location-detail-grid">
              <div className="location-detail-info">
                <h2>{loc.shortName}</h2>
                <p className="location-tagline">{locationTaglines[loc.id]}</p>
                <div className="location-detail-address">
                  <p>{loc.fullAddress}</p>
                  <p><a href={`tel:${loc.phone}`}>{loc.phoneFormatted}</a></p>
                  <p><a href={`mailto:${loc.email}`}>{loc.email}</a></p>
                </div>
                <table className="hours-table">
                  <thead>
                    <tr><th>Day</th><th>Hours</th></tr>
                  </thead>
                  <tbody>
                    {loc.hours.map((h) => (
                      <tr key={h.day}><td>{h.day}</td><td>{h.hours}</td></tr>
                    ))}
                  </tbody>
                </table>
                {/* Per-location conversion CTAs — each fires its GA4 event
                    (call_click / order_click / directions_click) with the
                    location resolved automatically from the href. */}
                <div className="location-detail-actions">
                  <a href={`tel:${loc.phone}`} className="btn btn-warm" aria-label={`Call ${loc.shortName} at ${loc.phoneFormatted} to order`}>
                    Call to Order
                  </a>
                  {loc.ordering.ubereats && (
                    <a href={loc.ordering.ubereats} className="btn btn-outline-warm" target="_blank" rel="noopener noreferrer" aria-label={`Order ${loc.shortName} delivery on Uber Eats (opens in new tab)`}>
                      Order Delivery
                    </a>
                  )}
                  <a href={loc.googleMapsUrl} className="btn btn-outline-green" target="_blank" rel="noopener noreferrer" aria-label={`Get directions to ${loc.shortName}`}>
                    Get Directions
                  </a>
                </div>
                <p style={{ marginTop: 12 }}>
                  <Link href={`/${loc.id}`}>More about our {loc.shortName} location &rarr;</Link>
                </p>
              </div>
              <div className="location-storefront-block">
                <Image
                  src={storefrontPhotos[loc.id]}
                  alt={`Cravin Jamaican Cuisine ${loc.shortName} storefront`}
                  width={600}
                  height={400}
                  placeholder="blur"
                  loading={i === 0 ? 'eager' : 'lazy'}
                />
              </div>
            </div>
            <div className="location-map-embed location-map-full">
              <iframe
                src={mapEmbeds[loc.id]}
                width="100%"
                height="300"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`Map of Cravin Jamaican Cuisine ${loc.shortName} location`}
              />
            </div>
          </div>
        </section>
      ))}

      {/* COMING SOON — no address, phone, hours, directions or ordering until
          it opens, and no LocalBusiness schema (it isn't in `locations`). */}
      {comingSoonLocations.map((loc) => (
        <section key={loc.id} className="location-detail-section location-coming-soon" id={loc.id}>
          <div className="container">
            <div className="coming-soon-card">
              <span className="coming-soon-badge">Coming soon</span>
              <h2>{loc.shortName}</h2>
              <p className="location-tagline">{loc.area}</p>
              <p className="coming-soon-blurb">{loc.blurb}</p>
            </div>
          </div>
        </section>
      ))}

      <FaqSection
        title="Visiting Cravin — Common Questions"
        subtitle="Hours, ordering, dietary options, and more."
        faqs={visitFaqs}
      />
    </main>
  );
}
