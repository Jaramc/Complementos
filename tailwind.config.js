/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          light: '#BDDBB2',
          surface: '#F6F9F5',
          accent: '#ACBF77',
          olive: '#BCB162',
          earth: '#9D7C5D',
          wine: '#743437',
          'wine-dark': '#5c292b',
        }
      }
    },
  },
  plugins: [],
}