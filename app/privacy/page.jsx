import PublicNav from '../../components/PublicNav';

export const metadata = {
  title: 'Privacy Policy',
  description: 'How Cazini collects, uses, stores and protects your personal data — including your Job Passport profile, credentials and job applications.',
  alternates: { canonical: '/privacy' },
};

const heading = 'text-lg font-bold text-gray-900 mt-8 mb-2';
const body = 'text-sm text-gray-600 leading-relaxed';
const list = 'list-disc list-inside text-sm text-gray-600 leading-relaxed space-y-1';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNav />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
        <p className="text-xs text-gray-400 mt-2">Last updated: August 2026 · This policy is pending final legal review.</p>

        <h2 className={heading}>What we collect</h2>
        <ul className={list}>
          <li>Account details: name, email address, password (stored only as a salted hash), and optionally phone, nationality, date of birth, bio, profile photo and introduction video.</li>
          <li>Job Passport content you add: work experience, education, credentials, industry preferences and supporting documents.</li>
          <li>Job applications: the details and documents you submit when applying to a job, whether signed in or as a guest (name, email, phone, resume).</li>
          <li>Technical data needed to run the service, such as authentication cookies and request logs.</li>
        </ul>

        <h2 className={heading}>How we use it</h2>
        <ul className={list}>
          <li>To operate your Job Passport and, where you request it, verify entries.</li>
          <li>To submit your job applications to the employer you choose.</li>
          <li>To send transactional email (account verification, password resets) — we do not sell your data or send third-party marketing.</li>
          <li>To keep the platform safe: uploaded videos are automatically screened for inappropriate content before storage.</li>
        </ul>

        <h2 className={heading}>Sharing and control</h2>
        <p className={body}>
          Your passport is private by default. It is shared only when you create a share link
          (which expires on the schedule you choose and can be revoked), export a PDF, or
          apply to a job — in which case your application goes to that employer. Platform
          administrators can access profile data for verification and support. Verified
          entries are labelled as verified; self-reported entries are labelled as such.
        </p>

        <h2 className={heading}>Storage and security</h2>
        <p className={body}>
          Data is stored on Microsoft Azure (database and file storage) with access limited
          to authenticated services. Passwords are hashed with bcrypt. Transactional email is
          delivered via Azure Communication Services from the cazini.co.ke domain. Share
          links stop working after their expiry time and return a &quot;gone&quot; response.
        </p>

        <h2 className={heading}>Your rights</h2>
        <p className={body}>
          You can view and edit your profile at any time from Settings, delete individual
          credentials, education and work-history entries, and request full account deletion
          by contacting us. To exercise any data right, email{' '}
          <a href="mailto:hello@cazini.ai" className="font-medium" style={{ color: '#148438' }}>hello@cazini.ai</a>.
        </p>
      </div>
    </div>
  );
}
