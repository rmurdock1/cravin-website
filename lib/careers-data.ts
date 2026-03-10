export type JobType = 'full-time' | 'part-time' | 'flexible';

export interface JobListing {
  id: string;
  title: string;
  location: string; // e.g. "Ossining" or "All Locations"
  type: JobType;
  description: string;
  responsibilities: string[];
  requirements: string[];
  perks?: string[];
}

export const jobListings: JobListing[] = [
  {
    id: 'cashier',
    title: 'Cashier / Front of House',
    location: 'White Plains & Mount Vernon',
    type: 'full-time',
    description:
      'Be the face of Cravin. Greet customers, take orders, and ensure every guest leaves happy. We\'re looking for friendly, reliable people who take pride in great service.',
    responsibilities: [
      'Greet customers and take orders accurately',
      'Operate the POS system and handle cash/card transactions',
      'Keep the front counter, dining area, and drink station clean',
      'Answer phone calls and assist with takeout/delivery orders',
      'Upsell specials and catering services when appropriate',
    ],
    requirements: [
      'Previous cashier or customer service experience preferred',
      'Friendly, positive attitude with strong communication skills',
      'Ability to multitask during busy periods',
      'Must be available evenings and weekends',
    ],
    perks: [
      'Free shift meals',
      'Tips',
      'Flexible scheduling',
    ],
  },
];
