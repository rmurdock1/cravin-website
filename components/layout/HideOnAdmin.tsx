'use client';

import { usePathname } from 'next/navigation';

/** Renders nothing on /admin routes so the public site chrome (navbar, footer,
 *  sticky order button) doesn't appear over the admin surface. */
export function HideOnAdmin({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;
  return <>{children}</>;
}
