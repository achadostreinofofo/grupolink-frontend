import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#e0feff',
          100: '#b3fbff',
          200: '#66f4ff',
          300: '#00e9ff',
          400: '#00d4f0',
          500: '#00bcd4',
          600: '#00E5FF',
          700: '#0097a7',
          900: '#004d56',
        },
        dark: {
          950: '#04070f',
          900: '#080B14',
          800: '#0D1117',
          700: '#161B22',
          600: '#1C2333',
          500: '#243040',
        },
        neon: {
          cyan:   '#00E5FF',
          purple: '#A855F7',
          pink:   '#EC4899',
          green:  '#10B981',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':  'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'cyber-grid':      "linear-gradient(rgba(0,229,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.03) 1px, transparent 1px)",
      },
      backgroundSize: {
        'grid-40': '40px 40px',
      },
      animation: {
        'pulse-slow':  'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float':       'float 6s ease-in-out infinite',
        'glow-pulse':  'glowPulse 2s ease-in-out infinite',
        'spin-slow':   'spin 8s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.6', boxShadow: '0 0 20px rgba(0,229,255,0.3)' },
          '50%':      { opacity: '1',   boxShadow: '0 0 40px rgba(0,229,255,0.6)' },
        },
      },
      boxShadow: {
        'neon-cyan':   '0 0 20px rgba(0, 229, 255, 0.4), 0 0 60px rgba(0, 229, 255, 0.1)',
        'neon-purple': '0 0 20px rgba(168, 85, 247, 0.4), 0 0 60px rgba(168, 85, 247, 0.1)',
        'glass':       '0 8px 32px rgba(0, 0, 0, 0.4)',
      },
    },
  },
  plugins: [],
}

export default config
