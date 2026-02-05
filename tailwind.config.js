/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f7f0',
          100: '#b3e5d1',
          200: '#80d3b2',
          300: '#4dc193',
          400: '#1aaf74',
          500: '#00684a',
          600: '#00533b',
          700: '#003e2c',
          800: '#00291d',
          900: '#00140e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
