import Link from 'next/link';

/* ─────────────────────────────────────────────────────────────────────────────
   Design philosophy: white is the canvas; colour accents only
   — Section backgrounds: white or gray-50 (max 2-stop alternation)
   — Colour used on: gradient heading text, buttons, icon boxes (w-12),
     badge chips, stat numbers, step circles, avatar gradients
   — No full-bleed coloured backgrounds (except the CTA card strip)
   ───────────────────────────────────────────────────────────────────────── */

/* ─── Passport card SVG illustration ───────────────────────────────────────── */
function PassportIllustration() {
  return (
    <svg viewBox="0 0 340 220" fill="none" xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-sm mx-auto drop-shadow-2xl">
      <rect width="340" height="220" rx="20" fill="url(#cg)" />
      <rect width="340" height="220" rx="20" fill="url(#sg)" opacity="0.15" />
      <rect y="0" width="340" height="6" rx="3" fill="white" opacity="0.3" />
      <circle cx="62" cy="85" r="36" fill="white" opacity="0.15" />
      <circle cx="62" cy="74" r="19" fill="white" opacity="0.45" />
      <ellipse cx="62" cy="106" rx="25" ry="14" fill="white" opacity="0.35" />
      <rect x="112" y="54" width="124" height="10" rx="5" fill="white" opacity="0.9" />
      <rect x="112" y="72" width="84" height="8" rx="4" fill="white" opacity="0.5" />
      <rect x="112" y="88" width="104" height="8" rx="4" fill="white" opacity="0.4" />
      <rect x="112" y="108" width="64" height="22" rx="11" fill="white" opacity="0.2" />
      <rect x="119" y="114" width="50" height="8" rx="4" fill="white" opacity="0.65" />
      <rect x="288" y="16" width="34" height="34" rx="9" fill="white" opacity="0.2" />
      <text x="297" y="37" fill="white" fontSize="12" fontWeight="bold" opacity="0.9">JP</text>
      <rect x="20" y="146" width="300" height="1" fill="white" opacity="0.2" />
      <rect x="20" y="158" width="68" height="7" rx="3.5" fill="white" opacity="0.35" />
      <rect x="20" y="172" width="52" height="7" rx="3.5" fill="white" opacity="0.6" />
      <rect x="120" y="158" width="72" height="7" rx="3.5" fill="white" opacity="0.35" />
      <rect x="120" y="172" width="92" height="7" rx="3.5" fill="white" opacity="0.6" />
      <rect x="232" y="158" width="60" height="7" rx="3.5" fill="white" opacity="0.35" />
      <rect x="232" y="172" width="78" height="7" rx="3.5" fill="white" opacity="0.6" />
      <circle cx="306" cy="168" r="14" fill="#059669" />
      <path d="M299 168l5 5 9-9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <defs>
        <linearGradient id="cg" x1="0" y1="0" x2="340" y2="220" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2563eb" />
          <stop offset="0.5" stopColor="#4f46e5" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
        <linearGradient id="sg" x1="0" y1="0" x2="340" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ─── World-map dot grid (white bg variant) ─────────────────────────────────── */
function WorldMapDots() {
  const pts = [
    [40,55],[60,50],[80,55],[95,50],[115,55],[130,50],[150,53],[170,48],[190,52],[210,55],[230,50],[250,55],[270,52],[290,55],[310,50],
    [30,70],[50,67],[70,70],[90,67],[110,70],[135,65],[155,68],[175,63],[195,67],[215,70],[235,65],[255,68],[275,70],[295,65],[315,68],
    [20,85],[45,83],[65,85],[85,83],[105,85],[125,80],[145,83],[165,78],[185,82],[205,85],[225,80],[245,83],[265,85],[285,82],[305,83],
    [35,100],[55,98],[75,100],[95,98],[120,95],[140,98],[160,93],[180,97],[200,100],[220,95],[240,98],[260,100],[280,97],[300,98],
    [50,115],[70,113],[90,115],[115,110],[135,113],[155,108],[175,112],[195,115],[215,110],[235,113],[255,115],[275,112],[295,113],
  ];
  return (
    <svg viewBox="0 0 340 140" className="w-full" xmlns="http://www.w3.org/2000/svg">
      {pts.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="2.5"
          fill={i % 3 === 0 ? '#2563eb' : i % 3 === 1 ? '#4f46e5' : '#7c3aed'}
          opacity={i % 2 === 0 ? '0.2' : '0.12'} />
      ))}
    </svg>
  );
}

