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
          DEFAULT: '#EBEBEB', // Soft Light Gray (Main Text)
          dark: '#D6D6D6',    // Slightly Darker Gray
          light: '#FDFDFD',   // Almost Pure White
        },
        secondary: {
          DEFAULT: '#1E1E1E', // Deep Charcoal Black
          light: '#2B2B2B',   // Slightly Lighter Black
        },
        background: {
          DEFAULT: '#0B0B0B', // Deep Black (Main Background)
          light: '#161616',   // Slightly Lighter Black for Sections
        },
        accent: {
          DEFAULT: '#FDFDFD', // Pure White (Accent Highlights)
          light: '#FFFFFF',   // Brightest White
          dark: '#EBEBEB',    // Soft Gray-White
        },
        neutral: {
          DEFAULT: '#808080', // Mid Gray for Muted UI Elements
          light: '#A0A0A0',   // Lighter Muted Gray
          dark: '#4D4D4D',    // Darker Neutral Gray
        },
        success: {
          DEFAULT: '#A0A0A0', // Lighter Gray (Subtle Success Indicator)
        },
        warning: {
          DEFAULT: '#808080', // Mid Gray (Subtle Warning)
        },
        error: {
          DEFAULT: '#4D4D4D', // Darker Gray (Error or Alerts)
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'subtle': '0 1px 3px rgba(255, 255, 255, 0.1)',
        'standard': '0 4px 6px -1px rgba(255, 255, 255, 0.1), 0 2px 4px -1px rgba(255, 255, 255, 0.06)',
        'elevated': '0 10px 15px -3px rgba(255, 255, 255, 0.1), 0 4px 6px -2px rgba(255, 255, 255, 0.05)',
      },
      backgroundImage: {
        'gradient-subtle': 'linear-gradient(to right, rgba(11, 11, 11, 0), rgba(11, 11, 11, 0.1), rgba(11, 11, 11, 0))',
      },
      animation: {
        'pulse-subtle': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
