'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { cateringCategories, cateringItems, type CateringItem, formatPrice } from '@/lib/catering-data';
import { locations, brand } from '@/lib/site-data';
import { useCateringCart, formatCurrency, sizeLabel, type CartItem } from '@/hooks/useCateringCart';
import '@/app/catering.css';

// ==============================
// TOAST NOTIFICATION
// ==============================
function Toast({ message, key: k }: { message: string; key: string }) {
  return <div className="cart-toast" key={k}>{message}</div>;
}

// ==============================
// CATERING MENU ITEM
// ==============================
function CateringMenuItem({
  item,
  badgeQty,
  onAdd,
  cartItems,
  onUpdateQty,
}: {
  item: CateringItem;
  badgeQty: number;
  onAdd: (id: string, name: string, size: CartItem['size'], priceCents: number, qty: number) => void;
  cartItems: CartItem[];
  onUpdateQty: (id: string, size: CartItem['size'], newQty: number) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [selectedSize, setSelectedSize] = useState<'half' | 'full' | 'single'>('half');
  const [qty, setQty] = useState(1);
  const isInCart = badgeQty > 0;
  const isExtra = item.priceSingleCents !== null;

  // For extras, default to single
  useEffect(() => {
    if (isExtra) setSelectedSize('single');
    else if (item.priceHalfCents) setSelectedSize('half');
    else if (item.priceFullCents) setSelectedSize('full');
  }, [isExtra, item.priceHalfCents, item.priceFullCents]);

  function handleConfirm() {
    const price = selectedSize === 'half' ? item.priceHalfCents!
      : selectedSize === 'full' ? item.priceFullCents!
      : item.priceSingleCents!;
    onAdd(item.id, item.name, selectedSize, price, qty);
    setAdding(false);
    setQty(1);
  }

  function handleCancel() {
    setAdding(false);
    setQty(1);
  }

  // Inline controls for items already in cart (half pan first, then full)
  const sizeOrder: Record<string, number> = { half: 0, full: 1, single: 2 };
  const inCartItems = cartItems
    .filter((ci) => ci.id === item.id)
    .sort((a, b) => (sizeOrder[a.size] ?? 9) - (sizeOrder[b.size] ?? 9));

  return (
    <div
      className={`catering-menu-item ${isInCart ? 'in-cart' : ''} ${adding ? 'adding' : ''}`}
      data-category={item.category}
      data-item-id={item.id}
    >
      {badgeQty > 0 && <span className="cart-item-badge">{badgeQty}</span>}

      {item.note ? (
        <div className="item-name-group">
          <div className="item-name">{item.name}</div>
          <div className="item-note">{item.note}</div>
        </div>
      ) : (
        <div className="item-name">{item.name}</div>
      )}

      {isExtra ? (
        <div className="item-prices">
          <div className="price-single">
            <span className="price-value">{formatPrice(item.priceSingleCents!)}</span>
          </div>
        </div>
      ) : (
        <div className="item-prices">
          <div className="price-col">
            <span className="price-label">Half Pan</span>
            <span className={`price-value ${!item.priceHalfCents ? 'na' : ''}`}>
              {item.priceHalfCents ? formatPrice(item.priceHalfCents) : '\u2014'}
            </span>
          </div>
          <div className="price-col">
            <span className="price-label">Full Pan</span>
            <span className={`price-value ${!item.priceFullCents ? 'na' : ''}`}>
              {item.priceFullCents ? formatPrice(item.priceFullCents) : '\u2014'}
            </span>
          </div>
        </div>
      )}

      {!adding && (
        <button className="btn-add-to-cart" onClick={() => setAdding(true)}>+ Add</button>
      )}

      {/* Inline add controls */}
      <div className="cart-add-controls">
        {!isExtra && (
          <div className="cart-size-select">
            <button
              className={`size-btn ${selectedSize === 'half' ? 'active' : ''}`}
              disabled={!item.priceHalfCents}
              onClick={() => setSelectedSize('half')}
            >
              Half
            </button>
            <button
              className={`size-btn ${selectedSize === 'full' ? 'active' : ''}`}
              disabled={!item.priceFullCents}
              onClick={() => setSelectedSize('full')}
            >
              Full
            </button>
          </div>
        )}
        <div className="cart-qty-controls">
          <button className="qty-btn" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
          <span className="qty-value">{qty}</span>
          <button className="qty-btn" onClick={() => setQty(qty + 1)}>+</button>
        </div>
        <button className="cart-confirm-add" onClick={handleConfirm}>Add to Order</button>
        <button className="cart-cancel-add" onClick={handleCancel}>Cancel</button>
      </div>

      {/* Inline controls for items already in cart */}
      {isInCart && !adding && inCartItems.map((ci) => (
        <div key={`${ci.id}-${ci.size}`} className="cart-inline-controls">
          <button className="qty-btn" onClick={() => onUpdateQty(ci.id, ci.size, ci.qty - 1)}>−</button>
          <span className="qty-value">{ci.qty}</span>
          <button className="qty-btn" onClick={() => onUpdateQty(ci.id, ci.size, ci.qty + 1)}>+</button>
          <span className="size-summary">{sizeLabel(ci.size)}</span>
        </div>
      ))}
    </div>
  );
}

// ==============================
// MAIN CATERING PAGE CLIENT
// ==============================
export function CateringPageClient() {
  const {
    cart, addItem, removeItem, updateQty, getTotal, getItemCount,
    serializeForForm, getItemQuantities, formatCurrency, loaded,
  } = useCateringCart();

  const [activeCategory, setActiveCategory] = useState<string>('entrees');
  const [activeFormTab, setActiveFormTab] = useState<'build-order' | 'quick-inquiry'>('build-order');
  const [toasts, setToasts] = useState<{ id: string; message: string }[]>([]);
  const formRef = useRef<HTMLDivElement>(null);
  const [pillVisible, setPillVisible] = useState(false);

  const itemQtyMap = getItemQuantities();
  const itemCount = getItemCount();
  const total = getTotal();

  // Show/hide floating pill based on cart and form visibility
  useEffect(() => {
    if (itemCount === 0) { setPillVisible(false); return; }
    if (!formRef.current) { setPillVisible(true); return; }

    const observer = new IntersectionObserver(
      ([entry]) => setPillVisible(!entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(formRef.current);
    return () => observer.disconnect();
  }, [itemCount]);

  function showToast(message: string) {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 2600);
  }

  function handleAddItem(id: string, name: string, size: CartItem['size'], priceCents: number, qty: number) {
    addItem(id, name, size, priceCents, qty);
    showToast(`${name} added to order`);
  }

  function scrollToForm() {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  function handleQuickInquiryClick() {
    setActiveFormTab('quick-inquiry');
    scrollToForm();
  }

  const filteredItems = cateringItems.filter((item) => item.category === activeCategory);

  return (
    <>
      {/* HERO */}
      <section className="page-hero" id="main-content">
        <div className="container">
          <h1>Catering</h1>
          <p className="page-hero-subtitle">Authentic Jamaican flavors for your next event. Half pans serve 10–15, full pans serve 40–50. Custom menus for up to 500 guests.</p>
          <div className="hero-paths">
            <div className="hero-path-card">
              <div className="path-icon" aria-hidden="true">&#128722;</div>
              <div className="path-title">Build Your Order</div>
              <p className="path-desc">Select items, sizes &amp; quantities from our catering menu</p>
              <a href="#catering-menu-top" className="btn btn-warm btn-sm">Browse Menu &darr;</a>
            </div>
            <div className="hero-path-card">
              <div className="path-icon" aria-hidden="true">&#9993;</div>
              <div className="path-title">Quick Inquiry</div>
              <p className="path-desc">Send us a message with your event details and we&apos;ll follow up</p>
              <button onClick={handleQuickInquiryClick} className="btn btn-outline-warm btn-sm">Send Inquiry &darr;</button>
            </div>
            <div className="hero-path-card">
              <div className="path-icon" aria-hidden="true">&#8599;</div>
              <div className="path-title">Order on EZCater</div>
              <p className="path-desc">Order directly through EZCater for easy online ordering</p>
              <a href={brand.ezcaterUrl} className="btn btn-outline-green btn-sm" target="_blank" rel="noopener noreferrer">Go to EZCater &rarr;</a>
            </div>
          </div>
        </div>
      </section>

      {/* CATERING MENU */}
      <section className="catering-menu-section" id="catering-menu-top">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Our Catering Menu</span>
            <h2 className="section-title">Pan Sizes &amp; Pricing</h2>
            <p className="section-subtitle">Choose your pan size to match your guest count. Half pans and full pans available across our full menu.</p>
          </div>

          {/* Pan Size Guide */}
          <div className="pan-size-guide">
            <div className="pan-size-guide-item">
              <span className="pan-size-guide-label">Half Pan</span>
              <span className="pan-size-guide-serves">Feeds 10–15</span>
            </div>
            <div className="pan-size-guide-divider" aria-hidden="true"></div>
            <div className="pan-size-guide-item">
              <span className="pan-size-guide-label">Full Pan</span>
              <span className="pan-size-guide-serves">Feeds 40–50</span>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="menu-tabs" role="tablist" aria-label="Catering menu categories">
            {cateringCategories.map((cat) => (
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
          <div className="catering-menu-grid">
            {filteredItems.map((item) => (
              <CateringMenuItem
                key={item.id}
                item={item}
                badgeQty={itemQtyMap[item.id] || 0}
                onAdd={handleAddItem}
                cartItems={cart.filter((ci) => ci.id === item.id)}
                onUpdateQty={updateQty}
              />
            ))}
          </div>

          <div className="menu-note">
            <p>Prices subject to change. Please contact us for custom menu requests and large event pricing.</p>
          </div>
        </div>
      </section>

      {/* FORM SECTION */}
      <section className="catering-form-section" id="catering-form" ref={formRef}>
        <div className="container">
          <div className="catering-form-card">
            <h2>Get Your Quote</h2>
            <p>Build your order from our menu or send us a quick inquiry.</p>

            {/* Tab Bar */}
            <div className="form-tabs" role="tablist" aria-label="Quote request type">
              <button
                className={`form-tab ${activeFormTab === 'build-order' ? 'active' : ''}`}
                role="tab"
                aria-selected={activeFormTab === 'build-order'}
                type="button"
                onClick={() => setActiveFormTab('build-order')}
              >
                Build Your Order
              </button>
              <button
                className={`form-tab ${activeFormTab === 'quick-inquiry' ? 'active' : ''}`}
                role="tab"
                aria-selected={activeFormTab === 'quick-inquiry'}
                type="button"
                onClick={() => setActiveFormTab('quick-inquiry')}
              >
                Quick Inquiry
              </button>
            </div>

            {/* BUILD ORDER PANEL */}
            {activeFormTab === 'build-order' && (
              <div id="panel-build-order" role="tabpanel">
                {/* Cart Summary */}
                <div className="cart-summary" aria-live="polite">
                  {cart.length === 0 ? (
                    <div className="cart-empty-state">
                      <p>Your order is empty. Browse the menu above to get started. Half pans feed 10–15 guests, full pans feed 40–50.</p>
                      <a href="#catering-menu-top" className="btn btn-outline-green btn-sm">Browse Menu &uarr;</a>
                    </div>
                  ) : (
                    <>
                      <div className="cart-items-list">
                        {[...cart].sort((a, b) => {
                          if (a.name !== b.name) return a.name.localeCompare(b.name);
                          const order: Record<string, number> = { half: 0, full: 1, single: 2 };
                          return (order[a.size] ?? 9) - (order[b.size] ?? 9);
                        }).map((item) => (
                          <div key={`${item.id}-${item.size}`} className="cart-item-row">
                            <div className="cart-item-info">
                              <div className="cart-item-name">{item.name}</div>
                              {item.size !== 'single' && (
                                <div className="cart-item-size">{sizeLabel(item.size)}</div>
                              )}
                            </div>
                            <div className="cart-item-qty">
                              <button className="qty-btn" onClick={() => updateQty(item.id, item.size, item.qty - 1)}>−</button>
                              <span className="qty-value">{item.qty}</span>
                              <button className="qty-btn" onClick={() => updateQty(item.id, item.size, item.qty + 1)}>+</button>
                            </div>
                            <span className="cart-item-price">{formatCurrency(item.priceCents * item.qty)}</span>
                            <button className="cart-item-remove" onClick={() => removeItem(item.id, item.size)} aria-label={`Remove ${item.name}`}>&times;</button>
                          </div>
                        ))}
                      </div>
                      <div className="cart-total-row">
                        <span>Estimated Total</span>
                        <span className="cart-total-value">{formatCurrency(total)}</span>
                      </div>
                    </>
                  )}
                  <p className="cart-note">Half pans feed 10–15 guests, full pans feed 40–50. Final pricing confirmed after review.</p>
                </div>

                {/* Build Order Form */}
                <form className="form-grid" name="catering-order" method="POST" action="/success">
                  <textarea name="cart_items" style={{ display: 'none' }} aria-hidden="true" value={serializeForForm()} readOnly />
                  <input type="hidden" name="cart_total" value={formatCurrency(total)} />
                  <input type="hidden" name="form_type" value="build-order" />

                  <div className="form-group">
                    <label htmlFor="bo-name">Full Name *</label>
                    <input type="text" id="bo-name" name="full_name" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="bo-email">Email *</label>
                    <input type="email" id="bo-email" name="email" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="bo-phone">Phone *</label>
                    <input type="tel" id="bo-phone" name="phone" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="bo-location">Preferred Location</label>
                    <select id="bo-location" name="catering_location">
                      <option value="">Any / Not sure</option>
                      {locations.map((loc) => (
                        <option key={loc.id} value={loc.shortName}>{loc.shortName}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="bo-date">Event Date *</label>
                    <input type="date" id="bo-date" name="event_date" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="bo-guests">Guest Count *</label>
                    <input type="number" id="bo-guests" name="guest_count" min="10" max="500" required />
                  </div>
                  <div className="form-group full">
                    <label htmlFor="bo-utensils">Need plates, cups &amp; serving utensils?</label>
                    <select id="bo-utensils" name="utensils_needed" defaultValue="">
                      <option value="">Select (optional)</option>
                      <option value="yes">Yes, please include utensils</option>
                      <option value="no">No, we have our own</option>
                    </select>
                  </div>
                  <div className="form-group full">
                    <label htmlFor="bo-notes">Special Requests &amp; Notes</label>
                    <textarea id="bo-notes" name="notes" rows={3} placeholder="Dietary needs, event details, etc."></textarea>
                  </div>
                  <input type="text" name="website" className="hp-field" tabIndex={-1} autoComplete="off" />
                  <div className="form-submit">
                    <button type="submit" className="btn btn-warm">Submit Order Request</button>
                  </div>
                </form>
              </div>
            )}

            {/* QUICK INQUIRY PANEL */}
            {activeFormTab === 'quick-inquiry' && (
              <div id="panel-quick-inquiry" role="tabpanel">
                <form className="form-grid" name="catering-inquiry" method="POST" action="/success">
                  <input type="hidden" name="form_type" value="quick-inquiry" />
                  <div className="form-group">
                    <label htmlFor="qi-name">Full Name *</label>
                    <input type="text" id="qi-name" name="full_name" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="qi-email">Email *</label>
                    <input type="email" id="qi-email" name="email" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="qi-phone">Phone *</label>
                    <input type="tel" id="qi-phone" name="phone" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="qi-date">Approximate Event Date</label>
                    <input type="date" id="qi-date" name="event_date" />
                  </div>
                  <div className="form-group full">
                    <label htmlFor="qi-utensils">Need plates, cups &amp; serving utensils?</label>
                    <select id="qi-utensils" name="utensils_needed" defaultValue="">
                      <option value="">Select (optional)</option>
                      <option value="yes">Yes, please include utensils</option>
                      <option value="no">No, we have our own</option>
                    </select>
                  </div>
                  <div className="form-group full">
                    <label htmlFor="qi-message">Tell us about your event *</label>
                    <textarea id="qi-message" name="message" rows={5} placeholder="Event type, number of guests, menu preferences..." required></textarea>
                  </div>
                  <input type="text" name="website" className="hp-field" tabIndex={-1} autoComplete="off" />
                  <div className="form-submit">
                    <button type="submit" className="btn btn-warm">Send Inquiry</button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testimonials">
        <div className="container">
          <span className="section-label">What Our Clients Say</span>
          <h2 className="section-title">Trusted for Events Big &amp; Small</h2>
          <p className="section-subtitle" style={{ marginBottom: 12 }}>Rated <strong>4.9/5</strong> from 435+ catering orders on ezCater</p>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-stars" aria-label="5 out of 5 stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
              <p className="testimonial-text">&ldquo;The Jerk Chicken is out of this world! My guests practically attacked it and there were no leftovers in sight. Will absolutely use this catering team again. They arrived perfectly on time and the food was delicious!&rdquo;</p>
              <div className="testimonial-author">Samantha</div>
              <div className="testimonial-event">Event Catering &middot; via ezCater</div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-stars" aria-label="5 out of 5 stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
              <p className="testimonial-text">&ldquo;This has to be the most moist jerk chicken I&apos;ve ever had. Our work group absolutely loved the food and the whiting, mac and cheese&hellip; chef&apos;s kiss!!!&rdquo;</p>
              <div className="testimonial-author">Janet</div>
              <div className="testimonial-event">Corporate Lunch &middot; via ezCater</div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-stars" aria-label="5 out of 5 stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
              <p className="testimonial-text">&ldquo;The food arrived hot which is amazing. It was an absolute rave from everyone! Arrived on time, hot, and was thoroughly enjoyed by all. I highly recommend this restaurant.&rdquo;</p>
              <div className="testimonial-author">Natalia</div>
              <div className="testimonial-event">Event Coordinator &middot; via ezCater</div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT STRIP */}
      <section className="catering-contact-strip">
        <div className="container">
          <h3>Questions? Call Us Directly</h3>
          <div className="contact-strip-row">
            <a href="tel:+19144327776">(914) 432-7776</a>
          </div>
          <p className="strip-email">
            Or email <a href="mailto:catering@cravinjc.com">catering@cravinjc.com</a>
          </p>
        </div>
      </section>

      {/* FLOATING CART PILL */}
      <button
        className={`floating-cart-pill ${pillVisible ? 'visible' : ''}`}
        onClick={scrollToForm}
        aria-label={`View order: ${itemCount} items, ${formatCurrency(total)}`}
      >
        <span className="cart-badge">{itemCount}</span>
        <span className="pill-label-full">View &amp; Submit Order &middot; {formatCurrency(total)}</span>
        <span className="pill-label-short">View Order &middot; {formatCurrency(total)}</span>
      </button>

      {/* TOAST NOTIFICATIONS */}
      {toasts.map((t) => (
        <Toast key={t.id} message={t.message} />
      ))}
    </>
  );
}
