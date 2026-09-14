import Link from 'next/link';
import { requireActiveStaff } from '@/lib/admin-auth';
import { AdminBreadcrumb } from '@/components/admin/AdminBreadcrumb';

export const dynamic = 'force-dynamic';

// The walkthrough linked from the welcome message and the admin home. Keep it in
// step with the screens it describes: button labels here should match the UI.
export default async function GuidePage() {
  const { profile } = await requireActiveStaff();
  const isAdmin = profile.role === 'owner';

  return (
    <main className="admin-wrap admin-guide">
      <AdminBreadcrumb trail={[{ label: 'Admin', href: '/admin' }, { label: 'Getting Started' }]} />
      <h1>Getting Started</h1>
      <p className="admin-hint">
        Everything you can do in the Cravin admin, step by step. Come back here any time from the
        admin home.
      </p>

      {/* A div, not <nav>: the global `nav` rule styles the fixed site navbar. */}
      <div className="admin-guide-toc" role="navigation" aria-label="Guide contents">
        <a href="#signing-in">Signing in</a>
        <a href="#postings">Job Postings</a>
        <a href="#applicants">Applicants</a>
        <a href="#staff">Staff &amp; document scanning</a>
        {isAdmin && <a href="#team">Team Access</a>}
        <a href="#privacy">Privacy</a>
      </div>

      <section id="signing-in" className="admin-guide-section">
        <h2>Signing in</h2>
        <ol>
          <li>Go to <strong>www.cravinjc.com/admin</strong>.</li>
          <li>
            Click <strong>Continue with Google</strong> and choose the Google account for the email
            address you were invited with. There&apos;s no password to remember.
          </li>
          <li>
            You&apos;re signed out automatically after <strong>30 minutes</strong> without activity.
            Just sign in again.
          </li>
        </ol>
        <p className="admin-guide-tip">
          Seeing <strong>Access pending</strong>? Your account needs to be switched on. Ask an Admin
          to activate you in Team Access.
        </p>
      </section>

      <section id="postings" className="admin-guide-section">
        <h2>Job Postings</h2>
        <p>Openings you publish here appear on the public careers page.</p>
        <h3>Create a posting</h3>
        <ol>
          <li>Open <Link href="/admin/postings">Job Postings</Link> and click <strong>+ New posting</strong>.</li>
          <li>
            To save time, pick a saved role from <strong>Start from a template</strong>, or start blank.
          </li>
          <li>
            Fill in the job title, the <strong>location</strong> (one store or All Locations), the
            employment type and a short description. Add responsibilities, requirements and perks
            one line at a time.
          </li>
          <li>
            Click <strong>Save as draft</strong> to keep it hidden, or <strong>Publish posting</strong> to
            put it live on the careers page.
          </li>
        </ol>
        <h3>Manage postings</h3>
        <ul>
          <li>Each posting shows <strong>Live</strong> or <strong>Draft</strong>. Use <strong>Publish</strong> / <strong>Unpublish</strong> to switch.</li>
          <li><strong>Edit</strong> changes a posting; <strong>Delete</strong> removes it for good.</li>
          <li>
            Posting the same role again later? While editing, click <strong>Save as template</strong> and
            give it a name. Templates are listed at the bottom of Job Postings.
          </li>
        </ul>
      </section>

      <section id="applicants" className="admin-guide-section">
        <h2>Applicants</h2>
        <p>
          Everyone who applies on the careers page lands here. The Applicants card on the admin home
          shows how many are <strong>new</strong>.
        </p>
        <ul>
          <li>
            <Link href="/admin/applicants">Applicants</Link> are grouped into <strong>New</strong>,{' '}
            <strong>Reviewed</strong> and <strong>Hired</strong>. Opening an application marks it reviewed.
          </li>
          <li>
            <strong>Resume → View</strong> opens their resume in a new tab. If they send one later by
            email, use <strong>Upload resume</strong> (or <strong>Replace</strong> to swap it).
          </li>
          <li>
            <strong>HR Notes</strong>: interview notes, follow-ups, references. Click{' '}
            <strong>Save Notes</strong>. Only Admins and HR Managers can see them.
          </li>
          <li>
            <strong>Hire → Staff</strong> creates their staff profile from the application (name, email,
            phone, the position as their job title, preferred store) and copies their resume into their
            documents. You land on their profile to fill in the rest.
          </li>
          <li><strong>Delete</strong> removes the application and its resume for good.</li>
        </ul>
      </section>

      <section id="staff" className="admin-guide-section">
        <h2>Staff &amp; document scanning</h2>
        <h3>Add someone with Scan ✨</h3>
        <ol>
          <li>Open <Link href="/admin/staff">Staff</Link> and click <strong>Add Staff</strong>.</li>
          <li>
            Under <strong>Start with a document</strong>, choose the document type (I-9, W-4, offer letter,
            certification, ID, resume or other), choose the file and click <strong>Upload</strong>. PDF, JPG,
            PNG, HEIC and Word files up to 10 MB are accepted.
          </li>
          <li>
            PDFs and photos (JPG, PNG, GIF, WebP) are <strong>scanned automatically</strong> after upload. The
            scan reads the <strong>name, job title, email, phone, address, start date, employment type, store
            and emergency contact (name, phone and relationship)</strong>, whichever the document includes.
            Word files can&apos;t be scanned.
          </li>
          <li>
            Check what it found. Untick anything that&apos;s wrong, then click <strong>Apply</strong> to fill
            in the details. Fields filled this way are marked <strong>✨ from scan</strong>.
          </li>
          <li>
            Finish the rest: tick every <strong>location</strong> they work at, then set employment type,
            status and hire date. Click <strong>Save Profile</strong>. Nothing is saved until you do.
          </li>
        </ol>
        <p className="admin-guide-tip">
          No document handy? Skip the scan and type the details in. New job titles are added to the list
          automatically for next time.
        </p>
        <h3>Keep profiles up to date</h3>
        <ul>
          <li>Click anyone in the directory to see their profile, then <strong>Edit</strong> to change it.</li>
          <li>
            On a profile page you can upload more documents at any time. There, applying a scan updates
            the profile straight away.
          </li>
          <li>
            The directory groups people by store. Anyone at two or more stores shows as{' '}
            <strong>Floating</strong>. Set status to <strong>Former</strong> when someone leaves to keep
            their records without counting them.
          </li>
          <li><strong>Delete</strong> removes a profile and all of its documents for good.</li>
        </ul>
      </section>

      {isAdmin && (
        <section id="team" className="admin-guide-section">
          <h2>Team Access (Admins only)</h2>
          <ul>
            <li>
              Invite someone with the email address of their Google account and choose{' '}
              <strong>HR Manager</strong> or <strong>Admin</strong>.
            </li>
            <li>
              Invites don&apos;t send an email. Use <strong>Welcome message</strong> to copy a ready-made
              message, or open it in Gmail and send it yourself.
            </li>
            <li>Change someone&apos;s role, or <strong>Deactivate</strong> them to remove access immediately.</li>
          </ul>
        </section>
      )}

      <section id="privacy" className="admin-guide-section">
        <h2>Privacy</h2>
        <ul>
          <li>
            Documents and resumes are stored privately. Links to open them expire after 60 seconds, and
            every view is logged.
          </li>
          <li>Scanning never extracts Social Security numbers or dates of birth.</li>
          <li>On a shared computer, sign out from the admin home when you&apos;re done.</li>
        </ul>
      </section>
    </main>
  );
}
