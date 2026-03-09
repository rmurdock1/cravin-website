import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { locations } from '@/lib/site-data';

export const metadata: Metadata = {
  title: 'Locations & Hours',
  description: 'Visit Cravin Jamaican Cuisine at three Westchester County locations: Ossining, White Plains, and Mount Vernon. View hours, addresses, and get directions.',
};

const locationTaglines: Record<string, string> = {
  ossining: 'Our original location, where it all began in 2015.',
  'white-plains': 'Right on Mamaroneck Ave in the heart of downtown.',
  'mount-vernon': 'Our newest location, bringing island flavors to Gramatan Ave.',
};

const mapEmbeds: Record<string, string> = {
  ossining: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3003.8091971593276!2d-73.8648283!3d41.1605146!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c2c0b81277d073%3A0xc19451f64c242faf!2sCravin%20Jamaican%20Cuisine%20Ossining!5e0!3m2!1sen!2sus!4v1772632494618!5m2!1sen!2sus',
  'white-plains': 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3009.747221993228!2d-73.7662208!3d41.030785900000005!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c2952b950437bf%3A0x97fbd165266b6eae!2sCravin%20Jamaican%20Cuisine%20White%20Plains!5e0!3m2!1sen!2sus!4v1772632581353!5m2!1sen!2sus',
  'mount-vernon': 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3014.5683547162794!2d-73.8358937!3d40.9252093!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c28d93448f3d43%3A0xa94d190591d8e217!2sCravin%20Jamaican%20Cuisine%20Mount%20Vernon!5e0!3m2!1sen!2sus!4v1772632638799!5m2!1sen!2sus',
};

export default function LocationsPage() {
  return (
    <main>
      {/* PAGE HERO */}
      <section className="page-hero" id="main-content">
        <div className="container">
          <h1>Our Locations</h1>
          <p>Three restaurants across Westchester County, New York.</p>
        </div>
      </section>

      {/* QUICK LINKS */}
      <div className="location-quicklinks">
        <div className="container">
          {locations.map((loc) => (
            <a key={loc.id} href={`#${loc.id}`} className="quicklink">{loc.shortName}</a>
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
                  <tbody>
                    <tr><th>Day</th><th>Hours</th></tr>
                    {loc.hours.map((h) => (
                      <tr key={h.day}><td>{h.day}</td><td>{h.hours}</td></tr>
                    ))}
                  </tbody>
                </table>
                <div className="location-detail-actions">
                  <Link href="/order" className="btn btn-warm">Order Online</Link>
                  <a href={loc.googleMapsUrl} className="btn btn-outline-green" target="_blank" rel="noopener noreferrer">Get Directions</a>
                </div>
              </div>
              <div className="location-storefront-block">
                <Image
                  src={loc.storefrontImage}
                  alt={`Cravin Jamaican Cuisine ${loc.shortName} storefront`}
                  width={600}
                  height={400}
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
    </main>
  );
}
