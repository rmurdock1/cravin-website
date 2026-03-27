// Centralized site data — single source of truth for all location info, hours, contacts, and social links

export interface LocationHours {
  day: string;
  hours: string;
}

export interface Location {
  id: string;
  name: string;
  shortName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  fullAddress: string;
  phone: string;
  phoneFormatted: string;
  email: string;
  googleMapsEmbed: string;
  googleMapsUrl: string;
  hours: LocationHours[];
  hoursShort: string; // e.g. "Mon–Thu: 8am–8pm · Fri–Sat: 8am–9pm"
  storefrontImage: string;
  ordering: {
    ubereats: string;
  };
}

export const locations: Location[] = [
  {
    id: 'ossining',
    name: 'Cravin Jamaican Cuisine - Ossining',
    shortName: 'Ossining',
    address: '109 Main Street',
    city: 'Ossining',
    state: 'NY',
    zip: '10562',
    fullAddress: '109 Main Street, Ossining, NY 10562',
    phone: '+19144327776',
    phoneFormatted: '(914) 432-7776',
    email: 'cravinjc@gmail.com',
    googleMapsEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3010.5!2d-73.86!3d41.16!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDHCsDA5JzM2LjAiTiA3M8KwNTEnMzYuMCJX!5e0!3m2!1sen!2sus!4v1',
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=109+Main+Street+Ossining+NY+10562',
    hours: [
      { day: 'Monday', hours: '8:00 AM – 8:00 PM' },
      { day: 'Tuesday', hours: '8:00 AM – 8:00 PM' },
      { day: 'Wednesday', hours: '8:00 AM – 8:00 PM' },
      { day: 'Thursday', hours: '8:00 AM – 8:00 PM' },
      { day: 'Friday', hours: '8:00 AM – 9:00 PM' },
      { day: 'Saturday', hours: '8:00 AM – 9:00 PM' },
      { day: 'Sunday', hours: 'Closed' },
    ],
    hoursShort: 'Mon–Thu: 8am–8pm · Fri–Sat: 8am–9pm',
    storefrontImage: '/img/storefront-ossining.jpg',
    ordering: {
      ubereats: 'https://www.ubereats.com/store/cravin-jamaican-cuisine/1Uj4tqcJSJSVgoaFrt50qA',
    },
  },
  {
    id: 'white-plains',
    name: 'Cravin Jamaican Cuisine - White Plains',
    shortName: 'White Plains',
    address: '74 Mamaroneck Ave',
    city: 'White Plains',
    state: 'NY',
    zip: '10601',
    fullAddress: '74 Mamaroneck Ave, White Plains, NY 10601',
    phone: '+19143585111',
    phoneFormatted: '(914) 358-5111',
    email: 'cravinjcwp@gmail.com',
    googleMapsEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3012.5!2d-73.77!3d41.03!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDHCsDAyJzAwLjAiTiA3M8KwNDYnMTIuMCJX!5e0!3m2!1sen!2sus!4v1',
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=74+Mamaroneck+Ave+White+Plains+NY+10601',
    hours: [
      { day: 'Monday', hours: '8:00 AM – 9:00 PM' },
      { day: 'Tuesday', hours: '8:00 AM – 9:00 PM' },
      { day: 'Wednesday', hours: '8:00 AM – 9:00 PM' },
      { day: 'Thursday', hours: '8:00 AM – 10:00 PM' },
      { day: 'Friday', hours: '8:00 AM – 10:00 PM' },
      { day: 'Saturday', hours: '8:00 AM – 10:00 PM' },
      { day: 'Sunday', hours: 'Closed' },
    ],
    hoursShort: 'Mon–Wed: 8am–9pm · Thu–Sat: 8am–10pm',
    storefrontImage: '/img/storefront-white-plains.jpg',
    ordering: {
      ubereats: 'https://www.ubereats.com/store/cravin-jamaican-cuisine-wp/FrxepP_CXpmzsvE1p7UleQ',
    },
  },
  {
    id: 'mount-vernon',
    name: 'Cravin Jamaican Cuisine - Mount Vernon',
    shortName: 'Mount Vernon',
    address: '529 Gramatan Ave',
    city: 'Mount Vernon',
    state: 'NY',
    zip: '10552',
    fullAddress: '529 Gramatan Ave, Mount Vernon, NY 10552',
    phone: '+19145889202',
    phoneFormatted: '(914) 588-9202',
    email: 'cravinjcwp@gmail.com',
    googleMapsEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3015.5!2d-73.84!3d40.91!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDU0JzM2LjAiTiA3M8KwNTAnMjQuMCJX!5e0!3m2!1sen!2sus!4v1',
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=529+Gramatan+Ave+Mount+Vernon+NY+10552',
    hours: [
      { day: 'Monday', hours: '8:00 AM – 9:00 PM' },
      { day: 'Tuesday', hours: '8:00 AM – 9:00 PM' },
      { day: 'Wednesday', hours: '8:00 AM – 9:00 PM' },
      { day: 'Thursday', hours: '8:00 AM – 10:00 PM' },
      { day: 'Friday', hours: '8:00 AM – 10:00 PM' },
      { day: 'Saturday', hours: '8:00 AM – 10:00 PM' },
      { day: 'Sunday', hours: 'Closed' },
    ],
    hoursShort: 'Mon–Wed: 8am–9pm · Thu–Sat: 8am–10pm',
    storefrontImage: '/img/storefront-mount-vernon.jpg',
    ordering: {
      ubereats: 'https://www.ubereats.com/store/cravin-jamaican-cuisine-mount-vernon/JYG0x7KkXl65ItLZ4zHQMg',
    },
  },
];

export const socialLinks = {
  instagram: 'https://www.instagram.com/cravinjamaicancuisine/',
  facebook: 'https://www.facebook.com/cravinjamaicancuisine/',
  yelp: 'https://www.yelp.com/biz/cravin-jamaican-cuisine-ossining',
  twitter: 'https://twitter.com/cravinjc',
};

export const brand = {
  name: 'Cravin Jamaican Cuisine',
  tagline: 'Authentic Jamaican Cuisine',
  foundedYear: 2015,
  owner: 'Peter Murdock',
  region: 'Westchester County, NY',
  cuisine: ['Jamaican', 'Caribbean'],
  priceRange: '$$',
  ezcaterUrl: 'https://www.ezcater.com/catering/pvt/cravin-jamaican-cuisine-3',
  domain: 'https://www.cravinjc.com',
};

export const navLinks = [
  { href: '/menu', label: 'Menu' },
  { href: '/catering', label: 'Catering' },
  { href: '/about', label: 'Our Story' },
  { href: '/locations', label: 'Locations' },
  { href: '/contact', label: 'Contact' },
];
