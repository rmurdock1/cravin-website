// Centralized catering menu data — source of truth from EZCATER PRICE LIST.csv

export type CateringCategory = 'entrees' | 'sides' | 'pasta' | 'extras';

export interface CateringItem {
  id: string;
  name: string;
  category: CateringCategory;
  /** Half pan price in cents (null if not available) */
  priceHalfCents: number | null;
  /** Full pan price in cents (null if not available) */
  priceFullCents: number | null;
  /** Single price in cents for extras (null if pan-based) */
  priceSingleCents: number | null;
  /** Note (e.g. "Half: 38 pcs · Full: 65-70 pcs") */
  note?: string;
}

export const cateringCategories: { id: CateringCategory; label: string }[] = [
  { id: 'entrees', label: 'Entrees' },
  { id: 'sides', label: 'Sides' },
  { id: 'pasta', label: 'Pasta' },
  { id: 'extras', label: 'Extras' },
];

export const cateringItems: CateringItem[] = [
  // ==================== ENTREES ====================
  { id: 'brown-stew-chicken', name: 'Brown Stew Chicken', category: 'entrees', priceHalfCents: 9500, priceFullCents: 15900, priceSingleCents: null },
  { id: 'curry-chicken', name: 'Curry Chicken', category: 'entrees', priceHalfCents: 9500, priceFullCents: 15900, priceSingleCents: null },
  { id: 'fried-chicken', name: 'Fried Chicken', category: 'entrees', priceHalfCents: 9500, priceFullCents: 15900, priceSingleCents: null },
  { id: 'jerk-chicken', name: 'Jerk Chicken', category: 'entrees', priceHalfCents: 10500, priceFullCents: 17500, priceSingleCents: null },
  { id: 'curry-goat', name: 'Curry Goat', category: 'entrees', priceHalfCents: 16000, priceFullCents: 30000, priceSingleCents: null },
  { id: 'oxtail', name: 'Oxtail', category: 'entrees', priceHalfCents: 18000, priceFullCents: 34000, priceSingleCents: null },
  { id: 'whiting-fish', name: 'Whiting Fish', category: 'entrees', priceHalfCents: 11500, priceFullCents: 20500, priceSingleCents: null, note: 'Half: 38 pcs · Full: 65-70 pcs' },
  { id: 'jerk-wings', name: 'Jerk Wings', category: 'entrees', priceHalfCents: 11500, priceFullCents: 22500, priceSingleCents: null },
  { id: 'jerk-salmon', name: 'Jerk Salmon', category: 'entrees', priceHalfCents: 14000, priceFullCents: 22500, priceSingleCents: null },
  { id: 'curry-shrimp', name: 'Curry Shrimp', category: 'entrees', priceHalfCents: 16500, priceFullCents: 28000, priceSingleCents: null },
  { id: 'veggie-stew', name: 'Veggie Stew', category: 'entrees', priceHalfCents: 9500, priceFullCents: 15900, priceSingleCents: null },
  { id: 'stew-peas', name: 'Stew Peas', category: 'entrees', priceHalfCents: 13000, priceFullCents: null, priceSingleCents: null },

  // ==================== SIDES ====================
  { id: 'mac-n-cheese', name: 'Mac N Cheese', category: 'sides', priceHalfCents: 7000, priceFullCents: 11000, priceSingleCents: null },
  { id: 'rice-and-peas', name: 'Rice & Peas', category: 'sides', priceHalfCents: 5500, priceFullCents: 9500, priceSingleCents: null },
  { id: 'white-rice', name: 'White Rice', category: 'sides', priceHalfCents: 4000, priceFullCents: 6500, priceSingleCents: null },
  { id: 'plantains', name: 'Plantains', category: 'sides', priceHalfCents: 4500, priceFullCents: 6500, priceSingleCents: null },
  { id: 'cabbage', name: 'Cabbage', category: 'sides', priceHalfCents: 4900, priceFullCents: 8000, priceSingleCents: null },
  { id: 'salad', name: 'Salad', category: 'sides', priceHalfCents: 4000, priceFullCents: 6500, priceSingleCents: null },
  { id: 'boiled-food', name: 'Boiled Food', category: 'sides', priceHalfCents: null, priceFullCents: 7500, priceSingleCents: null },
  { id: 'ackee', name: 'Ackee', category: 'sides', priceHalfCents: 12500, priceFullCents: 22500, priceSingleCents: null },
  { id: 'callaloo', name: 'Callaloo', category: 'sides', priceHalfCents: 8500, priceFullCents: null, priceSingleCents: null },
  { id: 'salt-fish', name: 'Salt Fish', category: 'sides', priceHalfCents: 10500, priceFullCents: null, priceSingleCents: null },
  { id: 'fritas', name: 'Fritas', category: 'sides', priceHalfCents: 8500, priceFullCents: null, priceSingleCents: null },
  { id: 'fruit-salad', name: 'Fruit Salad', category: 'sides', priceHalfCents: null, priceFullCents: 7500, priceSingleCents: null },
  { id: 'fried-dumplin', name: 'Fried Dumplin', category: 'sides', priceHalfCents: 4000, priceFullCents: 7000, priceSingleCents: null, note: 'Half: 25 pcs · Full: 50 pcs' },

  // ==================== PASTA ====================
  { id: 'rasta-pasta', name: 'Rasta Pasta', category: 'pasta', priceHalfCents: 7000, priceFullCents: 13000, priceSingleCents: null },
  { id: 'rasta-pasta-shrimp', name: 'Rasta Pasta w/ Shrimp', category: 'pasta', priceHalfCents: null, priceFullCents: 18500, priceSingleCents: null },
  { id: 'rasta-pasta-jerk-chicken', name: 'Rasta Pasta w/ Jerk Chicken', category: 'pasta', priceHalfCents: null, priceFullCents: 16500, priceSingleCents: null },

  // ==================== EXTRAS ====================
  { id: 'cocktail-patties-dozen', name: 'Cocktail Patties (Dozen)', category: 'extras', priceHalfCents: null, priceFullCents: null, priceSingleCents: 1700 },
  { id: 'cocktail-patties-half-dozen', name: 'Cocktail Patties (Half Dozen)', category: 'extras', priceHalfCents: null, priceFullCents: null, priceSingleCents: 900 },
  { id: 'plantain-round-tin', name: 'Plantain Round Tin', category: 'extras', priceHalfCents: null, priceFullCents: null, priceSingleCents: 1575 },
];

/** Format cents to display price (e.g. 9500 → "$95", 1575 → "$15.75") */
export function formatPrice(cents: number): string {
  const dollars = cents / 100;
  return dollars % 1 === 0 ? `$${dollars}` : `$${dollars.toFixed(2)}`;
}
