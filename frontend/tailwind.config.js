/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem'
      },
      colors: {
        primary: {
          DEFAULT: '#020617',
          foreground: '#FFFFFF'
        },
        secondary: {
          DEFAULT: '#F1F5F9',
          foreground: '#0F172A'
        },
        accent: {
          DEFAULT: '#22C55E',
          foreground: '#FFFFFF'
        },
        highlight: '#F59E0B',
        destructive: {
          DEFAULT: '#EF4444',
          foreground: '#FFFFFF'
        },
        muted: {
          DEFAULT: '#64748B',
          foreground: '#94A3B8'
        },
        border: '#E2E8F0',
        input: '#E2E8F0',
        ring: '#020617',
        background: '#FFFFFF',
        foreground: '#020617',
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#020617'
        },
        popover: {
          DEFAULT: '#FFFFFF',
          foreground: '#020617'
        }
      },
      fontFamily: {
        heading: ['Oswald', 'sans-serif'],
        body: ['Manrope', 'sans-serif']
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out'
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
};
