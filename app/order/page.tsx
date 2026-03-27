import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { locations, brand } from '@/lib/site-data';

export const metadata: Metadata = {
  title: 'Order Online',
  description: 'Order Cravin Jamaican Cuisine for pickup or delivery via Uber Eats. Three Westchester County locations in Ossining, White Plains, and Mount Vernon.',
};

function PhoneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

export default function OrderPage() {
  return (
    <main>
      {/* PAGE HERO */}
      <section className="page-hero" id="main-content">
        <div className="container">
          <h1>Order Online</h1>
          <p>Choose your location and favorite ordering platform.</p>
        </div>
      </section>

      {/* ORDER SECTION */}
      <section className="order-section">
        <div className="container">
          <div className="order-grid">
            {locations.map((loc) => (
              <div key={loc.id} className="order-card">
                <div className="order-card-header">
                  <h3>{loc.shortName}</h3>
                  <p>{loc.fullAddress}</p>
                </div>
                <div className="order-card-body">
                  <a href={`tel:${loc.phone}`} className="order-platform">
                    <span className="platform-icon platform-icon-phone" aria-hidden="true">
                      <PhoneIcon />
                    </span>
                    <span className="platform-label">Call to Order</span>
                    <span className="platform-type">Pickup</span>
                  </a>
                  {loc.ordering.ubereats && (
                    <a href={loc.ordering.ubereats} className="order-platform" target="_blank" rel="noopener noreferrer">
                      <span className="platform-icon platform-icon-ubereats" aria-hidden="true">UE</span>
                      <span className="platform-label">Uber Eats</span>
                      <span className="platform-type">Delivery</span>
                    </a>
                  )}
                  <div className="order-phone">
                    <span>Or call:</span>
                    <a href={`tel:${loc.phone}`}>{loc.phoneFormatted}</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATERING */}
      <section className="catering" style={{ paddingTop: 40 }}>
        <div className="container">
          <div className="catering-card">
            <div className="catering-img" role="img" aria-label="Jamaican catering spread">
              <Image src="/img/jerk-chicken-plate.jpg" alt="" fill sizes="50vw" quality={75} />
            </div>
            <div className="catering-content">
              <span className="section-label">Large Orders?</span>
              <h2>Catering for Any Event</h2>
              <p>Planning an event for 10+ guests? Our catering team will create a custom menu for your occasion.</p>
              <Link href="/catering" className="btn btn-warm">Get a Catering Quote &rarr;</Link>
              <a href={brand.ezcaterUrl} className="btn btn-outline-green" target="_blank" rel="noopener noreferrer">Order via EZCater &rarr;</a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
