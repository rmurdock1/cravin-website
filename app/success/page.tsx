import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Thank You',
  description: 'Your message has been received. We will get back to you within 1 business day.',
};

export default function SuccessPage() {
  return (
    <main>
      <section className="success-section" id="main-content">
        <div className="container">
          <span className="success-icon" aria-hidden="true">&#10003;</span>
          <h1>Thank You!</h1>
          <p>Your message has been received. We&apos;ll get back to you within 1 business day.</p>
          <p>For urgent requests, feel free to call us directly.</p>
          <div className="success-actions">
            <Link href="/" className="btn btn-warm">Back to Home</Link>
            <Link href="/menu" className="btn btn-outline-green">View Menu</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
