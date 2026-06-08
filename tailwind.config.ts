import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './context/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        forest:       { DEFAULT: '#1B4332', mid: '#2D6A4F', light: '#52B788' },
        gold:         { DEFAULT: '#D4A017', light: '#F0C040', dark: '#B8860B' },
        cream:        { DEFAULT: '#FAF7F2', dark: '#EDE0CC' },
        wood:         { DEFAULT: '#7C5C3A', light: '#C4A35A' },
        bark:         '#2C1B0E',
        pinus:        { bg: '#F5EFE6', text: '#6B5240' },
      },
      fontFamily: {
        sans:  ['var(--font-montserrat)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-playfair)', 'serif'],
      },
      keyframes: {
        slideIn:  { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
        fadeUp:   { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        pulse2:   { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.5' } },
      },
      animation: {
        slideIn: 'slideIn 0.25s ease',
        fadeUp:  'fadeUp 0.3s ease both',
        pulse2:  'pulse2 1.5s ease infinite',
      },
    },
  },
  plugins: [],
};

export default config;
