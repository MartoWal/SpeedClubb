/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        racing: {
          red: '#c8102e',
          redGlow: '#dc2626',
          darkRed: '#70000e',
          yellow: '#d97706',
          amber: '#f59e0b',
          gold: '#d4af37',
        },
        telemetry: {
          950: '#07090c',
          900: '#0e1117',
          850: '#131821',
          800: '#1a202c',
          700: '#283141',
          600: '#3c485e',
        },
        asphalt: {
          900: '#111215',
          800: '#191b20',
          700: '#23262d',
        }
      },
      fontFamily: {
        racing: ['"Racing Sans One"', '"Kanit"', '"Chakra Petch"', 'sans-serif'],
        telemetry: ['"Rajdhani"', '"Chakra Petch"', '"Share Tech Mono"', 'monospace'],
        display: ['"Orbitron"', '"Kanit"', 'sans-serif'],
      },
      boxShadow: {
        'glow-red': '0 4px 14px rgba(0, 0, 0, 0.7)',
        'glow-cyan': '0 4px 14px rgba(0, 0, 0, 0.7)',
        'glow-gold': '0 4px 14px rgba(0, 0, 0, 0.7)',
        'metallic': 'inset 0 1px 0 rgba(255, 255, 255, 0.15), inset 0 -2px 0 rgba(0, 0, 0, 0.6), 0 4px 12px rgba(0, 0, 0, 0.7)',
        'metallic-hover': 'inset 0 1px 0 rgba(255, 255, 255, 0.25), inset 0 -2px 0 rgba(0, 0, 0, 0.8), 0 6px 16px rgba(0, 0, 0, 0.8)',
      },
      animation: {
        'rev-pulse': 'revPulse 1.4s ease-in-out infinite',
        'float-slow': 'floatSlow 4s ease-in-out infinite',
      },
      keyframes: {
        revPulse: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.02)', opacity: '0.9' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
