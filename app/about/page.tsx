import type { Metadata } from 'next';
import Script from 'next/script';
import Image from 'next/image';
import Link from 'next/link';
import { socialLinks } from '@/lib/site-data';

export const metadata: Metadata = {
  title: 'Our Story',
  description: "Learn about Cravin Jamaican Cuisine. Peter Murdock's journey from Ossining to three Westchester County locations since 2015. Community, catering, and authentic Jamaican flavor.",
};

export default function AboutPage() {
  return (
    <main>
      {/* PAGE HERO — Grand Opening Crowd Photo */}
      <section className="about-hero-full" id="main-content">
        <div className="about-hero-bg" aria-hidden="true">
          <Image src="/img/our_story/grand-opening-crowd.jpg" alt="" fill sizes="100vw" quality={80} priority />
        </div>
        <div className="about-hero-overlay" />
        <div className="container about-hero-content">
          <h1>Our Story</h1>
          <p className="page-hero-subtitle">Three locations, one family, generations of Jamaican flavor.</p>
        </div>
      </section>

      {/* ABOUT STORY */}
      <section className="about-story" id="story">
        <div className="container">
          <div className="about-grid">
            <div className="about-text">
              <span className="section-label">Our Story</span>
              <h2>A Taste of Jamaica, Right at Home</h2>
              <p>Since opening our first location in Ossining in September 2015, Cravin Jamaican Cuisine has become a beloved staple in the community. We&apos;re known for serving authentic Jamaican dishes with heart and hospitality, and from the start, we&apos;ve focused on delivering high-quality, home-cooked meals while building real connections with the people we serve.</p>
              <p>An experienced team producing authentic Jamaican food with the finest ingredients to satisfy your cravings with a taste of Jamaica. We look forward to serving a diverse community, who are Cravin&apos; authentic home cooked Jamaican flavors.</p>
              <p className="about-attribution">- Peter Murdock, Owner</p>
            </div>
            <div className="about-image">
              <Image src="/img/our_story/wp-grand-opening-storefront.jpg" alt="Cravin Jamaican Cuisine White Plains grand opening with crowd outside the storefront" width={600} height={400} />
            </div>
          </div>
        </div>
      </section>

      {/* COMMUNITY & GIVING BACK */}
      <section className="community-section" id="community">
        <div className="container">
          <div className="values-header">
            <span className="section-label section-label-green">Giving Back</span>
            <h2 className="section-title">Rooted in Community</h2>
            <p className="section-subtitle">More than a restaurant. We serve with love, feed with purpose, and uplift with every meal.</p>
          </div>

          <div className="community-grid">
            {/* Youth & Education */}
            <div className="community-card">
              <div className="community-icon" aria-hidden="true">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1.66 2.69 3 6 3s6-1.34 6-3v-5"/></svg>
              </div>
              <h3>Youth &amp; Education</h3>
              <p>Many of our team members are high school and college students, and for many, Cravin is their first job. We provide school supplies, financial support, and real-world experience to help them succeed.</p>
              <div className="community-partners">
                <a href="https://www.stepinac.org" target="_blank" rel="noopener noreferrer">Stepinac High School</a>
                <a href="https://www.facebook.com/SlaterCommunityCenter/" target="_blank" rel="noopener noreferrer">Slater Center</a>
              </div>
            </div>

            {/* Disaster Relief */}
            <div className="community-card">
              <div className="community-icon" aria-hidden="true">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 11v8a1 1 0 01-1 1H4a1 1 0 01-1-1v-8a1 1 0 011-1h2a1 1 0 011 1z"/><path d="M11 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4a2 2 0 01-2-2V5a2 2 0 012-2z"/><path d="M21 7v12a2 2 0 01-2 2h-1"/></svg>
              </div>
              <h3>Disaster Relief &amp; Frontline Heroes</h3>
              <p>We proudly partnered with the U.S. Army to serve meals during relief efforts for Hurricane Sandy, Hurricane Maria, and the COVID-19 pandemic. We also fed frontline heroes at <a href="https://www.northwell.edu/find-care/locations/phelps-hospital" target="_blank" rel="noopener noreferrer">Northwell Phelps Hospital</a> and Columbia Presbyterian Hospital.</p>
            </div>

            {/* Local Partnerships */}
            <div className="community-card">
              <div className="community-icon" aria-hidden="true">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              </div>
              <h3>Local Partnerships</h3>
              <p>We consistently support families in need by providing meals and partnering with organizations like BOMA, which offers food and shelter locally. We&apos;ve also provided catering for <a href="https://www.childrensvillage.org" target="_blank" rel="noopener noreferrer">The Children&apos;s Village</a> and numerous community organizations.</p>
            </div>

            {/* International Outreach */}
            <div className="community-card">
              <div className="community-icon" aria-hidden="true">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
              </div>
              <h3>International Outreach</h3>
              <p>Our giving extends beyond Westchester. We&apos;ve supported an orphanage in Ghana, West Africa, sending food, school supplies, and even providing a truck to help with transportation.</p>
            </div>
          </div>

          {/* Proclamations Photo */}
          <div className="community-awards" id="awards">
            <div className="community-awards-image">
              <Image src="/img/our_story/proclamations.jpg" alt="Cravin Jamaican Cuisine proclamations and Business Excellence Award" width={800} height={500} />
            </div>
            <div className="community-awards-text">
              <div className="awards-trophy-icon" aria-hidden="true">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--warm)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 010-5H6"/><path d="M18 9h1.5a2.5 2.5 0 000-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 1012 0V2z"/></svg>
              </div>
              <h3>Officially Recognized</h3>
              <p>In May 2025, Cravin Jamaican Cuisine received the <strong>Business Excellence Award from Westchester County</strong> and proclamations from <strong>NY State Senator Andrea Stewart-Cousins</strong>, the <strong>City of White Plains</strong>, and the <strong>Westchester County Board of Legislators</strong>. May 21st was officially declared <strong>Cravin Jamaican Cuisine Day</strong>.</p>
            </div>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="values-section" id="values">
        <div className="container">
          <div className="values-header">
            <span className="section-label">What Drives Us</span>
            <h2 className="section-title">Our Values</h2>
          </div>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon-svg" aria-hidden="true">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--warm)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
              </div>
              <h3>Authenticity</h3>
              <p>Every recipe is rooted in Jamaican tradition. We use only the finest ingredients to satisfy our customers&apos; cravings with an authentic taste of Jamaica.</p>
            </div>
            <div className="value-card">
              <div className="value-icon-svg" aria-hidden="true">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
              </div>
              <h3>Community</h3>
              <p>From local hospitals and schools to international relief efforts, we are dedicated to giving back and lifting others with every meal we serve.</p>
            </div>
            <div className="value-card">
              <div className="value-icon-svg" aria-hidden="true">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--warm)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
              </div>
              <h3>Freshness</h3>
              <p>We source the freshest ingredients daily. No shortcuts, no compromises. Just real food made from scratch, the Jamaican way.</p>
            </div>
          </div>
        </div>
      </section>

      {/* MEDIA COVERAGE */}
      <section className="press-section" id="press">
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
              <p>A profile of Peter Murdock&apos;s journey from a long drive to the Bronx for jerk chicken, to building a restaurant empire in Westchester County.</p>
            </a>
            <a href="https://dailyvoice.com/new-york/mountpleasant/lifestyle/popular-restaurant-opens-new-location-in-westchester-county/816281/" className="press-article-card" target="_blank" rel="noopener noreferrer">
              <span className="press-source">Daily Voice</span>
              <h4>Popular Restaurant Opens New Location in Westchester County</h4>
              <p>Ribbon-cutting ceremony with White Plains Mayor Thomas Roach at the grand opening of our second location on Mamaroneck Ave.</p>
            </a>
            <a href="https://westfaironline.com/restaurants/ossinings-cravin-jamaican-opens-new-location-in-white-plains/" className="press-article-card" target="_blank" rel="noopener noreferrer">
              <span className="press-source">Westfair Business Journal</span>
              <h4>Ossining&apos;s Cravin Jamaican Opens New Location in White Plains</h4>
              <p>Business press coverage of Cravin&apos;s expansion from our flagship Ossining location to White Plains in 2021.</p>
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

          {/* TikTok & Highlights */}
          <div className="press-grid" style={{ marginTop: 48 }}>
            <div className="press-embed">
              <blockquote
                className="tiktok-embed"
                cite="https://www.tiktok.com/@peter_murdock7/video/7577871136034180382"
                data-video-id="7577871136034180382"
                style={{ maxWidth: 605, minWidth: 325 }}
              >
                <section>
                  <a target="_blank" href="https://www.tiktok.com/@peter_murdock7?refer=embed" rel="noopener noreferrer">@peter_murdock7</a>
                  <p>Grand Opening, Cravin Jamaican Cuisine</p>
                </section>
              </blockquote>
            </div>
            <div className="press-highlights">
              <div className="press-card">
                <div className="press-icon" aria-hidden="true">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--warm)" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                </div>
                <h4>Business Excellence Award</h4>
                <p>Awarded the <strong>Business Excellence Award by Westchester County</strong> in 2025 for nearly 10 years of outstanding service. May 21st was officially declared <strong>Cravin Jamaican Cuisine Day</strong>.</p>
              </div>
              <div className="press-card">
                <div className="press-icon" aria-hidden="true">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--warm)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>
                </div>
                <h4>Notable Catering Clients</h4>
                <p>Trusted by <strong>Amazon</strong>, the <strong>U.S. Army</strong>, and <strong>Coca-Cola</strong> for catering events, alongside hundreds of corporate and private celebrations.</p>
              </div>
              <div className="press-card">
                <div className="press-icon" aria-hidden="true">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                </div>
                <h4>Community First</h4>
                <p>From feeding frontline heroes at <strong>Northwell Phelps</strong> and <strong>Columbia Presbyterian</strong> hospitals to supporting an orphanage in <strong>Ghana</strong>, our mission extends far beyond Westchester.</p>
              </div>
              <div className="press-card">
                <div className="press-icon" aria-hidden="true">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
                </div>
                <h4>Follow Us</h4>
                <p>Stay up to date with our latest dishes, specials, and events.</p>
                <div className="press-social">
                  <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
                  <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer">Facebook</a>
                  <a href="https://www.tiktok.com/@peter_murdock7" target="_blank" rel="noopener noreferrer">TikTok</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MILESTONES PARALLAX */}
      <section className="story" id="milestones">
        <div className="story-bg" aria-hidden="true">
          <Image src="/img/jerk-chicken-close.jpg" alt="" fill sizes="100vw" quality={75} />
        </div>
        <div className="container">
          <div className="story-content">
            <span className="section-label">Our Milestones</span>
            <h2>From Ossining to Three Locations</h2>
            <p>What started as a single storefront in 2015 has grown into three restaurants across Westchester County. White Plains opened in September 2021, and Mount Vernon followed in May 2024. Every location cooks from scratch, every single day.</p>
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
                <h4>500+</h4>
                <p>Events Catered</p>
              </div>
            </div>
            <Link href="/locations" className="btn btn-warm">Visit Us</Link>
          </div>
        </div>
      </section>

      {/* JOIN THE TEAM */}
      <section className="careers-cta-section">
        <div className="container">
          <div className="careers-cta-banner">
            <div className="careers-cta-text">
              <span className="section-label">Join Us</span>
              <h2>We&apos;re Hiring</h2>
              <p>Love great food and great people? We&apos;re always looking for passionate team members across our three locations. Check out our open positions.</p>
            </div>
            <Link href="/careers" className="btn btn-warm">View Open Positions &rarr;</Link>
          </div>
        </div>
      </section>

      {/* TikTok Embed Script */}
      <Script src="https://www.tiktok.com/embed.js" strategy="lazyOnload" />
    </main>
  );
}