/* ─── Data ──────────────────────────────────────────────────────────────────── */
const STATS = [
  { value: '12K+',  label: 'Workers registered',  color: 'text-blue-600'   },
  { value: '48',    label: 'Countries supported',  color: 'text-violet-600' },
  { value: '99.9%', label: 'Uptime SLA',           color: 'text-emerald-600'},
  { value: 'W3C',   label: 'Standards compliant',  color: 'text-amber-600'  },
];

const FEATURES = [
  { icon: '🪪', title: 'Digital Identity',        desc: 'Your official employment identity, recognized across jurisdictions and borders.',                        accent: 'bg-blue-50   border-l-blue-400'   },
  { icon: '📜', title: 'Verifiable Credentials',  desc: 'Cryptographically signed certificates that employers and authorities can verify instantly.',             accent: 'bg-violet-50 border-l-violet-400' },
  { icon: '🌍', title: 'Cross-Border Recognition',desc: 'Know exactly which of your credentials are recognized in your target country.',                          accent: 'bg-emerald-50 border-l-emerald-400'},
  { icon: '📁', title: 'Document Storage',         desc: 'Attach original PDFs or images to every credential, stored securely in Azure Blob Storage.',            accent: 'bg-amber-50  border-l-amber-400'  },
  { icon: '🔗', title: 'Shareable Links',          desc: 'Generate time-limited links to share your full passport with any employer or authority.',               accent: 'bg-sky-50    border-l-sky-400'    },
  { icon: '🛡️', title: 'Tamper-Proof',            desc: 'Built on the W3C Verifiable Credentials standard with ed25519 digital signatures.',                     accent: 'bg-cyan-50   border-l-cyan-400'   },
];

const STEPS = [
  { step: '01', icon: '✍️', title: 'Create your account',        desc: 'Register with your name, nationality, and a secure password. UNHCR ID supported.',               circle: 'from-blue-500    to-blue-600'    },
  { step: '02', icon: '🎓', title: 'Add your credentials',       desc: 'Self-report work history and certifications, or have them issued by a verified organisation.',     circle: 'from-violet-500  to-purple-600'  },
  { step: '03', icon: '📎', title: 'Upload supporting documents', desc: 'Attach PDFs or images to back up each credential. Stored securely in the cloud.',                  circle: 'from-emerald-500 to-teal-600'    },
  { step: '04', icon: '🚀', title: 'Share & get recognized',      desc: 'Generate a shareable link or check which jurisdictions recognise your qualifications.',            circle: 'from-orange-500  to-amber-600'   },
];

