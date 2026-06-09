/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 品牌色
        brand: {
          gold: '#c9a96e',       // 金色——按钮、强调文字、选中发光
          purple: '#8b5cf6',     // 紫色——辅助强调
        },
        // 深紫背景体系（来自设计规范 #1a0a2e → #0d0221）
        mystic: {
          dark: '#1a0a2e',       // 上部背景
          deeper: '#0d0221',     // 下部背景（渐变终点）
        },
      },
      fontFamily: {
        serif: ['Noto Serif SC', 'serif'],           // 标题——塔罗牌名、页面大标题
        sans: ['PingFang SC', 'Noto Sans SC', 'sans-serif'], // 正文
      },
      fontSize: {
        'body': ['16px', { lineHeight: '1.8' }],     // 正文标准
      },
      borderRadius: {
        'card': '12px',          // 卡片、按钮统一圆角
      },
      spacing: {
        'page': '20px',          // 页面水平 padding
      },
    },
  },
  plugins: [],
};
