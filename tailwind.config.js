/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './lib/**/*.{js,jsx}',
    './context/**/*.{js,jsx}',
    './hooks/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Derived from jobs.workable.com's actual computed styles (the
        // homepage/job-board design benchmark) — not a guessed palette.
        primary: {
          50: '#e6f0ee',
          100: '#c2dbd6',
          200: '#9dc4bc',
          300: '#5c9186',
          400: '#2f7669',
          500: '#00594d',
          600: '#004038',
          700: '#00332c',
          800: '#002620',
          900: '#001f1a',
        },
        cream: '#faf8f4',
      },
      fontFamily: {
        sans: ['var(--font-plex-sans)', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['var(--font-plex-mono)', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
};
