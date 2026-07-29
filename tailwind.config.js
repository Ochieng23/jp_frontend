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
        // Anchored to the Cazini logo mark's actual green (#148438, sampled
        // directly from the logo PNG) — 600 is that exact color.
        primary: {
          50: '#effaf3',
          100: '#d6f5e0',
          200: '#abedc0',
          300: '#67e48f',
          400: '#24db5f',
          500: '#1bb14b',
          600: '#148438',
          700: '#10672c',
          800: '#0c4d20',
          900: '#083718',
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
