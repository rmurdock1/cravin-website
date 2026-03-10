import type { Metadata } from 'next';
import { MenuTabs } from '@/components/menu/MenuTabs';
import { getMenuJsonLd } from '@/lib/json-ld';

export const metadata: Metadata = {
  title: 'Menu',
  description: 'Explore the full menu at Cravin Jamaican Cuisine. Breakfast, lunch, dinner, sides and beverages. Jerk chicken, oxtail, ackee & saltfish, curry goat and more.',
};

export default function MenuPage() {
  const jsonLd = getMenuJsonLd();

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* PAGE HERO */}
      <section className="page-hero" id="main-content">
        <div className="container">
          <h1>Our Menu</h1>
          <p className="page-hero-subtitle">Authentic Jamaican dishes made fresh daily with traditional recipes and bold Caribbean flavors.</p>
        </div>
      </section>

      {/* MENU */}
      <section className="menu-section">
        <div className="container">
          <MenuTabs />
          <div className="menu-note">
            <p>Prices subject to change. Please inform us of any allergies. Not all natural juices available daily.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
