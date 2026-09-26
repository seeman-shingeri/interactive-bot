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
        vista: {
          bg: '#090b10',
          card: '#121620',
          cardBorder: 'rgba(255, 255, 255, 0.08)',
          accent: '#00d2ff',
          accentGlow: 'rgba(0, 210, 255, 0.3)',
          purple: '#9d4edd',
          pink: '#f72585',
          gold: '#ffd166',
          emerald: '#06d6a0',
        }
      },
      animation: {
        'float': 'float 3.5s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2.5s ease-in-out infinite',
        'spin-slow': 'spin 12s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.08)' },
        }
      }
    },
  },
  plugins: [],
}
