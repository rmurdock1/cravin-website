'use client';

import Link from 'next/link';
import Image from 'next/image';
import logo from '@/public/img/logo-nav.png';
import { usePathname } from 'next/navigation';
import { navLinks } from '@/lib/site-data';
import { ThemeToggle } from './ThemeToggle';
import { MobileMenu } from './MobileMenu';
import { useState } from 'react';

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <nav aria-label="Main navigation">
        <div className="container">
          <Link href="/" className="nav-logo">
            {/* Eager but not preloaded, so it doesn't queue ahead of the hero photo. */}
            <Image src={logo} alt="Cravin Jamaican Cuisine" width={62} height={70} loading="eager" />
          </Link>
          <div className="nav-links">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={pathname === link.href ? 'active' : ''}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/order" className="nav-cta">Order Online</Link>
            <ThemeToggle />
          </div>
          <ThemeToggle className="mobile-theme-toggle" />
          <button
            className={`mobile-menu-btn ${mobileOpen ? 'open' : ''}`}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>
      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
