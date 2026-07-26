/* eslint-disable @next/next/no-img-element */

// Full lockup (mark + "CAZINI" wordmark), transparent PNG. Natural ratio ~1.776:1.
const LOCKUP_SRC = '/xuyt50qed9sr7tcuo6op-Sharpened.png';
// Mark only (no wordmark), opaque white background — used only where the
// wordmark isn't wanted and a solid background is acceptable.
const MARK_ONLY_SRC = '/WhatsApp_Image_2025-05-23_at_15.08.32_hxckfh-Sharpened.jpg';

/**
 * Cazini brand mark. `showWordmark={false}` renders just the mark.
 * `variant="light"` recolors the lockup to solid white for dark backgrounds
 * (the source PNG has real alpha transparency, so brightness(0) invert(1)
 * cleanly turns the green mark + blue wordmark to white without a white box).
 */
export default function CaziniLogo({ className = '', markSize = 32, showWordmark = true, wordmarkClassName = '', variant = 'default' }) {
  if (!showWordmark) {
    return (
      <img
        src={MARK_ONLY_SRC}
        alt="Cazini"
        className={className}
        style={{ height: markSize, width: 'auto', objectFit: 'contain' }}
      />
    );
  }

  return (
    <img
      src={LOCKUP_SRC}
      alt="Cazini"
      className={`${wordmarkClassName} ${className}`}
      style={{
        height: markSize,
        width: 'auto',
        objectFit: 'contain',
        filter: variant === 'light' ? 'brightness(0) invert(1)' : undefined,
      }}
    />
  );
}
