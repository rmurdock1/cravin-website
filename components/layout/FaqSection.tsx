import type { FaqItem } from '@/lib/faq-data';

interface FaqSectionProps {
  title?: string;
  subtitle?: string;
  faqs: FaqItem[];
}

// Semantic, accessible FAQ using native <details>/<summary> — no JS required,
// fully crawlable, and the visible counterpart to the FAQPage JSON-LD.
export function FaqSection({ title = 'Frequently Asked Questions', subtitle, faqs }: FaqSectionProps) {
  return (
    <section className="faq-section" aria-labelledby="faq-heading">
      <div className="container container-narrow">
        <h2 id="faq-heading" className="faq-heading">{title}</h2>
        {subtitle && <p className="faq-subtitle">{subtitle}</p>}
        <div className="faq-list">
          {faqs.map((faq, i) => (
            <details key={i} className="faq-item" name="faq">
              <summary className="faq-question">
                <span>{faq.question}</span>
                <span className="faq-icon" aria-hidden="true">+</span>
              </summary>
              <div className="faq-answer">
                <p>{faq.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
