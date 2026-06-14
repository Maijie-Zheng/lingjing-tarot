/**
 * 分享卡片图片生成 —— P3-7 v0.9
 *
 * 从 Canvas 手动绘制改为 html-to-image 导出 SharePoster DOM。
 * Canvas 代码全部移除，仅保留 downloadImage 工具函数。
 *
 * 流程：
 * SharePoster（React 组件渲染为 DOM）
 *   → 等图片 + 二维码 SVG + 字体加载完成
 *   → html-to-image toPng(posterRef.current, { pixelRatio: 2 })
 *   → Data URL
 *   → 弹窗 / Web Share API / 下载
 */

import { toPng } from 'html-to-image'

/**
 * 从 SharePoster DOM 导出 PNG Data URL
 *
 * @param {HTMLElement} posterEl - SharePoster 的 DOM 根节点
 * @returns {Promise<string>} PNG Data URL（750×1334，pixelRatio=2）
 */
export async function generateShareImage(posterEl) {
  if (!posterEl) {
    throw new Error('generateShareImage: posterEl 不能为空')
  }

  try {
    const dataURL = await toPng(posterEl, {
      pixelRatio: 2,
      // 确保背景色正确（html-to-image 默认不捕获 CSS 背景渐变，需显式指定）
      backgroundColor: '#1a0a2e',
    })
    return dataURL
  } catch (err) {
    console.error('html-to-image 导出失败:', err)
    throw err
  }
}

/**
 * 触发图片下载
 *
 * @param {string} dataURL - PNG Data URL
 * @param {string} filename - 下载文件名
 */
export function downloadImage(dataURL, filename = '灵境-塔罗解读.png') {
  const link = document.createElement('a')
  link.download = filename
  link.href = dataURL
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
