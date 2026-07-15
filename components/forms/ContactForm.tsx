'use client';

import { PhoneInput } from '@/components/forms/PhoneInput';
import { submitNetlifyForm } from '@/lib/netlify-forms';

export function ContactForm() {
  return (
    <form
      name="contact"
      method="POST"
      action="/success"
      data-netlify="true"
      netlify-honeypot="website"
      onSubmit={submitNetlifyForm}
    >
      <input type="hidden" name="form-name" value="contact" />
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="contact-name">Full Name</label>
          <input type="text" id="contact-name" name="name" required />
        </div>
        <div className="form-group">
          <label htmlFor="contact-email">Email</label>
          <input type="email" id="contact-email" name="email" required />
        </div>
        <div className="form-group">
          <label htmlFor="contact-phone">Phone</label>
          <PhoneInput id="contact-phone" name="phone" />
        </div>
        <div className="form-group">
          <label htmlFor="contact-subject">Subject</label>
          <select id="contact-subject" name="subject" defaultValue="general">
            <option value="general">General Inquiry</option>
            <option value="catering">Catering</option>
            <option value="feedback">Feedback</option>
            <option value="press">Press/Media</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="form-group full">
          <label htmlFor="contact-message">Message</label>
          <textarea id="contact-message" name="message" rows={5} placeholder="How can we help?" required></textarea>
        </div>
        {/* Honeypot */}
        <input type="text" name="website" className="hp-field" tabIndex={-1} autoComplete="off" aria-hidden="true" />
        <div className="form-submit">
          <button type="submit" className="btn btn-warm">Send Message</button>
        </div>
      </div>
    </form>
  );
}
