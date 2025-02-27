// tailwind.config.js
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
          DEFAULT: '#5DFDCB', // Neon Mint/Teal
          dark: '#4AEBC9',    // Slightly Darker Mint
          light: '#7BFFD9',   // Lighter Mint
        },
        secondary: {
          DEFAULT: '#1F2833', // Deep Space Blue
          light: '#2D3846',   // Lighter Space Blue
        },
        background: {
          DEFAULT: '#0B0C10', // Near Black (Main Background)
          light: '#1A1C24',   // Slightly Lighter Space Black
        },
        accent: {
          DEFAULT: '#66FCF1', // Bright Cyan
          light: '#87FFF6',   // Lighter Cyan
          dark: '#45E6DB',    // Darker Cyan
        },
        neutral: {
          DEFAULT: '#C5C6C7', // Light Gray
          light: '#E6E6E6',   // Lighter Gray
          dark: '#9A9B9C',    // Darker Gray
        },
        success: {
          DEFAULT: '#00B894', // Mint Green
        },
        warning: {
          DEFAULT: '#FDCB6E', // Soft Yellow
        },
        error: {
          DEFAULT: '#FF6B6B', // Soft Red
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'glow': '0 0 10px rgba(93, 253, 203, 0.5), 0 0 20px rgba(93, 253, 203, 0.3)',
        'glow-accent': '0 0 10px rgba(102, 252, 241, 0.5), 0 0 20px rgba(102, 252, 241, 0.3)',
        'glow-primary': '0 0 10px rgba(93, 253, 203, 0.5), 0 0 20px rgba(93, 253, 203, 0.3)',
        'glow-xl': '0 0 25px rgba(93, 253, 203, 0.5), 0 0 50px rgba(93, 253, 203, 0.3)',
        'inner-glow': 'inset 0 0 10px rgba(93, 253, 203, 0.3)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(to right, #5DFDCB, #66FCF1)',
        'gradient-dark': 'linear-gradient(to bottom right, #0B0C10, #1F2833)',
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
      },
      animation: {
        'pulse-subtle': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 1.5s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(93, 253, 203, 0.3), 0 0 10px rgba(93, 253, 203, 0.2)' },
          '100%': { boxShadow: '0 0 10px rgba(93, 253, 203, 0.5), 0 0 20px rgba(93, 253, 203, 0.3)' },
        },
      },
      backdropFilter: {
        'none': 'none',
        'blur': 'blur(4px)',
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
    },
  },
  plugins: [
    // Add custom plugins here if needed
    function({ addUtilities }) {
      const newUtilities = {
        '.backdrop-blur-xs': {
          'backdrop-filter': 'blur(2px)',
        },
        '.backdrop-blur-sm': {
          'backdrop-filter': 'blur(4px)',
        },
        '.backdrop-blur-md': {
          'backdrop-filter': 'blur(8px)',
        },
        '.backdrop-blur-lg': {
          'backdrop-filter': 'blur(12px)',
        },
        '.backdrop-blur-xl': {
          'backdrop-filter': 'blur(16px)',
        },
        '.backdrop-blur-2xl': {
          'backdrop-filter': 'blur(24px)',
        },
        '.backdrop-blur-3xl': {
          'backdrop-filter': 'blur(36px)',
        },
        '.text-shadow-sm': {
          'text-shadow': '0 1px 2px rgba(0, 0, 0, 0.2)',
        },
        '.text-shadow': {
          'text-shadow': '0 2px 4px rgba(0, 0, 0, 0.3)',
        },
        '.text-shadow-md': {
          'text-shadow': '0 4px 8px rgba(0, 0, 0, 0.4)',
        },
        '.text-shadow-lg': {
          'text-shadow': '0 8px 16px rgba(0, 0, 0, 0.5)',
        },
        '.text-shadow-xl': {
          'text-shadow': '0 12px 24px rgba(0, 0, 0, 0.6)',
        },
        '.text-shadow-glow': {
          'text-shadow': '0 0 10px rgba(93, 253, 203, 0.8), 0 0 20px rgba(93, 253, 203, 0.5)',
        },
      };
      addUtilities(newUtilities);
    },
  ],
}