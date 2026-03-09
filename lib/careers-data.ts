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
    id: 'line-cook',
    title: 'Line Cook',
    location: 'All Locations',
    type: 'full-time',
    description:
      'Prepare authentic Jamaican dishes with precision and care. You\'ll work alongside our kitchen team to deliver the bold, scratch-made flavors Cravin is known for.',
    responsibilities: [
      'Prepare menu items following Cravin recipes and quality standards',
      'Maintain a clean, organized workstation during service',
      'Assist with daily prep including marinades, sauces, and sides',
      'Follow food safety and sanitation guidelines',
      'Collaborate with the kitchen team during high-volume service',
    ],
    requirements: [
      '1+ year of kitchen experience (Jamaican or Caribbean cuisine a plus)',
      'Ability to work in a fast-paced environment',
      'Reliable, punctual, and team-oriented',
      'Must be available weekdays and weekends',
    ],
    perks: [
      'Free shift meals',
      'Flexible scheduling',
      'Growth opportunities across 3 locations',
    ],
  },
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
  {
    id: 'catering-assistant',
    title: 'Catering Assistant',
    location: 'All Locations',
    type: 'part-time',
    description:
      'Help us deliver unforgettable catering experiences. You\'ll assist with food preparation, setup, and delivery for events ranging from corporate lunches to weddings.',
    responsibilities: [
      'Assist with large-batch food prep for catering orders',
      'Pack and organize catering orders for transport',
      'Help with on-site event setup and breakdown',
      'Ensure catering presentations meet Cravin quality standards',
      'Communicate with the catering manager on order details',
    ],
    requirements: [
      'Reliable transportation (delivery assistance required)',
      'Ability to lift 30+ lbs and stand for extended periods',
      'Attention to detail and strong work ethic',
      'Weekend and evening availability preferred',
    ],
    perks: [
      'Free shift meals',
      'Tips on catering deliveries',
      'Opportunity to grow into catering management',
    ],
  },
  {
    id: 'delivery-driver',
    title: 'Delivery Driver',
    location: 'All Locations',
    type: 'flexible',
    description:
      'Deliver Cravin\'s food to customers across Westchester County. Flexible hours, great as a primary or supplemental gig.',
    responsibilities: [
      'Pick up and deliver orders accurately and on time',
      'Maintain a clean, professional appearance',
      'Communicate with the restaurant on order status',
      'Handle cash and card payments when applicable',
      'Provide excellent customer service at the door',
    ],
    requirements: [
      'Valid driver\'s license and reliable vehicle',
      'Clean driving record',
      'Smartphone with GPS capability',
      'Knowledge of Westchester County roads a plus',
    ],
    perks: [
      'Flexible hours, set your own schedule',
      'Keep 100% of tips',
      'Free meal per shift',
      'Mileage compensation',
    ],
  },
];
