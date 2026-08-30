/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ios: {
          blue: '#007AFF',
          indigo: '#5856D6',
          purple: '#AF52DE',
          pink: '#FF2D55',
          red: '#FF3B30',
          orange: '#FF9500',
          yellow: '#FFCC00',
          green: '#34C759',
          mint: '#00C7BE',
          teal: '#30B0C7',
          cyan: '#32ADE6',
          gray: {
            1: '#8E8E93',
            2: '#AEAEB2',
            3: '#C7C7CC',
            4: '#D1D1D6',
            5: '#E5E5EA',
            6: '#F2F2F7',
          },
          dark: {
            bg: '#000000',
            card: '#1C1C1E',
            secondary: '#2C2C2E',
            tertiary: '#3A3A3C',
            elevated: '#242426',
          },
          light: {
            bg: '#F2F2F7',
            card: '#FFFFFF',
            secondary: '#E5E5EA',
            tertiary: '#D1D1D6',
            elevated: '#FFFFFF',
          }
        }
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif'
        ],
      },
      borderRadius: {
        'ios': '12px',
        'ios-lg': '16px',
        'ios-xl': '22px',
        'ios-2xl': '28px',
      },
      boxShadow: {
        'ios-sm': '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'ios': '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.03)',
        'ios-lg': '0 10px 30px -4px rgba(0, 0, 0, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.04)',
        'ios-dark': '0 4px 20px -2px rgba(0, 0, 0, 0.4), 0 2px 6px -1px rgba(0, 0, 0, 0.2)',
      },
      backdropBlur: {
        'ios': '20px',
      },
      screens: {
        'xs': '380px',
        'ipad': '820px',
      }
    },
  },
  plugins: [],
}
