/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 原有品牌色（向后兼容）
        brand: {
          gold: '#c9a96e',
          purple: '#8b5cf6',
        },
        mystic: {
          dark: '#1a0a2e',
          deeper: '#0d0221',
        },
        // 新设计系统色板
        ink: {
          900: '#0E0A1F',
          800: '#14102A',
          700: '#16102F',
          nebula: '#251A4D',
        },
        gold: {
          50: '#FFF8E6',
          100: '#F6E8BC',
          200: '#F3E3B0',
          DEFAULT: '#E6C982',
          600: '#C9A24E',
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', 'serif'],
        sans: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'body': ['16px', { lineHeight: '1.8' }],
      },
      borderRadius: {
        card: '18px',
        btn: '16px',
      },
      spacing: {
        page: '20px',
      },
      keyframes: {
        shine: {
          '0%': { backgroundPosition: '0% 0' },
          '100%': { backgroundPosition: '220% 0' },
        },
        spin: {
          to: { transform: 'rotate(360deg)' },
        },
        spinr: {
          to: { transform: 'rotate(-360deg)' },
        },
        twinkle: {
          '0%,100%': {
            opacity: '.85',
            filter: 'drop-shadow(0 0 5px rgba(230,201,130,.45))',
          },
          '50%': {
            opacity: '1',
            filter: 'drop-shadow(0 0 11px rgba(230,201,130,.7))',
          },
        },
        glow: {
          '0%,100%': {
            opacity: '.42',
            transform: 'translate(-50%,-50%) scale(1)',
          },
          '50%': {
            opacity: '.72',
            transform: 'translate(-50%,-50%) scale(1.12)',
          },
        },
        breath: {
          '0%,100%': {
            boxShadow: '0 6px 26px rgba(230,201,130,.30)',
          },
          '50%': {
            boxShadow: '0 6px 42px rgba(230,201,130,.55)',
          },
        },
      },
      animation: {
        shine: 'shine 7s linear infinite',
        'spin-slow': 'spin 42s linear infinite',
        'spin-rev': 'spinr 56s linear infinite',
        'spin-core': 'spin 55s linear infinite',
        twinkle: 'twinkle 4.5s ease-in-out infinite',
        glow: 'glow 5s ease-in-out infinite',
        breath: 'breath 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
