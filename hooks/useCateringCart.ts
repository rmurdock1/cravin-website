'use client';

import { useState, useEffect, useCallback } from 'react';

export interface CartItem {
  id: string;
  name: string;
  size: 'half' | 'full' | 'single';
  priceCents: number;
  qty: number;
}

function sizeLabel(size: CartItem['size']): string {
  if (size === 'half') return 'Half Pan';
  if (size === 'full') return 'Full Pan';
  return '';
}

function formatCurrency(cents: number): string {
  const dollars = cents / 100;
  return dollars % 1 === 0
    ? `$${dollars.toLocaleString()}`
    : `$${dollars.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function useCateringCart() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load from sessionStorage on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('cravin-cart');
      if (saved) setCart(JSON.parse(saved));
    } catch {}
    setLoaded(true);
  }, []);

  // Persist to sessionStorage on change
  useEffect(() => {
    if (!loaded) return;
    try {
      sessionStorage.setItem('cravin-cart', JSON.stringify(cart));
    } catch {}
  }, [cart, loaded]);

  const addItem = useCallback((id: string, name: string, size: CartItem['size'], priceCents: number, qty: number) => {
    setCart((prev) => {
      const idx = prev.findIndex((item) => item.id === id && item.size === size);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + qty };
        return next;
      }
      return [...prev, { id, name, size, priceCents, qty }];
    });
  }, []);

  const removeItem = useCallback((id: string, size: CartItem['size']) => {
    setCart((prev) => prev.filter((item) => !(item.id === id && item.size === size)));
  }, []);

  const updateQty = useCallback((id: string, size: CartItem['size'], newQty: number) => {
    if (newQty < 1) {
      setCart((prev) => prev.filter((item) => !(item.id === id && item.size === size)));
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.id === id && item.size === size ? { ...item, qty: newQty } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const getTotal = useCallback(() => {
    return cart.reduce((sum, item) => sum + item.priceCents * item.qty, 0);
  }, [cart]);

  const getItemCount = useCallback(() => {
    return cart.reduce((count, item) => count + item.qty, 0);
  }, [cart]);

  const serializeForForm = useCallback(() => {
    if (cart.length === 0) return '';
    const lines = cart.map((item) => {
      const sText = sizeLabel(item.size);
      const lineTotal = formatCurrency(item.priceCents * item.qty);
      return sText
        ? `${item.qty}x ${item.name} (${sText}) - ${lineTotal}`
        : `${item.qty}x ${item.name} - ${lineTotal}`;
    });
    lines.push('---');
    lines.push(`Estimated Total: ${formatCurrency(getTotal())}`);
    return lines.join('\n');
  }, [cart, getTotal]);

  /** Get cart items grouped by item ID (for qty badges on menu items) */
  const getItemQuantities = useCallback(() => {
    const map: Record<string, number> = {};
    for (const item of cart) {
      map[item.id] = (map[item.id] || 0) + item.qty;
    }
    return map;
  }, [cart]);

  return {
    cart,
    loaded,
    addItem,
    removeItem,
    updateQty,
    clearCart,
    getTotal,
    getItemCount,
    serializeForForm,
    getItemQuantities,
    formatCurrency,
  };
}

export { formatCurrency, sizeLabel };
