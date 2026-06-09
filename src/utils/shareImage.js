/**
 * Canvas 分享卡片生成
 * 尺寸：750×1334（3:4 竖版，适合微信/朋友圈/小红书）
 *
 * 布局结构：
 * ┌────────────────────┐
 * │  ✨ 星空背景         │
 * │  🃏  🃏  🃏       │
 * │  过去 现在 未来     │
 * │  "关于「问题」..."   │
 * │  💬 精选解读片段     │
 * │  ───── ✨ ─────    │
 * │  灵 境             │
 * │  AI 塔罗 · 心灵之境 │
 * └────────────────────┘
 */

const WIDTH = 750
const HEIGHT = 1334
const PADDING = 40

// 星空粒子预生成
function drawStarryBackground(ctx) {
  // 深紫渐变背景
  const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT)
  gradient.addColorStop(0, '#1a0a2e')
  gradient.addColorStop(1, '#0d0221')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, WIDTH, HEIGHT)

  // 星空粒子（固定种子，保证每次生成一致）
  const stars = []
  for (let i = 0; i < 80; i++) {
    const seed = (i * 137.508 + 42) % 1000 / 1000
    stars.push({
      x: seed * WIDTH,
      y: ((i * 271.828 + 31) % 1000) / 1000 * HEIGHT,
      r: ((i * 314.159 + 7) % 1000) / 1000 * 2 + 0.5,
      opacity: ((i * 161.803 + 13) % 1000) / 1000 * 0.5 + 0.3,
      isGold: i % 5 !== 0, // 80% 金色，20% 白色
    })
  }

  stars.forEach(({ x, y, r, opacity, isGold }) => {
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    const color = isGold ? `rgba(201,169,110,${opacity})` : `rgba(255,255,255,${opacity * 0.8})`
    ctx.fillStyle = color
    ctx.fill()
  })
}

// 绘制圆角矩形
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x, y + h, x, y + h - r, r)
  ctx.lineTo(x, y + r)
  ctx.arcTo(x, y, x + r, y, r)
  ctx.closePath()
}

// 文字换行
function wrapText(ctx, text, maxWidth) {
  const lines = []
  for (const paragraph of text.split('\n')) {
    if (!paragraph.trim()) {
      lines.push('')
      continue
    }
    let line = ''
    for (const char of paragraph) {
      const testLine = line + char
      if (ctx.measureText(testLine).width > maxWidth) {
        lines.push(line)
        line = char
      } else {
        line = testLine
      }
    }
    if (line) lines.push(line)
  }
  return lines
}

/**
 * 提取解读中最戳心的 2-3 句（作为精选片段）
 */
function extractHighlights(readingText) {
  if (!readingText) return ['牌面已揭示你的答案...']

  // 按句子拆分
  const sentences = readingText
    .replace(/\n/g, '。')
    .split(/[。！？；]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 8 && s.length < 80)

  // 简单策略：取中间段落的句子，通常更有内容
  if (sentences.length <= 3) return sentences

  const start = Math.floor(sentences.length * 0.3)
  const highlights = sentences.slice(start, start + 4)
  return highlights.slice(0, 3)
}

/**
 * 生成分享卡片 Canvas
 * @param {object} data - { question, cards, reading }
 * @returns {HTMLCanvasElement}
 */
