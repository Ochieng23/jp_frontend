import { readFile } from 'fs/promises';
import { join } from 'path';
import { ImageResponse } from 'next/og';
import { fetchJob } from '../../../lib/jobsServer';

/**
 * Per-job social thumbnail (WhatsApp / LinkedIn / X / Slack previews and
 * og:image for search). Next wires this file to <meta property="og:image">
 * for /jobs/[id] automatically, overriding the sitewide fallback image.
 * Node runtime so we can read the logo from the standalone bundle's
 * public/ dir (the deploy workflow copies public/ next to server.js).
 */
export const runtime = 'nodejs';
export const revalidate = 3600;
export const alt = 'Job opening on Cazini';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const GREEN = '#148438';
const DARK = '#111928';

async function loadLogoDataUri() {
  try {
    const buf = await readFile(join(process.cwd(), 'public', 'xuyt50qed9sr7tcuo6op-Sharpened.png'));
    return `data:image/png;base64,${buf.toString('base64')}`;
  } catch {
    return null;
  }
}

function clamp(text, max) {
  if (!text) return '';
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;
}

export default async function Image({ params }) {
  const [job, logo] = await Promise.all([fetchJob(params.id), loadLogoDataUri()]);

  const title = clamp(job?.title || 'Job opening', 80);
  const employer = clamp(job?.employer?.name || '', 60);
  const chips = [
    job?.location,
    job?.jobType ? job.jobType[0].toUpperCase() + job.jobType.slice(1) : null,
    job?.contract_type ? job.contract_type.replace('-', ' ') : null,
    job?.expected_salary
      ? `${job.expected_salary_currency || ''} ${Number(job.expected_salary).toLocaleString('en-US')}`.trim()
      : null,
  ].filter(Boolean);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#ffffff',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Top: logo row */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '48px 64px 0 64px' }}>
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
            <img src={logo} width={178} height={100} style={{ objectFit: 'contain' }} />
          ) : (
            <div style={{ display: 'flex', fontSize: 40, fontWeight: 700, color: GREEN }}>CAZINI</div>
          )}
          <div
            style={{
              display: 'flex',
              marginLeft: 'auto',
              fontSize: 24,
              color: '#6b7280',
              border: '2px solid #e5e7eb',
              borderRadius: 999,
              padding: '10px 28px',
            }}
          >
            We’re hiring
          </div>
        </div>

        {/* Middle: title + employer + chips */}
        <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, padding: '28px 64px 0 64px' }}>
          <div
            style={{
              display: 'flex',
              fontSize: title.length > 45 ? 52 : 64,
              fontWeight: 700,
              color: DARK,
              lineHeight: 1.15,
              maxWidth: 1050,
            }}
          >
            {title}
          </div>
          {employer && (
            <div style={{ display: 'flex', fontSize: 34, fontWeight: 600, color: GREEN, marginTop: 18 }}>
              {employer}
            </div>
          )}
          {chips.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 26 }}>
              {chips.map((chip) => (
                <div
                  key={chip}
                  style={{
                    display: 'flex',
                    fontSize: 24,
                    color: '#374151',
                    backgroundColor: '#f3f4f6',
                    borderRadius: 999,
                    padding: '10px 24px',
                  }}
                >
                  {chip}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom: green apply band */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: GREEN,
            padding: '26px 64px',
          }}
        >
          <div style={{ display: 'flex', fontSize: 28, fontWeight: 600, color: '#ffffff' }}>
            Apply in minutes — no account needed
          </div>
          <div style={{ display: 'flex', fontSize: 28, fontWeight: 700, color: '#ffffff' }}>
            jobs.cazini.co.ke
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
