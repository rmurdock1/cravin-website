import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { socialLinks } from '@/lib/site-data';

export const metadata: Metadata = {
  title: 'Our Story',
  description: "Learn about Cravin Jamaican Cuisine — Peter Murdock's journey from Ossining to three Westchester County locations since 2015.",
};

export default function AboutPage() {
  return (
    <main>
      {/* PAGE HERO */}
      <section className="page-hero" id="main-content">
        <div className="container">
          <h1>Our Story</h1>
          <p className="page-hero-subtitle">Three locations, one family, generations of Jamaican flavor.</p>
        </div>
      </section>

      {/* ABOUT STORY */}
      <section className="about-story">
        <div className="container">
          <div className="about-grid">
            <div className="about-text">
              <span className="section-label">Our Story</span>
              <h2>A Taste of Jamaica, Right at Home</h2>
              <p>An experienced team of employees producing authentic Jamaican food with the finest ingredients to satisfy the customers&apos; cravings with a taste of Jamaica. We look forward to serving a diverse community, who are Cravin&apos; authentic home cooked Jamaican flavors.</p>
              <p className="about-attribution">- Peter Murdock, Owner</p>
            </div>
            <div className="about-image">
              <Image src="/img/about-hero.jpg" alt="Cravin Jamaican Cuisine kitchen" width={600} height={400} />
            </div>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="values-section">
        <div className="container">
          <div className="values-header">
            <span className="section-label">What Drives Us</span>
            <h2 className="section-title">Our Values</h2>
          </div>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon" aria-hidden="true">&#127860;</div>
              <h3>Authenticity</h3>
              <p>Every recipe is rooted in Jamaican tradition. We use only the finest ingredients to satisfy our customers&apos; cravings with an authentic taste of Jamaica.</p>
            </div>
            <div className="value-card">
              <div className="value-icon" aria-hidden="true">&#128149;</div>
              <h3>Family</h3>
              <p>We treat every customer like family. Our restaurants are gathering places where a diverse community comes together over incredible food.</p>
            </div>
            <div className="value-card">
              <div className="value-icon" aria-hidden="true">&#127793;</div>
              <h3>Freshness</h3>
              <p>We source the freshest ingredients daily. No shortcuts, no compromises. Just real food made from scratch, the Jamaican way.</p>
            </div>
          </div>
        </div>
      </section>

      {/* MEDIA COVERAGE */}
      <section className="press-section">
        <div className="container">
          <div className="values-header">
            <span className="section-label section-label-green">In The Spotlight</span>
            <h2 className="section-title">Media Coverage &amp; Recognition</h2>
            <p className="section-subtitle">Featured in local press and loved by the community.</p>
          </div>

          {/* Press Articles */}
          <div className="press-articles">
            <a href="https://westchestermagazine.com/food/black-owned-restaurants-westchester/" className="press-article-card" target="_blank" rel="noopener noreferrer">
              <span className="press-source">Westchester Magazine</span>
              <h4>Black-Owned Food Spots in Westchester to Visit Right Now</h4>
              <p>&ldquo;A casual, no-fuss spot that serves a satisfying selection of Jamaican staples... appetizing, authentic Jamaican home-cooked meals.&rdquo;</p>
            </a>
            <a href="https://theimpactnews.com/columnists/retired-columnists/tracing/2020/11/30/from-immigrant-to-entrepreneur/" className="press-article-card" target="_blank" rel="noopener noreferrer">
              <span className="press-source">The Impact News</span>
              <h4>From Immigrant to Entrepreneur</h4>
              <p>A profile of Peter Murdock&rsquo;s journey from a long drive to the Bronx for jerk chicken, to building a restaurant empire in Westchester County.</p>
            </a>
            <a href="https://dailyvoice.com/new-york/mountpleasant/lifestyle/popular-restaurant-opens-new-location-in-westchester-county/816281/" className="press-article-card" target="_blank" rel="noopener noreferrer">
              <span className="press-source">Daily Voice</span>
              <h4>Popular Restaurant Opens New Location in Westchester County</h4>
              <p>Ribbon-cutting ceremony with White Plains Mayor Thomas Roach at the grand opening of our second location on Mamaroneck Ave.</p>
            </a>
            <a href="https://westfaironline.com/restaurants/ossinings-cravin-jamaican-opens-new-location-in-white-plains/" className="press-article-card" target="_blank" rel="noopener noreferrer">
              <span className="press-source">Westfair Business Journal</span>
              <h4>Ossining&rsquo;s Cravin Jamaican Opens New Location in White Plains</h4>
              <p>Business press coverage of Cravin&rsquo;s expansion from our flagship Ossining location to White Plains in 2021.</p>
            </a>
            <a href="https://ossininginnovates.com/all-events-past-and-future/2017/9/14/meet-the-entrepreneur-next-door-ken-coogan-amp-peter-murdoch" className="press-article-card" target="_blank" rel="noopener noreferrer">
              <span className="press-source">Ossining Innovates</span>
              <h4>Meet the Entrepreneur Next Door</h4>
              <p>&ldquo;Use all of your experiences to passionately fuel yourself forward.&rdquo; - Peter Murdock, featured entrepreneur.</p>
            </a>
            <a href="https://www.eatokra.com/businesses/cravin-jamaican-cuisine" className="press-article-card" target="_blank" rel="noopener noreferrer">
              <span className="press-source">EatOkra</span>
              <h4>Verified Black-Owned Business</h4>
              <p>Listed on EatOkra, the national directory connecting communities with Black-owned restaurants and food businesses.</p>
            </a>
          </div>

          {/* Ratings & Social */}
          <div className="press-grid" style={{ marginTop: 48 }}>
            <div className="press-embed">
              <blockquote
                className="tiktok-embed"
                cite="https://www.tiktok.com/@shereenadelgado/video/7212270911318166830"
                data-video-id="7212270911318166830"
                style={{ maxWidth: 605, minWidth: 325 }}
              >
                <section>
                  <a target="_blank" href="https://www.tiktok.com/@shereenadelgado?refer=embed" rel="noopener noreferrer">@shereenadelgado</a>
                  <p>I Bet Im Not The Only One Cravin 10/10 #restaurantlife #foodie #foodtiktok #minivlog #jamaicanfoodtiktok #whiteplainsny</p>
                </section>
              </blockquote>
            </div>
            <div className="press-highlights">
              <div className="press-card">
                <div className="press-icon" aria-hidden="true">&#11088;</div>
                <h4>#3 Best Jamaican in Westchester</h4>
                <p>Ranked <strong>#3 for Best Jamaican Food in Westchester County</strong> on TripAdvisor, with a 4.4/5 rating across 500+ reviews.</p>
              </div>
              <div className="press-card">
                <div className="press-icon" aria-hidden="true">&#127942;</div>
                <h4>Business Excellence Award</h4>
                <p>Awarded the <strong>Business Excellence Award by Westchester County</strong> in 2025 for nearly 10 years of outstanding service. May 21st was officially declared <strong>Cravin Jamaican Cuisine Day</strong>.</p>
              </div>
              <div className="press-card">
                <div className="press-icon" aria-hidden="true">&#127775;</div>
                <h4>Notable Catering Clients</h4>
                <p>Trusted by the <strong>U.S. Army</strong> and <strong>Coca-Cola</strong> for catering events, alongside hundreds of corporate and private celebrations.</p>
              </div>
              <div className="press-card">
                <div className="press-icon" aria-hidden="true">&#128248;</div>
                <h4>Follow Us</h4>
                <p>Stay up to date with our latest dishes, specials, and events.</p>
                <div className="press-social">
                  <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
                  <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer">Facebook</a>
                  <a href="https://www.tiktok.com/discover/cravin-jamaican-white-plains" target="_blank" rel="noopener noreferrer">TikTok</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STORY PARALLAX */}
      <section className="story">
        <div className="story-bg" aria-hidden="true"></div>
        <div className="container">
          <div className="story-content">
            <span className="section-label">Growing Together</span>
            <h2>Servicing a Diverse Community Since 2015</h2>
            <p>We opened our doors in Ossining with a passion for sharing authentic Jamaican flavors. The community embraced us, and word spread fast. Today, with locations in Ossining, White Plains, and Mount Vernon, we&apos;re proud to serve thousands of customers who&apos;ve become part of the Cravin family.</p>
            <div className="story-values">
              <div className="story-value">
                <h4>3</h4>
                <p>Locations</p>
              </div>
              <div className="story-value story-value-green">
                <h4>Since 2015</h4>
                <p>Serving NY</p>
              </div>
              <div className="story-value">
                <h4>435+</h4>
                <p>Events Catered</p>
              </div>
            </div>
            <Link href="/locations" className="btn btn-warm">Visit Us</Link>
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
            <form className="newsletter-form" action="#" method="post">
              <label htmlFor="newsletter-email" className="sr-only" style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0,0,0,0)', border: 0 }}>Email address</label>
              <input type="email" id="newsletter-email" placeholder="Your email address" required />
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
