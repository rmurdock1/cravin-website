import Link from 'next/link';

export function StickyOrderButton() {
  return (
    <Link href="/order" className="sticky-order" aria-label="Order food online">
      Order Online <span className="arrow" aria-hidden="true">&rarr;</span>
    </Link>
  );
}
