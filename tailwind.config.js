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
          lilac: '#E7A8FF',
          violet: '#BD99E8',
          periwinkle: '#C3B5FF',
          cornflower: '#99A0E8',
          sky: '#A8C7FF',
          wine: '#7856C7',
          'wine-dark': '#5D3FA6',
          light: '#E7A8FF',
          surface: '#F8FAFF',
          accent: '#BD99E8',
          olive: '#99A0E8',
          earth: '#797F9E',
        }
      }
    },
  },
  plugins: [],
}