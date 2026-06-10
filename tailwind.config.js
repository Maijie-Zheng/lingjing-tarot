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
        // P3-2 冥想页呼吸动画
        breathe: {
          '0%,100%': { transform: 'translate(-50%,-50%) scale(.8)',  opacity: '.3'  },
          '50%':     { transform: 'translate(-50%,-50%) scale(1.16)', opacity: '.66' },
        },
        breathering: {
          '0%,100%': { transform: 'translate(-50%,-50%) scale(.82)', opacity: '.22' },
          '50%':     { transform: 'translate(-50%,-50%) scale(1.18)', opacity: '.44' },
        },
        corepulse: {
          '0%,100%': { opacity: '.5'  }, '50%': { opacity: '.95' },
        },
        textbreath: {
          '0%,100%': { opacity: '.42' }, '50%': { opacity: '.72' },
        },
        // P3-3 洗牌动画
        shuf0: {
          '0%': { transform: 'rotate(0) translateX(0)' },
          '20%': { transform: 'rotate(-9deg) translateX(-30px)' },
          '45%': { transform: 'rotate(5deg) translateX(22px)' },
          '70%': { transform: 'rotate(-3deg) translateX(-10px)' },
          '85%,100%': { transform: 'rotate(0) translateX(0)' },
        },
        shuf1: {
          '0%': { transform: 'rotate(0) translateX(0)' },
          '20%': { transform: 'rotate(8deg) translateX(28px)' },
          '45%': { transform: 'rotate(-6deg) translateX(-24px)' },
          '70%': { transform: 'rotate(4deg) translateX(12px)' },
          '85%,100%': { transform: 'rotate(0) translateX(0)' },
        },
        shuf2: {
          '0%': { transform: 'rotate(0) translateX(0)' },
          '20%': { transform: 'rotate(-5deg) translate(14px,-22px)' },
          '45%': { transform: 'rotate(7deg) translate(-18px,18px)' },
          '70%': { transform: 'rotate(-2deg) translateX(6px)' },
          '85%,100%': { transform: 'rotate(0) translateX(0)' },
        },
        shuf3: {
          '0%': { transform: 'rotate(0)' },
          '20%': { transform: 'rotate(11deg) translate(-18px,14px)' },
          '45%': { transform: 'rotate(-8deg) translate(20px,-12px)' },
          '70%': { transform: 'rotate(3deg)' },
          '85%,100%': { transform: 'rotate(0)' },
        },
        settle: {
          '0%,72%': { transform: 'scale(1)' },
          '80%': { transform: 'scale(1.06)' },
          '88%': { transform: 'scale(.97)' },
          '100%': { transform: 'scale(1)' },
        },
        shimmer: {
          '0%,100%': { opacity: '.4' }, '50%': { opacity: '1' },
        },
        textfade: {
          '0%,100%': { opacity: '.55' }, '50%': { opacity: '.9' },
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
        // P3-2 冥想页呼吸动画（统一 7s 周期）
        'breathe':     'breathe 7s ease-in-out infinite',
        'breathering': 'breathering 7s ease-in-out infinite',
        'corepulse':   'corepulse 7s ease-in-out infinite',
        'textbreath':  'textbreath 7s ease-in-out infinite',
        // P3-3 洗牌动画（使用时用 [animation-iteration-count:1] 覆盖 infinite）
        'shuf0':   'shuf0 2.5s ease-in-out infinite',
        'shuf1':   'shuf1 2.5s ease-in-out infinite',
        'shuf2':   'shuf2 2.5s ease-in-out infinite',
        'shuf3':   'shuf3 2.5s ease-in-out infinite',
        'settle':  'settle 2.5s ease-in-out infinite',
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'textfade': 'textfade 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
