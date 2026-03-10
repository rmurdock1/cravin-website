'use client';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main>
      <section className="page-hero" id="main-content">
        <div className="container" style={{ textAlign: 'center', padding: '140px 0 80px' }}>
          <h1>Something Went Wrong</h1>
          <p className="page-hero-subtitle" style={{ marginBottom: 32 }}>
            We&apos;re sorry, an unexpected error occurred. Please try again.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={reset} className="btn btn-warm">Try Again</button>
            <a href="/" className="btn btn-outline-green">Back to Home</a>
          </div>
        </div>
      </section>
    </main>
  );
}
