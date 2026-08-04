import PublicNav from '../../components/PublicNav';

export const metadata = {
  title: 'Terms of Service',
  description: 'The terms that govern use of Cazini — the Job Passport platform and job board for jobseekers and employers across Africa.',
  alternates: { canonical: '/terms' },
};

const heading = 'text-lg font-bold text-gray-900 mt-8 mb-2';
const body = 'text-sm text-gray-600 leading-relaxed';
const list = 'list-disc list-inside text-sm text-gray-600 leading-relaxed space-y-1';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNav />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
        <p className="text-xs text-gray-400 mt-2">Last updated: August 2026 · These terms are pending final legal review.</p>

        <h2 className={heading}>The service</h2>
        <p className={body}>
          Cazini, operated by Cazini Systems Limited (Nairobi, Kenya), provides a Job
          Passport — a personal profile of credentials, work history and education, with
          optional verification — and a job board listing openings from employers. Using the
          job board to apply is free and does not require an account.
        </p>

        <h2 className={heading}>Your responsibilities</h2>
        <ul className={list}>
          <li>Information you add to your passport or a job application must be truthful and yours. Misrepresenting qualifications or submitting forged documents may lead to removal of content or account termination.</li>
          <li>You are responsible for keeping your login credentials confidential and for activity on your account.</li>
          <li>Uploaded content must be lawful and appropriate; profile videos are automatically screened and may be rejected.</li>
        </ul>

        <h2 className={heading}>Verification and credentials</h2>
        <p className={body}>
          &quot;Verified&quot; means the entry was reviewed by the platform or issued as a signed
          credential by a registered organisation. Verification is performed in good faith
          but does not constitute a legal guarantee of the underlying facts. Verified entries
          are locked from editing; you may still delete your own entries.
        </p>

        <h2 className={heading}>Job listings and applications</h2>
        <p className={body}>
          Job listings are provided by employers. Cazini transmits your application to the
          employer but is not a party to any employment relationship, and does not guarantee
          interviews, offers or the accuracy of listings. Never pay anyone to apply for a
          job on Cazini — report suspicious listings to us.
        </p>

        <h2 className={heading}>Share links</h2>
        <p className={body}>
          Passport share links expire on the schedule you choose. Anyone holding an unexpired
          link can view the shared profile; treat links like the personal data they carry.
        </p>

        <h2 className={heading}>Liability and changes</h2>
        <p className={body}>
          The service is provided &quot;as is&quot; without warranties of any kind to the extent
          permitted by law. We may update these terms; continued use after an update means
          acceptance. Questions:{' '}
          <a href="mailto:hello@cazini.ai" className="font-medium" style={{ color: '#148438' }}>hello@cazini.ai</a>.
        </p>
      </div>
    </div>
  );
}
