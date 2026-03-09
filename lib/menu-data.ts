// Centralized menu data — source of truth from Cravin_FullMenu_0326.csv

export type MenuCategory = 'breakfast' | 'lunch-dinner' | 'baked-goods' | 'beverages';

export interface MenuItem {
  name: string;
  description: string;
  category: MenuCategory;
  /** Price in cents for single-size items */
  priceCents?: number;
  /** Price string for display (e.g. "Sm $14.25 / Lg $18.50") */
  priceDisplay: string;
  /** Small price in cents (for items with size options) */
  priceSmallCents?: number;
  /** Large price in cents (for items with size options) */
  priceLargeCents?: number;
  tags?: string[];
}

export const menuCategories: { id: MenuCategory; label: string; description?: string }[] = [
  {
    id: 'breakfast',
    label: 'Breakfast',
    description: 'All dishes (except Porridge) include boiled yam, banana, and dumplings.',
  },
  {
    id: 'lunch-dinner',
    label: 'Lunch & Dinner',
    description: 'All served with choice of rice & peas or white rice, plus cabbage or plantains.',
  },
  { id: 'baked-goods', label: 'Baked Goods' },
  { id: 'beverages', label: 'Beverages' },
];

export const menuItems: MenuItem[] = [
  // ==================== BREAKFAST ====================
  {
    name: 'Breakfast Sampler',
    description: 'A taste of everything. The perfect way to start your morning Jamaican style.',
    category: 'breakfast',
    priceCents: 1899,
    priceDisplay: '$18.99',
    tags: ["Chef's Pick"],
  },
  {
    name: 'Ackee & Saltfish',
    description: "Jamaica's national dish. Flaked saltfish with ackee fruit, peppers and onions. Served with boiled yam, banana, and dumplings.",
    category: 'breakfast',
    priceCents: 1699,
    priceDisplay: '$16.99',
    tags: ['Gluten-Free'],
  },
  {
    name: 'Callaloo & Salt Fish',
    description: 'Leafy callaloo sautéed with salt fish, onions, tomatoes. Served with boiled yam, banana, and dumplings.',
    category: 'breakfast',
    priceCents: 1425,
    priceDisplay: '$14.25',
    tags: ['Gluten-Free'],
  },
  {
    name: 'Cabbage & Salt Fish',
    description: 'Steamed cabbage with flaked saltfish and seasonings. Served with boiled yam, banana, and dumplings.',
    category: 'breakfast',
    priceCents: 1425,
    priceDisplay: '$14.25',
    tags: ['Gluten-Free'],
  },
  {
    name: 'Salt Fish (Cook Up)',
    description: 'Seasoned flaked saltfish with peppers and onions. Served with boiled yam, banana, and dumplings.',
    category: 'breakfast',
    priceCents: 1250,
    priceDisplay: '$12.50',
    tags: ['Gluten-Free'],
  },
  {
    name: 'Callaloo',
    description: 'Sautéed callaloo greens with garlic, onions and spices. Served with boiled yam, banana, and dumplings.',
    category: 'breakfast',
    priceCents: 1199,
    priceDisplay: '$11.99',
    tags: ['Vegetarian', 'Gluten-Free'],
  },
  {
    name: 'Porridge',
    description: 'Traditional Jamaican porridge, warm and hearty.',
    category: 'breakfast',
    priceSmallCents: 499,
    priceLargeCents: 999,
    priceDisplay: 'Sm $4.99 / Lg $9.99',
    tags: ['Vegetarian'],
  },

  // ==================== LUNCH & DINNER ====================
  {
    name: 'Jerk Chicken',
    description: 'Slow-marinated, grilled with scotch bonnet jerk sauce. Served with rice & peas or white rice, plus cabbage or plantains.',
    category: 'lunch-dinner',
    priceSmallCents: 1599,
    priceLargeCents: 1999,
    priceDisplay: 'Sm $15.99 / Lg $19.99',
    tags: ['Most Popular', 'Spicy'],
  },
  {
    name: 'Oxtail',
    description: 'Fall-off-the-bone oxtail in rich gravy with butter beans. Served with rice & peas or white rice, plus cabbage or plantains.',
    category: 'lunch-dinner',
    priceSmallCents: 1999,
    priceLargeCents: 2499,
    priceDisplay: 'Sm $19.99 / Lg $24.99',
    tags: ["Chef's Pick"],
  },
  {
    name: 'Curry Goat',
    description: 'Slow-cooked goat in aromatic curry with potatoes. Served with rice & peas or white rice, plus cabbage or plantains.',
    category: 'lunch-dinner',
    priceSmallCents: 1799,
    priceLargeCents: 2099,
    priceDisplay: 'Sm $17.99 / Lg $20.99',
    tags: ['Spicy'],
  },
  {
    name: 'Brown Stew Chicken',
    description: 'Tender chicken in a rich, savory brown stew sauce. Served with rice & peas or white rice, plus cabbage or plantains.',
    category: 'lunch-dinner',
    priceSmallCents: 1425,
    priceLargeCents: 1850,
    priceDisplay: 'Sm $14.25 / Lg $18.50',
  },
  {
    name: 'Curry Chicken',
    description: 'Caribbean curry with potatoes and warm spices. Served with rice & peas or white rice, plus cabbage or plantains.',
    category: 'lunch-dinner',
    priceSmallCents: 1425,
    priceLargeCents: 1850,
    priceDisplay: 'Sm $14.25 / Lg $18.50',
    tags: ['Spicy'],
  },
  {
    name: 'Fried Chicken',
    description: 'Crispy seasoned fried chicken, golden and juicy. Served with rice & peas or white rice, plus cabbage or plantains.',
    category: 'lunch-dinner',
    priceSmallCents: 1425,
    priceLargeCents: 1850,
    priceDisplay: 'Sm $14.25 / Lg $18.50',
  },
  {
    name: 'Veggie Stew',
    description: 'Hearty mixed vegetables in a savory stew. Served with rice & peas or white rice, plus cabbage or plantains.',
    category: 'lunch-dinner',
    priceSmallCents: 1425,
    priceLargeCents: 1850,
    priceDisplay: 'Sm $14.25 / Lg $18.50',
    tags: ['Vegetarian', 'Vegan'],
  },
  {
    name: 'Curry Shrimp',
    description: 'Succulent shrimp in a rich Caribbean curry sauce. Served with rice & peas or white rice, plus cabbage or plantains.',
    category: 'lunch-dinner',
    priceCents: 2099,
    priceDisplay: '$20.99',
    tags: ['Spicy'],
  },
  {
    name: 'Jerk Salmon',
    description: 'Salmon fillet with our signature jerk seasoning. Served with rice & peas or white rice, plus cabbage or plantains.',
    category: 'lunch-dinner',
    priceCents: 2099,
    priceDisplay: '$20.99',
    tags: ['Spicy'],
  },
  {
    name: 'Salmon Only',
    description: 'Perfectly prepared salmon fillet, no sides.',
    category: 'lunch-dinner',
    priceCents: 1699,
    priceDisplay: '$16.99',
  },
  {
    name: 'Fried Whiting Fish Dinner',
    description: 'Perfectly fried whiting, crispy and flaky. Served with rice & peas or white rice, plus cabbage or plantains.',
    category: 'lunch-dinner',
    priceCents: 1799,
    priceDisplay: '$17.99',
  },
  {
    name: 'King Fish Dinner',
    description: 'Seasoned king fish prepared to perfection. Served with rice & peas or white rice, plus cabbage or plantains.',
    category: 'lunch-dinner',
    priceCents: 1799,
    priceDisplay: '$17.99',
  },
  {
    name: 'King Fish Only',
    description: 'King fish fillet, no sides.',
    category: 'lunch-dinner',
    priceCents: 1099,
    priceDisplay: '$10.99',
  },
  {
    name: 'Snapper Fish Dinner',
    description: 'Whole red snapper prepared your way. Served with rice & peas or white rice, plus cabbage or plantains.',
    category: 'lunch-dinner',
    priceCents: 2699,
    priceDisplay: '$26.99',
    tags: ['Made to Order'],
  },
  {
    name: 'Escovitch Fish Only',
    description: 'Fried fish topped with pickled peppers and vegetables.',
    category: 'lunch-dinner',
    priceCents: 2199,
    priceDisplay: '$21.99',
    tags: ['Spicy'],
  },

  // ==================== BAKED GOODS ====================
  {
    name: 'Jamaican Patties',
    description: 'Flaky golden pastry. Available in: Mild Beef, Spicy Beef, Curry Chicken, Jerk Chicken, Veggie, or Spinach.',
    category: 'baked-goods',
    priceCents: 400,
    priceDisplay: '$4.00',
  },
  {
    name: 'Coco Bread',
    description: 'Soft, slightly sweet Jamaican bread. Perfect alongside a patty.',
    category: 'baked-goods',
    priceCents: 175,
    priceDisplay: '$1.75 / 4-Pack $7.00',
  },
  {
    name: 'Bun & Cheese',
    description: 'Classic Jamaican spiced bun with cheese.',
    category: 'baked-goods',
    priceCents: 450,
    priceDisplay: '$4.50',
  },
  {
    name: 'Black Cake',
    description: 'Rich, dark Jamaican fruit cake. 8" cake: $45.00.',
    category: 'baked-goods',
    priceCents: 550,
    priceDisplay: '$5.50',
  },
  {
    name: 'Coconut Pound Cake',
    description: 'Moist coconut pound cake, baked fresh.',
    category: 'baked-goods',
    priceCents: 450,
    priceDisplay: '$4.50',
  },
  {
    name: 'Chocolate Cake',
    description: 'Rich chocolate cake slice.',
    category: 'baked-goods',
    priceCents: 450,
    priceDisplay: '$4.50',
  },
  {
    name: 'Lemon Cake',
    description: 'Bright, zesty lemon cake slice.',
    category: 'baked-goods',
    priceCents: 450,
    priceDisplay: '$4.50',
  },

  // ==================== BEVERAGES ====================
  {
    name: 'Sorrel',
    description: 'Traditional Jamaican sorrel drink made with hibiscus and spices.',
    category: 'beverages',
    priceCents: 599,
    priceDisplay: '$5.99',
  },
  {
    name: 'Cravin Fruit Punch',
    description: 'Our signature refreshing fruit punch.',
    category: 'beverages',
    priceCents: 499,
    priceDisplay: '$4.99',
  },
  {
    name: 'Cravin Pineapple Passion',
    description: 'Tropical pineapple and passion fruit blend.',
    category: 'beverages',
    priceCents: 499,
    priceDisplay: '$4.99',
  },
  {
    name: 'Cravin Pineapple Ginger',
    description: 'Pineapple with a kick of ginger.',
    category: 'beverages',
    priceCents: 499,
    priceDisplay: '$4.99',
  },
  {
    name: 'Cravin Ginger Beer',
    description: 'Spicy homestyle ginger beer.',
    category: 'beverages',
    priceCents: 499,
    priceDisplay: '$4.99',
  },
  {
    name: 'Cravin Lemon Ginger',
    description: 'Fresh lemon and ginger blend.',
    category: 'beverages',
    priceCents: 450,
    priceDisplay: '$4.50',
  },
  {
    name: 'Cravin Lemonade',
    description: 'Fresh-squeezed Cravin lemonade.',
    category: 'beverages',
    priceCents: 375,
    priceDisplay: '$3.75',
  },
  {
    name: 'Coconut Water',
    description: 'Natural coconut water.',
    category: 'beverages',
    priceCents: 600,
    priceDisplay: '$6.00',
  },
  {
    name: 'Ting',
    description: 'Classic Jamaican grapefruit soda.',
    category: 'beverages',
    priceCents: 299,
    priceDisplay: '$2.99',
  },
  {
    name: 'D&G Soda',
    description: 'Authentic Jamaican sodas in assorted flavors.',
    category: 'beverages',
    priceCents: 275,
    priceDisplay: '$2.75',
  },
  {
    name: 'Tropical Rhythm',
    description: 'Caribbean tropical juice drink.',
    category: 'beverages',
    priceCents: 275,
    priceDisplay: '$2.75',
  },
  {
    name: 'Snapple',
    description: 'Assorted Snapple flavors.',
    category: 'beverages',
    priceCents: 275,
    priceDisplay: '$2.75',
  },
  {
    name: 'Coffee',
    description: 'Hot brewed coffee.',
    category: 'beverages',
    priceCents: 250,
    priceDisplay: '$2.50',
  },
  {
    name: 'Tea',
    description: 'Hot tea, choice of flavors.',
    category: 'beverages',
    priceCents: 175,
    priceDisplay: '$1.75',
  },
  {
    name: 'Can Soda',
    description: 'Assorted can sodas.',
    category: 'beverages',
    priceCents: 150,
    priceDisplay: '$1.50',
  },
  {
    name: 'Water',
    description: 'Bottled water.',
    category: 'beverages',
    priceCents: 150,
    priceDisplay: '$1.50',
  },
  {
    name: '2 Liter Soda',
    description: 'Assorted flavors, perfect for groups.',
    category: 'beverages',
    priceCents: 675,
    priceDisplay: '$6.75',
  },
];
