/**
 * 全局常量
 */

/** 三牌位中文标签 */
export const POSITION_LABEL = {
  past: '过去',
  present: '现在',
  future: '未来',
}

/** 分享卡片二维码指向 —— 优先读环境变量，方便换部署时只改 .env */
export const SHARE_URL = import.meta.env.VITE_SHARE_URL || 'https://lingjing-tarot.vercel.app?from=share'
