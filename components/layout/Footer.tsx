import Link from 'next/link';
import Image from 'next/image';
import logo from '@/public/img/logo-nav.png';
import { socialLinks, locations, comingSoonLocations } from '@/lib/site-data';

export function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <span className="footer-logo">
              <Image src={logo} alt="Cravin Jamaican Cuisine" width={55} height={63} />
            </span>
            <p>
              Authentic Jamaican cuisine made with love. Three locations
              in New York, one unforgettable taste of home.
            </p>
            <div className="footer-social">
              <a href={socialLinks.instagram} aria-label="Instagram" target="_blank" rel="noopener noreferrer">IG</a>
              <a href={socialLinks.facebook} aria-label="Facebook" target="_blank" rel="noopener noreferrer">FB</a>
              <a href={socialLinks.twitter} aria-label="Twitter" target="_blank" rel="noopener noreferrer">TW</a>
            </div>
          </div>
          <div className="footer-col">
            <h4>Menu</h4>
            <Link href="/menu">Breakfast</Link>
            <Link href="/menu">Lunch &amp; Dinner</Link>
            <Link href="/menu">Sides</Link>
            <Link href="/menu">Beverages</Link>
            <Link href="/catering">Catering Menu</Link>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <Link href="/about">Our Story</Link>
            <Link href="/locations">Locations</Link>
            {/* Direct links to each per-location page — internal links help
                Google discover and index them. */}
            {locations.map((loc) => (
              <Link key={loc.id} href={`/${loc.id}`}>{loc.shortName}</Link>
            ))}
            {comingSoonLocations.map((loc) => (
              <Link key={loc.id} href={`/locations#${loc.id}`}>
                {loc.shortName} <span className="footer-soon">(coming soon)</span>
              </Link>
            ))}
            <Link href="/careers">Careers</Link>
            <Link href="/about#press">Press</Link>
          </div>
          <div className="footer-col">
            <h4>Support</h4>
            <Link href="/contact">Contact Us</Link>
            <Link href="/order">Order Online</Link>
            <Link href="/catering">Catering Inquiry</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Cravin Jamaican Cuisine. All rights reserved.</p>
          <p>&nbsp;</p>
        </div>
      </div>
    </footer>
  );
}
