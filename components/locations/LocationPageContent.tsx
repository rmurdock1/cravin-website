import Image from 'next/image';
import Link from 'next/link';
import { locations, type Location } from '@/lib/site-data';
import { storefrontPhotos } from '@/lib/images';
import { mapEmbeds } from '@/lib/location-embeds';

// Full standalone page for a single restaurant location. Restores the
// per-location landing pages (/ossining, /white-plains, /mount-vernon) that were
// consolidated into /locations during the August rebuild. CTAs fire the same
// GA4 events (call_click / order_click / directions_click) with location
// resolved from the href by the global AnalyticsProvider.
export function LocationPageContent({
  loc,
  tagline,
}: {
  loc: Location;
  tagline: string;
}) {
  const others = locations.filter((l) => l.id !== loc.id);

  return (
    <main>
      {/* HERO */}
      <section className="page-hero" id="main-content">
        <div className="container">
          <h1>Jamaican Food in {loc.shortName}, NY</h1>
          <p className="page-hero-subtitle">{tagline}</p>
        </div>
      </section>

      {/* DETAIL */}
      <section className="location-detail-section" id={loc.id}>
        <div className="container">
          <div className="location-detail-grid">
            <div className="location-detail-info">
              <h2>Cravin Jamaican Cuisine — {loc.shortName}</h2>
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
              {/* Conversion CTAs — each fires its GA4 event with this location */}
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
            </div>
            <div className="location-storefront-block">
              <Image
                src={storefrontPhotos[loc.id]}
                alt={`Cravin Jamaican Cuisine ${loc.shortName} storefront`}
                width={600}
                height={400}
                placeholder="blur"
                loading="eager"
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

          {/* Internal links: menu / catering + sibling locations */}
          <div className="location-detail-actions" style={{ marginTop: 24 }}>
            <Link href="/menu" className="btn btn-outline-green">View Menu</Link>
            <Link href="/catering" className="btn btn-outline-warm">Catering Quote</Link>
          </div>
          <p style={{ marginTop: 20 }}>
            Our other Westchester locations:{' '}
            {others.map((o, i) => (
              <span key={o.id}>
                <Link href={`/${o.id}`}>{o.shortName}</Link>{i < others.length - 1 ? ' · ' : ''}
              </span>
            ))}
            {' · '}
            <Link href="/locations">All locations</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
