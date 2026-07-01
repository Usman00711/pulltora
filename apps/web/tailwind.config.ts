import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: 'hsl(var(--card))',
        'card-foreground': 'hsl(var(--card-foreground))',
        popover: 'hsl(var(--popover))',
        'popover-foreground': 'hsl(var(--popover-foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))'
        },
        success: {
          DEFAULT: 'hsl(var(--success))'
        },
        danger: {
          DEFAULT: 'hsl(var(--danger))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        destructive: 'hsl(var(--destructive))',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        surface: 'hsl(var(--surface))',
        'surface-2': 'hsl(var(--surface-2))',
        brand: {
          DEFAULT: 'hsl(var(--brand))',
          foreground: 'hsl(var(--brand-foreground))',
          glow: 'hsl(var(--brand-glow))'
        }
      },
      animation: {
        'pulltora-fade-up': 'pulltora-fade-up var(--motion-medium) cubic-bezier(0.22,1,0.36,1)',
        'pulltora-pop': 'pulltora-pop var(--motion-fast) cubic-bezier(0.22,1,0.36,1)',
        'pulltora-glow': 'pulltora-glow var(--motion-slow) cubic-bezier(0.22,1,0.36,1) both'
      },
      keyframes: {
        'pulltora-fade-up': {
          from: { opacity: '0', transform: 'translateY(18px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        },
        'pulltora-pop': {
          from: { opacity: '0.8', transform: 'scale(0.985)' },
          to: { opacity: '1', transform: 'scale(1)' }
        },
        'pulltora-glow': {
          from: { filter: 'brightness(0.98)' },
          to: { filter: 'brightness(1.02)' }
        }
      }
    }
  },
  plugins: []
} satisfies Config;