export function generateShareCanvas({ question, cards, reading }) {
  const canvas = document.createElement('canvas')
  canvas.width = WIDTH
  canvas.height = HEIGHT
  const ctx = canvas.getContext('2d')

  // ===== 1. 背景 =====
  drawStarryBackground(ctx)

  // ===== 2. 标题区域 =====
  let y = 80

  ctx.fillStyle = '#c9a96e'
  ctx.font = 'bold 48px "Noto Serif SC", serif'
  ctx.textAlign = 'center'
  ctx.fillText('灵 境', WIDTH / 2, y)

  y += 44
  ctx.fillStyle = 'rgba(255,255,255,0.5)'
  ctx.font = '22px "PingFang SC", "Noto Sans SC", sans-serif'
  ctx.fillText('AI 塔罗 · 心灵之境', WIDTH / 2, y)

  // ===== 3. 问题 =====
  y += 70
  ctx.fillStyle = 'rgba(255,255,255,0.35)'
  ctx.font = '20px "PingFang SC", sans-serif'
  ctx.fillText('关于', WIDTH / 2, y)

  y += 40
  ctx.fillStyle = 'rgba(255,255,255,0.9)'
  ctx.font = '28px "Noto Serif SC", serif'
  const qText = question.length > 20 ? question.slice(0, 20) + '...' : question
  ctx.fillText(`「${qText}」`, WIDTH / 2, y)

  // ===== 4. 三张牌 =====
  y += 80
  const cardWidth = 100
  const cardHeight = 150
  const cardGap = 30
  const totalCardsWidth = cardWidth * 3 + cardGap * 2
  const cardStartX = (WIDTH - totalCardsWidth) / 2

  const posLabels = ['过去', '现在', '未来']
  const posEmojis = ['🌙', '✨', '🔮']

  for (let i = 0; i < 3; i++) {
    const cx = cardStartX + i * (cardWidth + cardGap)
    const card = cards[i]
    const isReversed = card?.isReversed

    // 牌面背景
    roundRect(ctx, cx, y, cardWidth, cardHeight, 12)
    const cardGrad = ctx.createLinearGradient(cx, y, cx + cardWidth, y + cardHeight)
    cardGrad.addColorStop(0, '#1e1050')
    cardGrad.addColorStop(1, '#0d1b3e')
    ctx.fillStyle = cardGrad
    ctx.fill()

    // 边框
    ctx.strokeStyle = 'rgba(201,169,110,0.4)'
    ctx.lineWidth = 2
    ctx.stroke()

    // 牌名
    ctx.fillStyle = '#c9a96e'
    ctx.font = 'bold 18px "Noto Serif SC", serif'
    ctx.textAlign = 'center'
    ctx.fillText(card?.name || '?', cx + cardWidth / 2, y + cardHeight / 2 - 4)

    // 逆位标签
    if (isReversed) {
      ctx.fillStyle = '#ef4444'
      ctx.font = '14px "PingFang SC", sans-serif'
      ctx.fillText('逆位', cx + cardWidth / 2, y + cardHeight / 2 + 26)
    }

    // 位置标签
    ctx.fillStyle = 'rgba(255,255,255,0.6)'
    ctx.font = '18px "PingFang SC", sans-serif'
    ctx.fillText(`${posEmojis[i]} ${posLabels[i]}`, cx + cardWidth / 2, y + cardHeight + 28)
  }

  // ===== 5. 精选解读片段 =====
  y += cardHeight + 70
  const highlights = extractHighlights(reading)

  // 分隔线
  ctx.strokeStyle = 'rgba(201,169,110,0.25)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(WIDTH * 0.2, y)
  ctx.lineTo(WIDTH * 0.8, y)
  ctx.stroke()

  y += 50
  ctx.fillStyle = 'rgba(255,255,255,0.5)'
  ctx.font = '20px "PingFang SC", sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('💬 牌面这样说', WIDTH / 2, y)

  y += 50
  ctx.fillStyle = 'rgba(255,255,255,0.85)'
  ctx.font = '24px/1.6 "Noto Serif SC", serif'
  ctx.textAlign = 'center'

  for (const highlight of highlights) {
    const lines = wrapText(ctx, `"${highlight}"`, WIDTH - PADDING * 4)
    for (const line of lines) {
      if (y > HEIGHT - 280) break // 超出范围停止
      ctx.fillText(line, WIDTH / 2, y)
      y += 38
    }
    y += 18
  }

  // ===== 6. 品牌底部 =====
  const footerY = HEIGHT - 180

  // 底部渐变遮罩
  const footerGrad = ctx.createLinearGradient(0, footerY - 40, 0, HEIGHT)
  footerGrad.addColorStop(0, 'rgba(13,2,33,0)')
  footerGrad.addColorStop(0.5, 'rgba(13,2,33,0.9)')
  ctx.fillStyle = footerGrad
  ctx.fillRect(0, footerY - 40, WIDTH, HEIGHT - footerY + 40)

  // 分隔线
  ctx.strokeStyle = 'rgba(201,169,110,0.3)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(WIDTH * 0.2, footerY)
  ctx.lineTo(WIDTH * 0.8, footerY)
  ctx.stroke()

  // 品牌
  ctx.fillStyle = '#c9a96e'
  ctx.font = 'bold 36px "Noto Serif SC", serif'
  ctx.textAlign = 'center'
  ctx.fillText('灵 境', WIDTH / 2, footerY + 60)

  ctx.fillStyle = 'rgba(255,255,255,0.4)'
  ctx.font = '20px "PingFang SC", sans-serif'
  ctx.fillText('AI 塔罗 · 心灵之境', WIDTH / 2, footerY + 96)

  // 二维码占位
  ctx.fillStyle = 'rgba(255,255,255,0.15)'
  ctx.font = '16px "PingFang SC", sans-serif'
  ctx.fillText('🔮 扫码体验你的专属塔罗解读', WIDTH / 2, footerY + 140)

  return canvas
}

/**
 * 将 Canvas 转为 PNG Data URL
 */
export function canvasToDataURL(canvas) {
  return canvas.toDataURL('image/png', 0.9)
}

/**
 * 触发图片下载
 */
export function downloadImage(dataURL, filename = '灵境-塔罗解读.png') {
  const link = document.createElement('a')
  link.download = filename
  link.href = dataURL
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
