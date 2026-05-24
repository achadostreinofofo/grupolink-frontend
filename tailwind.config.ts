import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Verde Neon/Ciano — cor de destaque (botões, CTAs, gradientes)
        brand: {
          50:  '#e6fff9',
          100: '#b3ffea',
          200: '#80ffdb',
          300: '#4dffcc',
          400: '#1affbd',
          500: '#00FFC8',
          600: '#00ccab',
          700: '#00997f',
          800: '#006653',
          900: '#003328',
        },
        // Verde Escuro WhatsApp — associação com o mensageiro
        whatsapp: {
          50:  '#e6f5f2',
          100: '#b3dfd6',
          200: '#80c9ba',
          300: '#4db39e',
          400: '#1a9d82',
          500: '#075E54',
          600: '#054943',
          700: '#043834',
          800: '#022824',
          900: '#011917',
        },
        // Azul Profundo / Grafite — base do Dark Mode
        night: {
          50:  '#e6e9ee',
          100: '#c2c9d4',
          200: '#9ea9ba',
          300: '#7989a0',
          400: '#556986',
          500: '#1b2942',
          600: '#142036',
          700: '#0F172A',
          800: '#0A192F',
          900: '#050d1a',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-orbitron)', 'var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        neon:      '0 0 25px rgba(0, 255, 200, 0.35)',
        'neon-lg': '0 0 60px rgba(0, 255, 200, 0.45)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #00FFC8 0%, #075E54 100%)',
        'night-gradient': 'linear-gradient(180deg, #0A192F 0%, #0F172A 100%)',
        'grid-night':
          "linear-gradient(rgba(0,255,200,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,200,0.06) 1px, transparent 1px)",
      },
      backgroundSize: {
        'grid-32': '32px 32px',
      },
      keyframes: {
        'pulse-neon': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(0, 255, 200, 0.6)' },
          '50%':      { boxShadow: '0 0 0 12px rgba(0, 255, 200, 0)' },
        },
      },
      animation: {
        'pulse-neon': 'pulse-neon 2.2s ease-out infinite',
      },
    },
  },
  plugins: [],
}

export default config
