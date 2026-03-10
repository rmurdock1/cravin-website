// JSON-LD structured data for SEO
import { locations, brand, socialLinks } from './site-data';

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
    geo: undefined, // Placeholder — add lat/lng when available
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
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '435',
      bestRating: '5',
    },
  };
}

// Menu schema for menu page
export function getMenuJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: brand.name,
    url: `${brand.domain}/menu`,
    servesCuisine: brand.cuisine,
    hasMenu: {
      '@type': 'Menu',
      name: 'Full Menu',
      url: `${brand.domain}/menu`,
      hasMenuSection: [
        { '@type': 'MenuSection', name: 'Breakfast' },
        { '@type': 'MenuSection', name: 'Lunch & Dinner' },
        { '@type': 'MenuSection', name: 'Baked Goods & Extras' },
        { '@type': 'MenuSection', name: 'Beverages' },
      ],
    },
  };
}
