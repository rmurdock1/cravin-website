// Shared FAQ content — consumed by both the visible on-page FAQ sections and
// the FAQPage JSON-LD. Answers are plain text (no HTML) so they serialize
// cleanly into structured data and read well when cited by AI answer engines.

export interface FaqItem {
  question: string;
  answer: string;
}

// Shown on the Catering page. Weighted toward high-intent catering questions.
export const cateringFaqs: FaqItem[] = [
  {
    question: 'How many guests can Cravin cater?',
    answer:
      'We cater events from 10 to 500 guests. Whether it’s a small office lunch or a 400-person corporate event, we scale the menu and pan sizes to fit your headcount.',
  },
  {
    question: 'How much does Jamaican catering cost per person?',
    answer:
      'Catering typically runs about $15 to $25 per person depending on the menu, sides, and number of guests. Use the quote builder on our catering page for an instant estimate, or call us for a custom package.',
  },
  {
    question: 'How far in advance should I book catering?',
    answer:
      'We recommend booking at least 3 to 5 business days ahead so we can confirm your menu and headcount. For large events (100+ guests) or holidays, a week or more is ideal. Rush requests are sometimes possible — call the shop to check availability.',
  },
  {
    question: 'What types of events do you cater?',
    answer:
      'We cater corporate lunches, weddings, birthdays, graduations, memorials, holiday parties, and community events across Westchester County. We’ve served Amazon, the U.S. Army, Coca-Cola, Northwell Health, NewYork-Presbyterian, and The Children’s Village.',
  },
  {
    question: 'Do you offer vegetarian, vegan, or gluten-free catering options?',
    answer:
      'Yes. Our menu includes vegetarian and vegan dishes like veggie stew and callaloo, and many entrées are naturally gluten-free. Add dietary notes when you request a quote and we’ll build a spread that works for your group.',
  },
  {
    question: 'What areas do you serve for catering and delivery?',
    answer:
      'We serve Westchester County, NY — including Ossining, White Plains, Mount Vernon, and surrounding towns. Delivery for catering is arranged directly; everyday delivery is available through Uber Eats.',
  },
  {
    question: 'How do I place a catering order?',
    answer:
      'Build your order and request a quote on our catering page, order through ezCater, or call any location directly. A catering manager follows up to confirm the details, menu, and delivery or pickup time.',
  },
];

// Shown on the Locations page. General visit/ordering questions for local SEO.
export const visitFaqs: FaqItem[] = [
  {
    question: 'Where is Cravin Jamaican Cuisine located?',
    answer:
      'We have three locations in Westchester County, NY: 109 Main Street in Ossining, 74 Mamaroneck Ave in White Plains, and 529 Gramatan Ave in Mount Vernon.',
  },
  {
    question: 'Are you open on Sundays?',
    answer:
      'No, all three Cravin locations are closed on Sundays. Ossining is open Monday to Thursday 8am–8pm and Friday to Saturday 8am–9pm. White Plains and Mount Vernon are open Monday to Wednesday 8am–9pm and Thursday to Saturday 8am–10pm.',
  },
  {
    question: 'Do you offer delivery or takeout?',
    answer:
      'Yes. You can order delivery through Uber Eats from any location, or call the shop directly for pickup. For events, we offer full catering with delivery across Westchester.',
  },
  {
    question: 'What is on the menu?',
    answer:
      'Our menu features authentic Jamaican dishes including jerk chicken, oxtail, curry goat, brown stew chicken, ackee & saltfish, jerk salmon, and curry shrimp, plus baked goods like Jamaican patties and coco bread, and drinks like sorrel and homemade ginger beer.',
  },
  {
    question: 'Do you have vegetarian or gluten-free options?',
    answer:
      'Yes. Vegetarian and vegan options include veggie stew and callaloo, and many dishes such as ackee & saltfish and curry goat are gluten-free. Ask any location for the full list.',
  },
  {
    question: 'Do you take reservations?',
    answer:
      'Our locations are primarily counter-service and walk-in, so no reservation is needed. For group events and large orders, contact us about catering or a custom order.',
  },
];
