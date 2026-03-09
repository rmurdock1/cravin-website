'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function StickyOrderButton() {
  const pathname = usePathname();

  // Hide on catering page (has its own floating cart pill)
  if (pathname === '/catering') return null;

  return (
    <Link href="/order" className="sticky-order" aria-label="Order food online">
      Order Online <span className="arrow" aria-hidden="true">&rarr;</span>
    </Link>
  );
}
