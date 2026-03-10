import Image from 'next/image';
import Link from 'next/link';
import { locations, brand } from '@/lib/site-data';
import { getRestaurantJsonLd } from '@/lib/json-ld';

export default function HomePage() {
  const jsonLd = getRestaurantJsonLd();

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* HERO */}
      <section className="hero" id="main-content">
        <div className="hero-bg">
          <Image src="/img/food-spread.jpeg" alt="Authentic Jamaican food spread featuring jerk chicken, rice and peas, and plantain" fill priority style={{ objectFit: 'cover' }} />
        </div>
        <div className="container">
          <div className="hero-content">
            <h1>Authentic Jamaican Cuisine, Served With Soul.</h1>
            <p className="hero-subtitle">
              Jerk chicken grilled over pimento wood. Oxtail simmered for hours.
              Ackee &amp; saltfish made the real way. Three locations in Westchester County.
            </p>
            <div className="hero-actions">
              <Link href="/order" className="btn btn-warm">Order Online &rarr;</Link>
              <Link href="/menu" className="btn btn-outline-green">View Menu</Link>
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <h3>435+</h3>
                <p>Events Catered</p>
              </div>
              <div className="hero-stat">
                <h3>3</h3>
                <p>Locations</p>
              </div>
              <div className="hero-stat">
                <h3>Since &apos;15</h3>
                <p>Serving Westchester</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED DISHES */}
      <section className="featured" id="menu-preview">
        <div className="container">
          <div className="featured-header">
            <div>
              <span className="section-label">Our Menu</span>
              <h2 className="section-title">What We&apos;re Known For</h2>
              <p className="section-subtitle">The dishes our customers order again and again.</p>
            </div>
            <Link href="/menu" className="btn btn-outline-green">Full Menu &rarr;</Link>
          </div>
          <div className="featured-grid">
            <div className="featured-card featured-card-hero">
              <div className="featured-img">
                <Image src="/img/jerk-chicken-plate.jpg" alt="Jerk Chicken plate with rice and peas and fried plantain" width={600} height={400} />
                <span className="featured-tag">Most Popular</span>
              </div>
              <div className="featured-info">
                <h3>Jerk Chicken</h3>
                <p>Slow-marinated overnight, grilled over pimento wood with our signature scotch bonnet jerk sauce. Served with rice &amp; peas and fried plantain.</p>
                <div className="featured-footer">
                  <span className="featured-price">$15.99</span>
                  <Link href="/order" className="featured-order">Order Now &rarr;</Link>
                </div>
              </div>
            </div>
            <div className="featured-card">
              <div className="featured-img">
                <Image src="/img/jerk-chicken-close.jpg" alt="Oxtail Stew in rich savory gravy" width={400} height={300} />
                <span className="featured-tag featured-tag-green">Chef&apos;s Pick</span>
              </div>
              <div className="featured-info">
                <h3>Oxtail Stew</h3>
                <p>Fall-off-the-bone tender in a rich, savory gravy with butter beans.</p>
                <div className="featured-footer">
                  <span className="featured-price">$19.99</span>
                  <Link href="/order" className="featured-order">Order Now &rarr;</Link>
                </div>
              </div>
            </div>
            <div className="featured-card">
              <div className="featured-img">
                <Image src="/img/ackee-saltfish.jpg" alt="Ackee and Saltfish, Jamaica's national dish" width={400} height={300} />
              </div>
              <div className="featured-info">
                <h3>Ackee &amp; Saltfish</h3>
                <p>Jamaica&apos;s national dish: ackee with salted cod, peppers &amp; onions.</p>
                <div className="featured-footer">
                  <span className="featured-price">$16.99</span>
                  <Link href="/order" className="featured-order">Order Now &rarr;</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STORY */}
      <section className="story">
        <div className="story-bg" aria-hidden="true">
          <Image src="/img/jerk-chicken-close.jpg" alt="" fill sizes="100vw" quality={75} />
        </div>
        <div className="container">
          <div className="story-content">
            <span className="section-label">Our Story</span>
            <h2>From Our Family Kitchen to Yours</h2>
            <p>
              Peter Murdock opened Cravin in Ossining in 2015 with one goal: cook
              real Jamaican food the way his family made it back home. A decade later,
              that same kitchen has grown into three locations across Westchester,
              each one still cooking from scratch, every single day.
            </p>
            <div className="story-values">
              <div className="story-value">
                <h4>3</h4>
                <p>Locations</p>
              </div>
              <div className="story-value story-value-green">
                <h4>Fresh</h4>
                <p>Daily</p>
              </div>
              <div className="story-value">
                <h4>Family</h4>
                <p>Recipes</p>
              </div>
            </div>
            <Link href="/about" className="btn btn-warm">Learn More</Link>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="social-proof">
        <div className="container">
          <div className="proof-card">
            <span className="proof-quote-mark" aria-hidden="true">&ldquo;</span>
            <blockquote className="proof-quote">&ldquo;10/10... I bet I&rsquo;m not the only one Cravin&rsquo;&rdquo;</blockquote>
            <div className="proof-attribution">
              <span className="proof-author">- @shereenadelgado</span>
              <span className="proof-source">TikTok Food Creator</span>
            </div>
            <a href="https://www.tiktok.com/@shereenadelgado/video/7212270911318166830" className="proof-link" target="_blank" rel="noopener noreferrer">Watch the full review &rarr;</a>
          </div>
        </div>
      </section>

      {/* LOCATIONS */}
      <section className="locations">
        <div className="container">
          <div className="locations-header">
            <span className="section-label section-label-green">Visit Us</span>
            <h2 className="section-title">Our Locations</h2>
            <p className="section-subtitle">Three locations across Westchester County, all open six days a week.</p>
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

      {/* CATERING */}
      <section className="catering">
        <div className="container">
          <div className="catering-card">
            <div className="catering-img" role="img" aria-label="Jamaican catering spread">
              <Image src="/img/jerk-chicken-plate.jpg" alt="" fill sizes="50vw" quality={75} />
            </div>
            <div className="catering-content">
              <span className="section-label">Catering</span>
              <h2>Bring Jamaica To Your Next Event</h2>
              <p>
                435+ catering orders and counting. Corporate lunches, weddings,
                birthday parties. We bring the full Jamaican spread to you.
              </p>
              <div className="catering-list">
                <div className="catering-list-item">
                  <span className="dot" aria-hidden="true"></span> Corporate Events &amp; Office Lunches
                </div>
                <div className="catering-list-item">
                  <span className="dot" aria-hidden="true"></span> Weddings, Birthdays &amp; Memorials
                </div>
                <div className="catering-list-item">
                  <span className="dot" aria-hidden="true"></span> 10 to 500 Guests, Half or Full Pans
                </div>
                <div className="catering-list-item">
                  <span className="dot" aria-hidden="true"></span> Rated 4.9/5 on ezCater
                </div>
              </div>
              <Link href="/catering" className="btn btn-warm">Get a Quote &rarr;</Link>
            </div>
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="newsletter" aria-label="Newsletter signup">
        <div className="container">
          <div className="newsletter-card">
            <span className="section-label">Stay Connected</span>
            <h2>Join the Cravin Family</h2>
            <p>Exclusive discounts, new menu drops, and event invites delivered to your inbox.</p>
            <form className="newsletter-form" name="newsletter" method="POST" action="/success" data-netlify="true" netlify-honeypot="website">
              <label htmlFor="newsletter-email-home" className="sr-only">Email address</label>
              <input type="email" id="newsletter-email-home" name="email" placeholder="Your email address" required />
              <input type="text" name="website" className="hp-field" tabIndex={-1} autoComplete="off" />
              <button type="submit" className="btn btn-warm">Subscribe</button>
            </form>
            <div className="newsletter-perks">
              <span>10% welcome discount</span>
              <span>Early menu access</span>
              <span>Event invitations</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
