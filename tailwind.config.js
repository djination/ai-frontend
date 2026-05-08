/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f2f7ff',
          100: '#e4efff',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
        },
      },
    },
  },
  plugins: [],
}

