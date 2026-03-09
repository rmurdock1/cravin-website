import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { locations, socialLinks } from '@/lib/site-data';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: "Questions, feedback, or catering inquiries? Contact Cravin Jamaican Cuisine. Call, email, or send us a message.",
};

export default function ContactPage() {
  return (
    <main>
      {/* PAGE HERO */}
      <section className="page-hero" id="main-content">
        <div className="container">
          <h1>Contact Us</h1>
          <p className="page-hero-subtitle">Questions, feedback, or catering inquiries? We&apos;d love to hear from you.</p>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section className="contact-section">
        <div className="container">
          <div className="contact-grid">

            {/* Contact Info */}
            <div className="contact-info">
              <h2>Get In Touch</h2>

              <div className="contact-method">
                <div className="contact-icon" aria-hidden="true">&#128222;</div>
                <h4>Phone</h4>
                <p>
                  Ossining: <a href={`tel:${locations[0].phone}`}>{locations[0].phoneFormatted}</a><br />
                  White Plains: <a href={`tel:${locations[1].phone}`}>{locations[1].phoneFormatted}</a><br />
                  Mount Vernon: <a href={`tel:${locations[2].phone}`}>{locations[2].phoneFormatted}</a>
                </p>
              </div>

              <div className="contact-method">
                <div className="contact-icon" aria-hidden="true">&#128231;</div>
                <h4>Email</h4>
                <p>
                  Ossining: <a href={`mailto:${locations[0].email}`}>{locations[0].email}</a><br />
                  White Plains &amp; Mt Vernon: <a href={`mailto:${locations[1].email}`}>{locations[1].email}</a>
                </p>
              </div>

              <div className="contact-method">
                <div className="contact-icon" aria-hidden="true">&#128205;</div>
                <h4>Locations</h4>
                <p>
                  Ossining &middot; White Plains &middot; Mount Vernon<br />
                  <Link href="/locations">View all locations &amp; hours</Link>
                </p>
              </div>

              <div style={{ marginTop: 32 }}>
                <h4 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Follow Us</h4>
                <div className="footer-social">
                  <a href={socialLinks.instagram} aria-label="Instagram" target="_blank" rel="noopener noreferrer">IG</a>
                  <a href={socialLinks.facebook} aria-label="Facebook" target="_blank" rel="noopener noreferrer">FB</a>
                  <a href={socialLinks.yelp} aria-label="Yelp" target="_blank" rel="noopener noreferrer">Yelp</a>
                  <a href={socialLinks.twitter} aria-label="Twitter" target="_blank" rel="noopener noreferrer">TW</a>
                </div>
              </div>
            </div>

            {/* Contact Form Card */}
            <div className="contact-form-card">
              <h3>Send Us a Message</h3>
              <form name="contact" method="POST" action="/success">
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="contact-name">Full Name</label>
                    <input type="text" id="contact-name" name="name" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="contact-email">Email</label>
                    <input type="email" id="contact-email" name="email" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="contact-phone">Phone</label>
                    <input type="tel" id="contact-phone" name="phone" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="contact-subject">Subject</label>
                    <select id="contact-subject" name="subject">
                      <option value="general">General Inquiry</option>
                      <option value="catering">Catering</option>
                      <option value="feedback">Feedback</option>
                      <option value="press">Press/Media</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="form-group full">
                    <label htmlFor="contact-message">Message</label>
                    <textarea id="contact-message" name="message" rows={5} placeholder="How can we help?" required></textarea>
                  </div>
                  {/* Honeypot */}
                  <input type="text" name="website" className="hp-field" tabIndex={-1} autoComplete="off" />
                  <div className="form-submit">
                    <button type="submit" className="btn btn-warm">Send Message</button>
                  </div>
                </div>
              </form>
            </div>

          </div>
        </div>
      </section>

      {/* LOCATIONS */}
      <section className="locations">
        <div className="container">
          <div className="locations-header">
            <span className="section-label section-label-green">Visit Us</span>
            <h2 className="section-title">Our Locations</h2>
            <p className="section-subtitle">Three locations across New York, each serving the same authentic Jamaican flavors.</p>
          </div>
          <div className="locations-grid">
            {locations.map((loc) => (
              <div key={loc.id} className="location-card">
                <div className="location-map">
                  <Image src={loc.storefrontImage} alt={`Cravin Jamaican Cuisine ${loc.shortName} storefront`} width={400} height={250} />
                </div>
                <div className="location-info">
                  <h3>{loc.shortName}</h3>
                  <div className="location-detail">
                    <span className="icon" aria-hidden="true">&#128205;</span>
                    <span>{loc.fullAddress}</span>
                  </div>
                  <div className="location-detail">
                    <span className="icon" aria-hidden="true">&#128222;</span>
                    <a href={`tel:${loc.phone}`}>{loc.phoneFormatted}</a>
                  </div>
                  <div className="location-detail">
                    <span className="icon" aria-hidden="true">&#128336;</span>
                    <span>{loc.hoursShort}</span>
                  </div>
                  <div className="location-actions">
                    <Link href="/order" className="btn btn-warm">Order</Link>
                    <Link href={`/locations#${loc.id}`} className="btn btn-outline-green">Details</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
