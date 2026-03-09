'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { navLinks } from '@/lib/site-data';

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <div className={`mobile-menu ${open ? 'open' : ''}`} aria-label="Mobile navigation">
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
