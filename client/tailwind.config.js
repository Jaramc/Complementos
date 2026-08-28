/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
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
          
          // Semantic mappings with elegant iris & periwinkle gradients
          wine: '#7856C7',        // Deep Royal Lavender/Amethyst for titles and primary elements
          'wine-dark': '#5D3FA6',  // Deep shade for hovers
          light: '#E7A8FF',       // Soft vibrant lilac
          surface: '#F8FAFF',     // Ethereal clean background
          accent: '#BD99E8',      // Soft violet
          olive: '#99A0E8',       // Cornflower blue
          earth: '#797F9E',       // Muted slate purple
        },
      },
    },
  },
  plugins: [],
}
