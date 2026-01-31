/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1B4332',
          dark: '#0D2818',
          light: '#2D6A4F',
          lighter: '#40916C',
          pale: '#95D5B2',
        },
        surface: '#F8FAF8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 8px rgba(27, 67, 50, 0.08)',
        button: '0 2px 4px rgba(27, 67, 50, 0.2)',
      },
    },
  },
  plugins: [],
};
