'use client';

import Link from 'next/link';
import { useEffect, useRef, useCallback } from 'react';
import { navLinks } from '@/lib/site-data';

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Focus trap + Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab' && menuRef.current) {
        const focusable = menuRef.current.querySelectorAll<HTMLElement>(
          'a[href], button, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    },
    [onClose]
  );

  // Manage focus on open/close
  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      document.addEventListener('keydown', handleKeyDown);

      // Move focus into menu after animation starts
      requestAnimationFrame(() => {
        const firstLink = menuRef.current?.querySelector<HTMLElement>('a[href]');
        firstLink?.focus();
      });
    } else {
      document.removeEventListener('keydown', handleKeyDown);
      // Restore focus to the element that opened the menu
      previousFocusRef.current?.focus();
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, handleKeyDown]);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <div
      ref={menuRef}
      className={`mobile-menu ${open ? 'open' : ''}`}
      role="dialog"
      aria-modal={open}
      aria-label="Mobile navigation"
    >
      {navLinks.map((link) => (
        <Link key={link.href} href={link.href} onClick={onClose}>
          {link.label}
        </Link>
      ))}
      <Link href="/order" className="btn btn-warm" onClick={onClose}>
        Order Online
      </Link>
    </div>
  );
}
