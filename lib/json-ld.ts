// JSON-LD structured data for SEO
import { locations, brand, socialLinks } from './site-data';
import { menuCategories, menuItems, type MenuItem } from './menu-data';
import type { FaqItem } from './faq-data';

function centsToPrice(cents: number): string {
  return (cents / 100).toFixed(2);
}

function formatHoursForSchema(hours: { day: string; hours: string }[]) {
  const dayMap: Record<string, string> = {
    Monday: 'Mo', Tuesday: 'Tu', Wednesday: 'We',
    Thursday: 'Th', Friday: 'Fr', Saturday: 'Sa', Sunday: 'Su',
  };

  return hours
    .filter((h) => h.hours !== 'Closed')
    .map((h) => {
      const match = h.hours.match(/(\d+:\d+ [AP]M)\s*[–-]\s*(\d+:\d+ [AP]M)/);
      if (!match) return null;
      const open = to24h(match[1]);
      const close = to24h(match[2]);
      return {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: dayMap[h.day],
        opens: open,
        closes: close,
      };
    })
    .filter(Boolean);
}

function to24h(time12: string): string {
  const [time, period] = time12.split(' ');
  const [hStr, m] = time.split(':');
  let h = parseInt(hStr, 10);
  if (period === 'PM' && h !== 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  return `${h.toString().padStart(2, '0')}:${m}`;
}

function buildLocationSchema(loc: typeof locations[number]) {
  return {
    '@type': 'Restaurant',
    name: loc.name,
    image: `${brand.domain}${loc.storefrontImage}`,
    telephone: loc.phoneFormatted,
    email: loc.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: loc.address,
      addressLocality: loc.city,
      addressRegion: loc.state,
      postalCode: loc.zip,
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: loc.geo.lat,
      longitude: loc.geo.lng,
    },
    hasMap: loc.googleMapsUrl,
    url: `${brand.domain}/locations#${loc.id}`,
    openingHoursSpecification: formatHoursForSchema(loc.hours),
    servesCuisine: brand.cuisine,
    priceRange: brand.priceRange,
    acceptsReservations: 'false',
  };
}

// Restaurant schema for homepage
export function getRestaurantJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: brand.name,
    description: 'Authentic Jamaican cuisine at 3 New York locations. Jerk chicken, oxtail, ackee & saltfish, catering for events.',
    image: `${brand.domain}/img/food-spread.jpeg`,
    logo: `${brand.domain}/icon-512.png`,
    url: brand.domain,
    telephone: locations[0].phoneFormatted,
    email: locations[0].email,
    foundingDate: '2015',
    founder: {
      '@type': 'Person',
      name: brand.owner,
    },
    servesCuisine: brand.cuisine,
    priceRange: brand.priceRange,
    acceptsReservations: 'false',
    address: {
      '@type': 'PostalAddress',
      streetAddress: locations[0].address,
      addressLocality: locations[0].city,
      addressRegion: locations[0].state,
      postalCode: locations[0].zip,
      addressCountry: 'US',
    },
    sameAs: [
      socialLinks.instagram,
      socialLinks.facebook,
      socialLinks.yelp,
      socialLinks.twitter,
    ],
    department: locations.map(buildLocationSchema),
  };
}

// LocalBusiness schemas for locations page
export function getLocationsJsonLd() {
  return locations.map((loc) => ({
    '@context': 'https://schema.org',
    ...buildLocationSchema(loc),
  }));
}

// FoodEstablishment for catering page
export function getCateringJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FoodEstablishment',
    name: `${brand.name} Catering`,
    description: 'Jamaican catering for corporate events, weddings, birthdays. 10 to 500 guests. Rated 4.9/5 on ezCater.',
    image: `${brand.domain}/img/jerk-chicken-plate.jpg`,
    url: `${brand.domain}/catering`,
    telephone: locations[0].phoneFormatted,
    email: locations[0].email,
    servesCuisine: brand.cuisine,
    priceRange: brand.priceRange,
    address: {
      '@type': 'PostalAddress',
      streetAddress: locations[0].address,
      addressLocality: locations[0].city,
      addressRegion: locations[0].state,
      postalCode: locations[0].zip,
      addressCountry: 'US',
    },
    areaServed: [
      { '@type': 'AdministrativeArea', name: 'Westchester County, NY' },
      ...locations.map((loc) => ({ '@type': 'City', name: loc.city })),
    ],
    sameAs: [
      socialLinks.instagram,
      socialLinks.facebook,
      socialLinks.yelp,
      socialLinks.twitter,
    ],
    // Aggregate rating intentionally omitted: Google requires ratings to be
    // first-party (collected by the site). Our 4.9/5 from 500+ orders lives on
    // ezCater. Add an aggregateRating here only when sourced via Review schema
    // collected directly on cravinjc.com.
  };
}

// Build a schema.org MenuItem (with offers) from our menu data. Handles both
// single-price items and small/large size options.
function buildMenuItemSchema(item: MenuItem) {
  const menuItem: Record<string, unknown> = {
    '@type': 'MenuItem',
    name: item.name,
    description: item.description,
  };

  if (item.tags?.length) {
    menuItem.suitableForDiet = item.tags
      .map((tag) => {
        if (tag === 'Vegetarian') return 'https://schema.org/VegetarianDiet';
        if (tag === 'Vegan') return 'https://schema.org/VeganDiet';
        if (tag === 'Gluten-Free') return 'https://schema.org/GlutenFreeDiet';
        return null;
      })
      .filter(Boolean);
    if ((menuItem.suitableForDiet as unknown[]).length === 0) delete menuItem.suitableForDiet;
  }

  if (item.priceCents != null) {
    menuItem.offers = {
      '@type': 'Offer',
      price: centsToPrice(item.priceCents),
      priceCurrency: 'USD',
    };
  } else if (item.priceSmallCents != null && item.priceLargeCents != null) {
    menuItem.offers = [
      { '@type': 'Offer', name: 'Small', price: centsToPrice(item.priceSmallCents), priceCurrency: 'USD' },
      { '@type': 'Offer', name: 'Large', price: centsToPrice(item.priceLargeCents), priceCurrency: 'USD' },
    ];
  }

  return menuItem;
}

// Menu schema for menu page — now populated with all real items + prices so
// AI answer engines can cite specific dishes and costs.
export function getMenuJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: brand.name,
    url: `${brand.domain}/menu`,
    servesCuisine: brand.cuisine,
    priceRange: brand.priceRange,
    hasMenu: {
      '@type': 'Menu',
      name: 'Full Menu',
      url: `${brand.domain}/menu`,
      hasMenuSection: menuCategories.map((cat) => ({
        '@type': 'MenuSection',
        name: cat.label,
        ...(cat.description ? { description: cat.description } : {}),
        hasMenuItem: menuItems
          .filter((item) => item.category === cat.id)
          .map(buildMenuItemSchema),
      })),
    },
  };
}

// FAQPage schema — pairs with visible on-page FAQ sections. FAQ content is the
// single highest-leverage format for citation in AI answer engines.
export function getFaqJsonLd(faqs: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
