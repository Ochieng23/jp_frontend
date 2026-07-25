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
          300: '#5c9186',
          500: '#00594d',
          600: '#004038',
          700: '#00332c',
          900: '#001f1a',
        },
        cream: '#faf8f4',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
