/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        // Professional newspaper typography
        'headline': ['var(--font-playfair)', 'Times New Roman', 'serif'],
        'serif': ['var(--font-source-serif)', 'Georgia', 'serif'],
        'sans': ['var(--font-inter)', 'Helvetica Neue', 'sans-serif'],
        // Aliases for your existing CSS classes
        'playfair': ['var(--font-playfair)', 'Times New Roman', 'serif'],
        'source-serif': ['var(--font-source-serif)', 'Georgia', 'serif'],
        'inter': ['var(--font-inter)', 'Helvetica Neue', 'sans-serif'],
      },
      colors: {
        // Your custom cannabis green palette
        'cannabis': {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#004a05', // Your custom green
          700: '#002c03', // Your custom dark green
          800: '#001a02',
          900: '#000f01',
        },
        // Your existing color variables
        'text': {
          'primary': '#1a1a1a',
          'secondary': '#4a4a4a',
          'muted': '#6b7280',
        },
        'accent': {
          'green': '#004a05',
          'dark-green': '#002c03',
        }
      },
      fontSize: {
        // Professional newspaper sizing
        'headline-xl': ['2.5rem', { lineHeight: '1.1', letterSpacing: '-0.03em' }],
        'headline-lg': ['2rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'headline-md': ['1.5rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        'body': ['1rem', { lineHeight: '1.8' }],
        'lead': ['1.125rem', { lineHeight: '1.7' }],
        'nav': ['0.95rem', { letterSpacing: '0.025em' }],
        'byline': ['0.875rem', { letterSpacing: '0.05em' }],
        'meta': ['0.8rem', { letterSpacing: '0.05em' }],
      },
      spacing: {
        // Professional spacing for news layout
        'article': '1.25rem',
        'section': '2rem',
        'container': '1200px',
      },
      boxShadow: {
        'card': '0 4px 12px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 8px 24px rgba(0, 0, 0, 0.12)',
        'green': '0 4px 8px rgba(0, 74, 5, 0.2)',
      },
      borderRadius: {
        'card': '0.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { 
            opacity: '0',
            transform: 'translateY(10px)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
      },
    },
  },
  plugins: [
    // Add typography plugin if you want to use Tailwind's prose classes
    // require('@tailwindcss/typography'),
  ],
}