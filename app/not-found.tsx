import Link from 'next/link';

export default function NotFound() {
  return (
    <main>
      <section className="page-hero" id="main-content">
        <div className="container" style={{ textAlign: 'center', padding: '140px 0 80px' }}>
          <h1>Page Not Found</h1>
          <p className="page-hero-subtitle" style={{ marginBottom: 32 }}>
            Sorry, the page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/" className="btn btn-warm">Back to Home</Link>
            <Link href="/menu" className="btn btn-outline-green">View Menu</Link>
            <Link href="/contact" className="btn btn-outline-green">Contact Us</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
