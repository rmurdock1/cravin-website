'use client';

import { useState } from 'react';
import { jobListings, type JobListing } from '@/lib/careers-data';
import { locations } from '@/lib/site-data';

function JobCard({
  job,
  onApply,
}: {
  job: JobListing;
  onApply: (job: JobListing) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="careers-job-card" id={job.id}>
      <div className="careers-job-location-label">{job.location}</div>
      <div className="careers-job-header">
        <div>
          <h3>{job.title}</h3>
          <span className="careers-tag careers-tag-type">{job.type}</span>
        </div>
        <button
          className="btn btn-outline-green careers-toggle-btn"
          type="button"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
        >
          {expanded ? 'Less' : 'Details'}
        </button>
      </div>
      <p className="careers-job-desc">{job.description}</p>

      {expanded && (
        <div className="careers-job-details">
          <div className="careers-detail-section">
            <h4>Responsibilities</h4>
            <ul>
              {job.responsibilities.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
          <div className="careers-detail-section">
            <h4>Requirements</h4>
            <ul>
              {job.requirements.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
          {job.perks && job.perks.length > 0 && (
            <div className="careers-detail-section">
              <h4>Perks</h4>
              <ul>
                {job.perks.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <button
        className="btn btn-warm careers-apply-btn"
        type="button"
        onClick={() => onApply(job)}
      >
        Apply Now &rarr;
      </button>
    </div>
  );
}

export function CareersPageClient() {
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);

  function handleApply(job: JobListing) {
    setSelectedJob(job);
    const formEl = document.getElementById('application-form');
    if (formEl) {
      formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  return (
    <>
      {/* PAGE HERO */}
      <section className="page-hero" id="main-content">
        <div className="container">
          <h1>Join the Cravin Family</h1>
          <p className="page-hero-subtitle">
            We&apos;re growing, and we want passionate people who love great
            food and great service. Check out our open positions below.
          </p>
        </div>
      </section>

      {/* WHY CRAVIN */}
      <section className="careers-why">
        <div className="container">
          <div className="careers-why-grid">
            <div className="careers-why-card">
              <h3>Family Culture</h3>
              <p>
                We&apos;re a family business. Everyone here looks out for each
                other, from the kitchen to the counter.
              </p>
            </div>
            <div className="careers-why-card">
              <h3>Real Food, Real Skills</h3>
              <p>
                Everything is made from scratch. You&apos;ll learn authentic
                Jamaican cooking techniques and recipes.
              </p>
            </div>
            <div className="careers-why-card">
              <h3>Room to Grow</h3>
              <p>
                Three locations and counting. We promote from within, and many of
                our managers started as line cooks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* JOB LISTINGS */}
      <section className="careers-listings">
        <div className="container">
          <div className="careers-listings-header">
            <span className="section-label">Open Positions</span>
            <h2 className="section-title">Current Openings</h2>
          </div>
          <div className="careers-listings-grid">
            {jobListings.map((job) => (
              <JobCard key={job.id} job={job} onApply={handleApply} />
            ))}
          </div>
        </div>
      </section>

      {/* APPLICATION FORM */}
      <section className="careers-apply" id="application-form">
        <div className="container">
          <div className="careers-form-card">
            <span className="section-label">Apply</span>
            <h2>Submit Your Application</h2>
            <p>
              Fill out the form below and we&apos;ll be in touch within a few
              business days.
            </p>
            <form
              className="careers-form"
              action="/success"
              method="post"
              encType="multipart/form-data"
              data-netlify="true"
              netlify-honeypot="website"
              name="careers-application"
            >
              {/* Honeypot */}
              <div style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true">
                <label htmlFor="careers-website">Website</label>
                <input
                  type="text"
                  id="careers-website"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              <div className="careers-form-row">
                <div className="careers-form-group">
                  <label htmlFor="careers-name">Full Name *</label>
                  <input
                    type="text"
                    id="careers-name"
                    name="name"
                    required
                    placeholder="Your full name"
                  />
                </div>
                <div className="careers-form-group">
                  <label htmlFor="careers-email">Email *</label>
                  <input
                    type="email"
                    id="careers-email"
                    name="email"
                    required
                    placeholder="you@email.com"
                  />
                </div>
              </div>

              <div className="careers-form-row">
                <div className="careers-form-group">
                  <label htmlFor="careers-phone">Phone *</label>
                  <input
                    type="tel"
                    id="careers-phone"
                    name="phone"
                    required
                    placeholder="(914) 555-1234"
                  />
                </div>
                <div className="careers-form-group">
                  <label htmlFor="careers-position">Position *</label>
                  <select
                    id="careers-position"
                    name="position"
                    required
                    value={selectedJob?.id ?? ''}
                    onChange={(e) => {
                      const job = jobListings.find((j) => j.id === e.target.value);
                      setSelectedJob(job ?? null);
                    }}
                  >
                    <option value="">Select a position</option>
                    {jobListings.map((job) => (
                      <option key={job.id} value={job.id}>
                        {job.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="careers-form-row">
                <div className="careers-form-group">
                  <label htmlFor="careers-location-pref">Preferred Location</label>
                  <select id="careers-location-pref" name="preferred_location">
                    <option value="">No preference</option>
                    <option value="ossining">Ossining</option>
                    <option value="white-plains">White Plains</option>
                    <option value="mount-vernon">Mount Vernon</option>
                  </select>
                </div>
                <div className="careers-form-group">
                  <label htmlFor="careers-availability">Availability</label>
                  <select id="careers-availability" name="availability">
                    <option value="">Select availability</option>
                    <option value="full-time">Full-Time</option>
                    <option value="part-time">Part-Time</option>
                    <option value="weekends">Weekends Only</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>
              </div>

              <div className="careers-form-group">
                <label htmlFor="careers-experience">
                  Tell us about your experience
                </label>
                <textarea
                  id="careers-experience"
                  name="experience"
                  rows={4}
                  placeholder="Briefly describe your relevant work experience, skills, or why you want to join Cravin..."
                />
              </div>

              <div className="careers-form-group">
                <label htmlFor="careers-resume">
                  Resume (PDF, DOC, or DOCX, max 5MB)
                </label>
                <input
                  type="file"
                  id="careers-resume"
                  name="resume"
                  accept=".pdf,.doc,.docx"
                />
              </div>

              <button type="submit" className="btn btn-warm careers-submit-btn">
                Submit Application &rarr;
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="careers-cta">
        <div className="container">
          <div className="careers-cta-card">
            <h2>Don&apos;t See Your Role?</h2>
            <p>
              We&apos;re always looking for talented people. Send us your resume
              at{' '}
              <a href={`mailto:${locations[0].email}`}>{locations[0].email}</a> and
              we&apos;ll keep you in mind for future openings.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
