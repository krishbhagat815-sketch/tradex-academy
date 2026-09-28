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
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        slate: {
          750: '#253248',
          850: '#162032',
        },
        navy: {
          850: '#111827',
          900: '#0b0f19',
          950: '#070a10',
        },
        fintech: {
          cyan: '#06b6d4',
          blue: '#0ea5e9',
          purple: '#8b5cf6',
          emerald: '#10b981',
          rose: '#f43f5e',
          amber: '#f59e0b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'glow-sm': '0 0 15px rgba(16, 185, 129, 0.15)',
        'glow-cyan': '0 0 20px rgba(6, 182, 212, 0.2)',
        'glow-card': '0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 0 10px rgba(16, 185, 129, 0.05)',
      }
    },
  },
  plugins: [],
}
