/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        jarvis: {
          primary: '#00f2ff',
          secondary: '#00a8ff',
          bg: '#0a0e14',
          card: 'rgba(12, 18, 26, 0.8)',
          accent: '#7000ff',
        }
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 8s linear infinite',
        'spin-slow-reverse': 'spin-reverse 12s linear infinite',
        'orb-float': 'orbFloat 6s ease-in-out infinite',
        'glow-flicker': 'glowFlicker 0.1s infinite',
        'scan': 'scan 3s linear infinite',
      },
      keyframes: {
        orbFloat: {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '50%': { transform: 'translateY(-20px) scale(1.05)' },
        },
        'spin-reverse': {
          from: { transform: 'rotate(360deg)' },
          to: { transform: 'rotate(0deg)' },
        },
        glowFlicker: {
          '0%, 100%': { opacity: '0.8', boxShadow: '0 0 20px #00f2ff' },
          '50%': { opacity: '1', boxShadow: '0 0 40px #00f2ff, 0 0 10px #7000ff' },
        },
        scan: {
          '0%': { top: '-100%' },
          '100%': { top: '100%' },
        }
      }
    },
  },
  plugins: [],
}
