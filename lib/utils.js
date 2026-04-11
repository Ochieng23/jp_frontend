/**
 * Format a date value to a human-readable string.
 * @param {string|Date} value
 * @param {Intl.DateTimeFormatOptions} opts
 */
export function formatDate(value, opts = { dateStyle: 'medium' }) {
  return new Intl.DateTimeFormat('en-US', opts).format(new Date(value));
}

/**
 * Capitalise the first letter of a string.
 * @param {string} str
 */
export function capitalise(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Simple debounce helper.
 * @param {Function} fn
 * @param {number} delay ms
 */
export function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
