/**
 * Cazini brand mark — a broken-ring "C" (concentric dashed arcs) + wordmark.
 * `showWordmark={false}` renders just the mark (e.g. for a favicon-sized slot).
 */
export default function CaziniLogo({ className = '', markSize = 32, showWordmark = true, wordmarkClassName = '', variant = 'default' }) {
  const ringColor = variant === 'light' ? '#4ADE80' : '#1E7A34';
  const wordmarkColor = variant === 'light' ? '#FFFFFF' : '#2E4BDA';

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        width={markSize}
        height={markSize}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden={showWordmark ? 'true' : undefined}
        role={showWordmark ? undefined : 'img'}
      >
        {!showWordmark && <title>Cazini</title>}
        {[40, 30, 20].map((r) => (
          <path
            key={r}
            d={`M ${50 + r * Math.cos((50 * Math.PI) / 180)} ${50 - r * Math.sin((50 * Math.PI) / 180)}
                A ${r} ${r} 0 1 0 ${50 + r * Math.cos((50 * Math.PI) / 180)} ${50 + r * Math.sin((50 * Math.PI) / 180)}`}
            stroke={ringColor}
            strokeWidth={r === 40 ? 7 : 6}
            strokeLinecap="butt"
            strokeDasharray={r === 40 ? '20 8 34 8' : r === 30 ? '16 7 26 7' : '12 6 16 6'}
          />
        ))}
      </svg>
      {showWordmark && (
        <span
          className={`font-extrabold tracking-tight ${wordmarkClassName}`}
          style={{ color: wordmarkColor }}
        >
          CAZINI
        </span>
      )}
    </span>
  );
}
