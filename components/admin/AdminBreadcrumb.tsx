import Link from 'next/link';

/** Breadcrumb for admin sub-pages so the admin home is always one click away.
 *  Uses a div (not <nav>) so the global `nav { position: fixed }` navbar rule
 *  doesn't turn it into a fixed bar. role+aria-label keep it a11y-equivalent. */
export function AdminBreadcrumb({ trail }: { trail: { label: string; href?: string }[] }) {
  return (
    <div className="admin-breadcrumb" role="navigation" aria-label="Breadcrumb">
      {trail.map((t, i) => (
        <span key={i} className="admin-crumb">
          {t.href ? <Link href={t.href}>{t.label}</Link> : <span aria-current="page">{t.label}</span>}
          {i < trail.length - 1 && <span className="admin-crumb-sep" aria-hidden="true">›</span>}
        </span>
      ))}
    </div>
  );
}
