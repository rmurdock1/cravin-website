import Link from 'next/link';

/** Breadcrumb for admin sub-pages so the admin home is always one click away. */
export function AdminBreadcrumb({ trail }: { trail: { label: string; href?: string }[] }) {
  return (
    <nav className="admin-breadcrumb" aria-label="Breadcrumb">
      {trail.map((t, i) => (
        <span key={i} className="admin-crumb">
          {t.href ? <Link href={t.href}>{t.label}</Link> : <span aria-current="page">{t.label}</span>}
          {i < trail.length - 1 && <span className="admin-crumb-sep" aria-hidden="true">›</span>}
        </span>
      ))}
    </nav>
  );
}
