'use client';

import { useState } from 'react';
import { menuCategories, menuItems, type MenuCategory } from '@/lib/menu-data';

function MenuItemCard({ item }: { item: typeof menuItems[number] }) {
  const isHighlight = item.tags?.some((t) => t === 'Most Popular' || t === "Chef's Pick");

  return (
    <div className="menu-item-card" data-category={item.category}>
      <div className="menu-item-header">
        <h3>{item.name}</h3>
        <span className="menu-item-price">{item.priceDisplay}</span>
      </div>
      <p>{item.description}</p>
      {item.tags && item.tags.length > 0 && (
        <div className="menu-item-tags">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className={`menu-tag ${tag === 'Most Popular' || tag === "Chef's Pick" || tag === 'Made to Order' ? 'menu-tag-highlight' : ''}`}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function MenuTabs() {
  const [activeCategory, setActiveCategory] = useState<'all' | MenuCategory>('all');

  const filteredItems = activeCategory === 'all'
    ? menuItems
    : menuItems.filter((item) => item.category === activeCategory);

  return (
    <>
      {/* Category Filter Tabs */}
      <div className="menu-tabs" role="tablist" aria-label="Menu categories">
        <button
          className={`menu-tab ${activeCategory === 'all' ? 'active' : ''}`}
          role="tab"
          aria-selected={activeCategory === 'all'}
          type="button"
          onClick={() => setActiveCategory('all')}
        >
          All
        </button>
        {menuCategories.map((cat) => (
          <button
            key={cat.id}
            className={`menu-tab ${activeCategory === cat.id ? 'active' : ''}`}
            role="tab"
            aria-selected={activeCategory === cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Menu Grid */}
      <div className="menu-grid">
        {activeCategory === 'all' ? (
          // Show category dividers when viewing all
          menuCategories.map((cat) => {
            const catItems = menuItems.filter((item) => item.category === cat.id);
            return (
              <div key={cat.id}>
                <div className="menu-category-divider" data-divider-category={cat.id}>
                  <h2>{cat.label}</h2>
                  {cat.description && <p>{cat.description}</p>}
                </div>
                {catItems.map((item) => (
                  <MenuItemCard key={item.name} item={item} />
                ))}
              </div>
            );
          })
        ) : (
          filteredItems.map((item) => (
            <MenuItemCard key={item.name} item={item} />
          ))
        )}
      </div>
    </>
  );
}
