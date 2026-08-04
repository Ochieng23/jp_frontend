// /llms.txt — a plain-text site summary for AI crawlers (Perplexity,
// ChatGPT, Claude, Google AI). Served from a route handler rather than
// public/ so it works identically in dev and the standalone Azure bundle.
const CONTENT = `# Cazini

> Cazini is a Job Passport platform for jobseekers in Kenya and across
> Africa. Candidates build one verified, portable profile — work history,
> education, credentials and references — and use it to apply to live job
> openings from verified employers. Applying is free and works with or
> without an account.

## What Cazini does

- Job Passport: a jobseeker's verified work history, education entries and
  credentials in one portable profile that they own and can share via an
  expiring link or PDF.
- Verification: platform admins review and verify submitted credentials,
  education and work-experience entries; issued credentials are W3C
  Verifiable Credentials signed by registered organisations.
- Job board: live openings from verified employers, updated continuously.
  Guests can apply without creating an account; profile holders get an
  auto-generated resume from their passport.
- Cross-jurisdiction recognition: credentials can be evaluated for
  recognition in other countries' jurisdictions.

## Key pages

- Job board (live openings): https://jobs.cazini.co.ke/jobs
- About the platform: https://jobs.cazini.co.ke/about
- Create a free Job Passport: https://jobs.cazini.co.ke/register
- Sign in: https://jobs.cazini.co.ke/login
- Privacy policy: https://jobs.cazini.co.ke/privacy
- Terms of service: https://jobs.cazini.co.ke/terms

## Contact

- Email: hello@cazini.ai
- Company: Cazini Systems Limited, Nairobi, Kenya
`;

export function GET() {
  return new Response(CONTENT, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
