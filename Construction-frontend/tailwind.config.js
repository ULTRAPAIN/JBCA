/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      screens: {
        // Mobile breakpoints
        'xs': '320px',      // Small mobile
        'mobile-md': '375px', // Medium mobile  
        'mobile-lg': '425px', // Large mobile
        // Default breakpoints are preserved: sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px
        '3xl': '1920px',    // Large desktop/TV
        '4xl': '2560px',    // 4K displays
        '5xl': '3840px',    // Ultra-wide and 8K displays
        // Tablet specific
        'tablet': '768px',
        // Container query sizes
        'container-sm': '384px',
        'container-md': '448px',
        'container-lg': '512px',
        'container-xl': '576px',
      },
      maxWidth: {
        '8xl': '88rem',     // 1408px
        '9xl': '96rem',     // 1536px
        '10xl': '120rem',   // 1920px
        '11xl': '160rem',   // 2560px
      },
      fontSize: {
        // Responsive font sizes
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
        '10xl': ['10rem', { lineHeight: '1' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
      },
      colors: {
        // Custom brand colors that work well in both themes
        brand: {
          yellow: {
            400: '#facc15',
            500: '#eab308',
            600: '#ca8a04'
          },
          red: {
            500: '#ef4444',
            600: '#dc2626',
            700: '#b91c1c'
          }
        }
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
        'fade-in-down': 'fadeInDown 0.8s ease-out forwards',
        'slide-in-up': 'slideInUp 0.8s ease-out forwards',
        'zoom-in': 'zoomIn 0.6s ease-out forwards',
        'bounce-in': 'bounceIn 0.8s ease-out forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(30px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        fadeInDown: {
          '0%': {
            opacity: '0',
            transform: 'translateY(-30px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        slideInUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(50px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        zoomIn: {
          '0%': {
            opacity: '0',
            transform: 'scale(0.9)'
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1)'
          }
        },
        bounceIn: {
          '0%': {
            opacity: '0',
            transform: 'scale(0.3)'
          },
          '50%': {
            opacity: '1',
            transform: 'scale(1.05)'
          },
          '70%': {
            transform: 'scale(0.9)'
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1)'
          }
        }
      }
    },
  },
  plugins: [
    // Add scrollbar hide utility
    function({ addUtilities }) {
      addUtilities({
        '.scrollbar-hide': {
          /* IE and Edge */
          '-ms-overflow-style': 'none',
          /* Firefox */
          'scrollbar-width': 'none',
          /* Safari and Chrome */
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        }
      })
    }
  ],
}
