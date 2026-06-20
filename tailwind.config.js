/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F7F1E8',
        paper: '#EFE4D2',
        darkBrown: '#4A3728',
        coffeeBrown: '#8B6B4A',
        vintageGold: '#D4B16A',
        textColor: '#2E2E2E',
      },
      fontFamily: {
        playfair: ['"Playfair Display"', 'serif'],
        cormorant: ['"Cormorant Garamond"', 'serif'],
        greatVibes: ['"Great Vibes"', 'cursive'],
        allura: ['Allura', 'cursive'],
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