const TESTIMONIALS = [
  {
    quote: 'Job Passport let me prove my nursing qualifications when I moved to a new country. Within weeks I had a job offer.',
    name: 'Amara D.', role: 'Registered Nurse · Refugee, South Sudan', avatar: '👩🏿‍⚕️',
    ring: 'ring-blue-200', avatar_bg: 'from-blue-500 to-indigo-600',
  },
  {
    quote: 'I carried 10 years of construction experience but no one believed me. Now I have a verified digital record.',
    name: 'Tariq M.', role: 'Civil Engineer · Migrant Worker', avatar: '👷🏽',
    ring: 'ring-emerald-200', avatar_bg: 'from-emerald-500 to-teal-600',
  },
  {
    quote: 'Our NGO uses Job Passport to issue verified training certificates to 400+ workers every year.',
    name: 'Sophie L.', role: 'Program Director · ILO Partner NGO', avatar: '👩🏻‍💼',
    ring: 'ring-violet-200', avatar_bg: 'from-violet-500 to-purple-600',
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   Page
   ───────────────────────────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* ── Navbar — white background, colour only on logo + CTA ───────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white font-extrabold text-sm">JP</span>
            </div>
            <span className="font-extrabold text-gray-900 text-lg tracking-tight">Job Passport</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login"
              className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors px-3 py-2 rounded-lg hover:bg-gray-50">
              Sign in
            </Link>
            <Link href="/register"
              className="text-sm font-bold bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero — white background, colour only as accents ─────────────────── */}
      <section className="bg-white pt-28 pb-20 px-4 sm:px-6">
        {/* Subtle decorative rings — colour at very low opacity */}
        <div className="absolute top-32 left-1/3 w-80 h-80 rounded-full bg-blue-600/5 blur-3xl pointer-events-none" />
        <div className="absolute top-44 right-1/4 w-64 h-64 rounded-full bg-violet-600/5 blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-14 items-center">

            {/* Copy side */}
            <div>
              {/* Accent chip — colour on small element only */}
              <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-100 text-xs font-bold px-4 py-2 rounded-full mb-8 uppercase tracking-wide">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                Built for refugees &amp; mobile workers
              </div>

              <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-[1.08] mb-6 tracking-tight">
                Your credentials.<br />
                {/* Gradient only on the accent phrase — white canvas shows through elsewhere */}
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  Everywhere you go.
                </span>
              </h1>

              <p className="text-lg text-gray-600 max-w-lg mb-10 leading-relaxed">
                A portable digital credential wallet that lets you carry your work history,
                certifications, and qualifications across borders — verified and tamper-proof.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                {/* Primary CTA — the main colour punch */}
                <Link href="/register"
                  className="flex items-center justify-center gap-2 bg-blue-600 text-white font-bold px-8 py-4 rounded-2xl hover:bg-blue-700 transition-colors text-base shadow-lg shadow-blue-100">
                  🚀 Create your passport — free
                </Link>
                {/* Secondary CTA — white, grey border */}
                <Link href="/login"
                  className="flex items-center justify-center gap-2 border border-gray-300 text-gray-700 font-semibold px-8 py-4 rounded-2xl hover:bg-gray-50 transition-colors text-base">
                  Sign in →
                </Link>
              </div>

              {/* Trust line — grey icons, very quiet */}
              <div className="flex flex-wrap gap-5 text-xs font-medium text-gray-500">
                <span className="flex items-center gap-1.5">
                  <span className="text-emerald-500">✓</span> W3C Verifiable Credentials
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-blue-500">🔒</span> End-to-end encrypted
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-violet-500">⭐</span> Free forever
                </span>
              </div>
            </div>

            {/* Illustration side — white card frame, coloured illustration inside */}
            <div className="relative">
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl">
                <PassportIllustration />
                {/* Floating accent badges — colour on small elements */}
                <div className="absolute -top-3 -right-3 bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1">
                  ✓ Verified
                </div>
                <div className="absolute -bottom-4 -left-4 bg-white border border-gray-100 shadow-lg rounded-2xl px-4 py-2.5 flex items-center gap-2.5">
                  <span className="text-xl">🌍</span>
                  <div>
                    <p className="text-xs font-bold text-gray-900">48 Countries</p>
                    <p className="text-xs text-gray-500">recognize your credentials</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Stats — white background, colour on numbers only ───────────────── */}
      <section className="bg-gray-50 border-y border-gray-100 py-14 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              {/* colour accent only on the number */}
              <div className={`text-4xl font-extrabold mb-1 ${s.color}`}>{s.value}</div>
              <div className="text-sm text-gray-500 font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Global reach — white background, coloured dot map as decoration ─── */}
      <section className="bg-white py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Dot map — colour at very low opacity (decorative only) */}
            <div className="relative rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 p-6">
              <WorldMapDots />
              {/* Accent pins */}
              {[
                { top: '28%', left: '22%', label: 'Uganda'  },
                { top: '18%', left: '48%', label: 'Germany' },
                { top: '38%', left: '60%', label: 'Jordan'  },
                { top: '22%', left: '75%', label: 'Canada'  },
              ].map((pin) => (
                <div key={pin.label}
                  className="absolute flex items-center gap-1.5"
                  style={{ top: pin.top, left: pin.left }}>
                  <div className="w-2.5 h-2.5 bg-blue-600 rounded-full shadow-sm shadow-blue-300" />
                  <span className="text-xs font-semibold text-gray-700 bg-white px-1.5 py-0.5 rounded shadow-sm border border-gray-100">
                    {pin.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Copy */}
            <div>
              <div className="inline-block bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-full border border-blue-100 mb-5 uppercase tracking-wide">
                🌐 Global reach
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-5 tracking-tight leading-tight">
                Cross borders<br />
                <span className="text-blue-600">with confidence</span>
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                Whether you&apos;re relocating for work, fleeing conflict, or seeking new
                opportunities — your credentials stay with you, recognised in 48+ countries.
              </p>
              <div className="space-y-3">
                {['Recognized in 48+ countries', 'UNHCR & ILO compliant', 'Works offline via PDF export'].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-emerald-600 text-xs font-bold">✓</span>
                    </div>
                    <span className="text-gray-700 text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features — white cards, colour only on left accent border + icon ── */}
      <section className="bg-gray-50 py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block bg-violet-50 text-violet-700 text-xs font-bold px-4 py-1.5 rounded-full border border-violet-100 mb-4 uppercase tracking-wide">
              Everything you need
            </div>
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
              One wallet. All your credentials.
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto text-lg">
              From your first job to your latest qualification — organized, portable, always verifiable.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title}
                className={`bg-white rounded-2xl p-6 border-l-4 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ${f.accent}`}>
                {/* Emoji in a lightly tinted box — accent colour on small element */}
                <div className="w-11 h-11 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-xl mb-4">
                  {f.icon}
                </div>
                <h3 className="font-bold text-gray-900 text-base mb-2">{f.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works — white cards on white, colour on step circles ─────── */}
      <section className="bg-white py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block bg-emerald-50 text-emerald-700 text-xs font-bold px-4 py-1.5 rounded-full border border-emerald-100 mb-4 uppercase tracking-wide">
              Simple process
            </div>
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">
              Up and running in minutes
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((item, i) => (
              <div key={item.step} className="relative">
                {/* Connector line between steps */}
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-7 left-[calc(100%-8px)] w-8 border-t-2 border-dashed border-gray-200 z-10" />
                )}
                {/* White card — colour only on the circle and icon */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm h-full">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.circle} flex items-center justify-center text-2xl mb-4 shadow-md`}>
                    {item.icon}
                  </div>
                  <div className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-1.5">
                    Step {item.step}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 text-sm leading-snug">{item.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials — white cards, colour accent on avatar only ────────── */}
      <section className="bg-gray-50 py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block bg-amber-50 text-amber-700 text-xs font-bold px-4 py-1.5 rounded-full border border-amber-100 mb-4 uppercase tracking-wide">
              Real stories
            </div>
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">
              People whose careers moved forward
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col hover:shadow-md transition-shadow">
                {/* Decorative quotation — colour is non-informational, aria-hidden */}
                <div className="text-3xl font-serif text-blue-200 mb-4 leading-none select-none" aria-hidden="true">❝</div>
                <p className="text-gray-700 text-sm leading-relaxed flex-1 mb-6">{t.quote}</p>
                <div className={`flex items-center gap-3 pt-4 border-t border-gray-100`}>
                  {/* Colour accent on avatar circle only */}
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.avatar_bg} flex items-center justify-center text-lg ring-2 ${t.ring}`}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA strip — the single intentional full-colour accent section ────── */}
      {/* This is the ONE place we allow a coloured background, making it pop   */}
      <section className="bg-white py-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          {/* Card with blue left border accent — colour framing on white */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
            {/* Top accent bar — thin colour strip */}
            <div className="h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600" />
            <div className="p-12 text-center">
              <div className="text-5xl mb-6">🌟</div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-5 tracking-tight">
                Ready to take your career<br />
                <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                  anywhere?
                </span>
              </h2>
              <p className="text-gray-600 mb-10 text-lg max-w-xl mx-auto">
                Join thousands of workers who trust Job Passport to carry their credentials
                across borders — free, forever.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register"
                  className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white font-extrabold px-10 py-4 rounded-2xl hover:bg-blue-700 transition-colors text-lg shadow-lg shadow-blue-100">
                  🚀 Create your free passport
                </Link>
                <Link href="/login"
                  className="inline-flex items-center justify-center gap-2 border border-gray-300 text-gray-700 font-bold px-8 py-4 rounded-2xl hover:bg-gray-50 transition-colors text-lg">
                  Sign in →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer — light, white-on-gray, colour only on logo ─────────────── */}
      <footer className="bg-gray-50 border-t border-gray-100 py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8 pb-8 border-b border-gray-200">
            <div className="flex items-center gap-2.5">
              {/* Colour accent on logo only */}
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-white font-extrabold text-sm">JP</span>
              </div>
              <span className="font-extrabold text-gray-900 text-lg">Job Passport</span>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-gray-500">
              <Link href="/login" className="hover:text-gray-900 transition-colors">Sign in</Link>
              <Link href="/register" className="hover:text-gray-900 transition-colors">Register</Link>
              <span className="text-gray-300">|</span>
              <span>W3C Verified Credentials</span>
              <span>Azure Secured</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
            <p>© {new Date().getFullYear()} Job Passport. Built for people on the move.</p>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1"><span className="text-emerald-500">🔒</span> Encrypted</span>
              <span className="flex items-center gap-1"><span className="text-blue-500">✅</span> W3C Compliant</span>
              <span className="flex items-center gap-1"><span className="text-violet-500">⭐</span> Free</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
