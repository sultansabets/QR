/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        primary: '#3b82f6',
      },
    },
  },
  plugins: [],
};
