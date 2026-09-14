import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireActiveStaff } from '@/lib/admin-auth';
import { AdminBreadcrumb } from '@/components/admin/AdminBreadcrumb';
import { LOCATIONS, formatBytes, labelFor } from '@/lib/staff-data';
import { AVAILABILITY, formatAppliedDate, type ApplicationRow } from '@/lib/applicants-data';
import {
  DeleteApplicantButton,
  HireButton,
  NotesForm,
  ResumeButton,
  ResumeUpload,
} from '@/app/admin/applicants/ApplicantControls';

export const dynamic = 'force-dynamic';

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="admin-detail">
      <span className="admin-detail-label">{label}</span>
      <span className="admin-detail-value">{value || '—'}</span>
    </div>
  );
}

export default async function ApplicantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user } = await requireActiveStaff();

  const { data } = await supabase.from('job_applications').select('*').eq('id', id).single();
  if (!data) notFound();
  const app = data as ApplicationRow;

  // Opening an application is what clears "New" (and the count on the admin home).
  if (!app.viewed_at) {
    await supabase
      .from('job_applications')
      .update({ viewed_at: new Date().toISOString(), viewed_by: user.id })
      .eq('id', id);
  }

  return (
    <main className="admin-wrap">
      <AdminBreadcrumb
        trail={[
          { label: 'Admin', href: '/admin' },
          { label: 'Applicants', href: '/admin/applicants' },
          { label: app.full_name },
        ]}
      />

      <Link href="/admin/applicants" className="admin-back-link">← Back to Applicants</Link>

      <div className="admin-page-head">
        <div>
          <h1>{app.full_name}</h1>
          <p className="admin-hint">
            {app.position || 'General Application'} · Applied {formatAppliedDate(app.created_at)}
            {app.staff_id && (
              <>
                {' · '}
                <span className="admin-badge on">Hired</span>
              </>
            )}
          </p>
        </div>
        <div className="admin-list-actions">
          {app.staff_id ? (
            <Link href={`/admin/staff/${app.staff_id}`} className="btn btn-outline">View Staff Profile</Link>
          ) : (
            <HireButton id={id} name={app.full_name} />
          )}
          <DeleteApplicantButton id={id} name={app.full_name} />
        </div>
      </div>

      <section className="admin-detail-grid">
        <Detail label="Email" value={<a href={`mailto:${app.email}`}>{app.email}</a>} />
        <Detail
          label="Phone"
          value={app.phone && <a href={`tel:${app.phone.replace(/[^\d+]/g, '')}`}>{app.phone}</a>}
        />
        <Detail
          label="Preferred Location"
          value={app.preferred_location ? labelFor(LOCATIONS, app.preferred_location) : 'No preference'}
        />
        <Detail label="Availability" value={app.availability && labelFor(AVAILABILITY, app.availability)} />
      </section>

      <section className="admin-applicant-block">
        <h2>Experience</h2>
        {app.experience ? (
          <p className="admin-applicant-experience">{app.experience}</p>
        ) : (
          <p className="admin-hint">Nothing written.</p>
        )}
      </section>

      <section className="admin-applicant-block">
        <h2>Resume</h2>
        {app.resume_path ? (
          <div className="admin-list-row">
            <div className="admin-list-main">
              <div className="admin-list-title">{app.resume_file_name}</div>
              <div className="admin-list-meta">
                {formatBytes(app.resume_size_bytes)}
                {app.resume_size_bytes ? ' · ' : ''}Private. Links expire after 60 seconds and every view is logged.
              </div>
            </div>
            <div className="admin-list-actions">
              <ResumeButton id={id} />
              <ResumeUpload id={id} replacing />
            </div>
          </div>
        ) : (
          <>
            <p className="admin-hint">No resume attached. If the applicant sends one later, upload it here.</p>
            <div className="admin-resume-upload">
              <ResumeUpload id={id} />
            </div>
          </>
        )}
      </section>

      <section className="admin-applicant-block">
        <h2>HR Notes</h2>
        <p className="admin-hint">Only visible to admins and HR managers.</p>
        <NotesForm id={id} notes={app.notes} />
      </section>
    </main>
  );
}
