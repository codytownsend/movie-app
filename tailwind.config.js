/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#E50914', // Netflix-like red as default primary color
          dark: '#B81D24',
          light: '#F5222D',
        },
        secondary: {
          DEFAULT: '#221F1F', // Dark background
          light: '#2C2C2C',
        },
        background: {
          DEFAULT: '#141414', // Netflix-like dark background
          light: '#1A1A1A',
        },
      },
    },
  },
  plugins: [],
}