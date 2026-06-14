/**
 * 分享卡片 Canvas 生成 —— P3-7 v0.9
 *
 * 尺寸：750×1334（3:4 竖版，pixelRatio 隐含在 Canvas 尺寸中）
 *
 * v0.9 改动：
 * - 内容从「智能打分提取」改为 AI 生成的 shareQuote + shareNarrative
 * - 新增关键词脉络（cards[].keyword 用 · 连接）
 * - 右下角二维码（qrcode.react 渲染 SVG → dataURL → drawImage）
 * - 去 emoji，位置图标改纯文字标签
 * - 修 bug：不再从 rawText 提取文字（杜绝 JSON 字段名泄露）
 */

import QRCode from 'qrcode'
import { SHARE_URL } from '../lib/constants'

const WIDTH = 750
const HEIGHT = 1334
const PADDING = 48

// ===== 位置标签 =====
const POS_LABEL = { past: '过去', present: '现在', future: '未来' }

// ===== 星空背景 + 星云光斑 =====
function drawStarryBackground(ctx) {
  // 深紫渐变
  const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT)
  gradient.addColorStop(0, '#1a0a2e')
  gradient.addColorStop(0.4, '#150830')
  gradient.addColorStop(1, '#0d0221')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, WIDTH, HEIGHT)

  // 星云光斑
  const nebulas = [
    { x: WIDTH * 0.2, y: HEIGHT * 0.25, r: 280, color: 'rgba(139,92,246,0.03)' },
    { x: WIDTH * 0.75, y: HEIGHT * 0.55, r: 320, color: 'rgba(201,169,110,0.02)' },
    { x: WIDTH * 0.3, y: HEIGHT * 0.8, r: 260, color: 'rgba(139,92,246,0.025)' },
  ]
  nebulas.forEach(({ x, y, r, color }) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    g.addColorStop(0, color)
    g.addColorStop(1, 'transparent')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, WIDTH, HEIGHT)
  })

  // 星空粒子
  const stars = []
  for (let i = 0; i < 120; i++) {
    const seed = (i * 137.508 + 42) % 1000 / 1000
    stars.push({
      x: seed * WIDTH,
      y: ((i * 271.828 + 31) % 1000) / 1000 * HEIGHT,
      r: ((i * 314.159 + 7) % 1000) / 1000 * 2.5 + 0.3,
      opacity: ((i * 161.803 + 13) % 1000) / 1000 * 0.6 + 0.2,
      isGold: i % 6 !== 0,
    })
  }

  stars.forEach(({ x, y, r, opacity, isGold }) => {
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    const color = isGold
      ? `rgba(201,169,110,${opacity})`
      : `rgba(255,255,255,${opacity * 0.7})`
    ctx.fillStyle = color
    ctx.fill()

    if (r > 1.8) {
      ctx.beginPath()
      ctx.arc(x, y, r * 2.5, 0, Math.PI * 2)
      const glow = ctx.createRadialGradient(x, y, 0, x, y, r * 2.5)
      glow.addColorStop(0, color)
      glow.addColorStop(1, 'transparent')
      ctx.fillStyle = glow
      ctx.fill()
    }
  })
}

// ===== 圆角矩形路径 =====
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

// ===== 文字换行 =====
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

// ===== 金色渐变分隔线 =====
function drawGoldDivider(ctx, y) {
  const divWidth = WIDTH * 0.4
  const divX = (WIDTH - divWidth) / 2
  const divGrad = ctx.createLinearGradient(divX, y, divX + divWidth, y)
  divGrad.addColorStop(0, 'rgba(201,169,110,0)')
  divGrad.addColorStop(0.3, 'rgba(201,169,110,0.25)')
  divGrad.addColorStop(0.5, 'rgba(201,169,110,0.35)')
  divGrad.addColorStop(0.7, 'rgba(201,169,110,0.25)')
  divGrad.addColorStop(1, 'rgba(201,169,110,0)')
  ctx.strokeStyle = divGrad
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(divX, y)
  ctx.lineTo(divX + divWidth, y)
  ctx.stroke()
}

// ===== 生成二维码 Image（qrcode 库直接输出 dataURL）=====
function generateQRImage() {
  return new Promise((resolve) => {
    QRCode.toDataURL(
      SHARE_URL,
      {
        width: 168, // 2x 尺寸保证清晰
        margin: 1,
        color: { dark: '#1a1338', light: '#f3eede' },
        errorCorrectionLevel: 'M',
      },
      (err, dataURL) => {
        if (err) {
          console.error('二维码生成失败:', err)
          resolve(null)
          return
        }
        const img = new Image()
        img.onload = () => resolve(img)
        img.onerror = () => resolve(null)
        img.src = dataURL
      }
    )
  })
}

// ===== 加载牌面图片 =====
function loadCardImages(cards) {
  return Promise.all(
    cards.map((card) => {
      return new Promise((resolve) => {
        if (!card?.image) {
          resolve(null)
          return
        }
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => resolve(img)
        img.onerror = () => resolve(null)
        img.src = card.image
      })
    })
  )
}

/**
 * 生成分享卡片 Canvas
 *
 * @param {object} data
 * @param {string} data.question - 用户问题
 * @param {Array} data.cards - 三张牌 [{ image, name, isReversed, keyword, position }]
 * @param {string|null} data.shareQuote - AI 金句
 * @param {string|null} data.shareNarrative - AI 浓缩叙事
 * @returns {Promise<HTMLCanvasElement>}
 */
export async function generateShareCanvas({ question, cards, shareQuote, shareNarrative }) {
  const canvas = document.createElement('canvas')
  canvas.width = WIDTH
  canvas.height = HEIGHT
  const ctx = canvas.getContext('2d')

  // ===== 1. 星空背景 =====
  drawStarryBackground(ctx)

  // ===== 2. 并行加载牌面 + 二维码 =====
  const [cardImages, qrImage] = await Promise.all([
    loadCardImages(cards || []),
    generateQRImage(),
  ])

  // ========================================
  // ===== 3. 品牌头 =====
  // ========================================
  let y = 80

  ctx.fillStyle = '#c9a96e'
  ctx.font = 'bold 48px "Noto Serif SC", serif'
  ctx.textAlign = 'center'
  ctx.shadowColor = 'rgba(201,169,110,0.2)'
  ctx.shadowBlur = 16
  ctx.fillText('灵 境', WIDTH / 2, y)
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0

  y += 44
  ctx.fillStyle = 'rgba(255,255,255,0.55)'
  ctx.font = '20px "PingFang SC", "Noto Sans SC", sans-serif'
  ctx.fillText('解锁灵境，让心事皆有回响', WIDTH / 2, y)

  // 分隔线
  y += 30
  drawGoldDivider(ctx, y)

  // ===== 4. 问题 =====
  y += 50
  ctx.fillStyle = 'rgba(255,255,255,0.3)'
  ctx.font = '17px "PingFang SC", sans-serif'
  ctx.fillText('关于', WIDTH / 2, y)

  y += 36
  ctx.fillStyle = 'rgba(255,255,255,0.88)'
  ctx.font = '24px "Noto Serif SC", serif'
  const qText = question && question.length > 22
    ? question.slice(0, 22) + '…'
    : (question || '')
  ctx.fillText('「' + qText + '」', WIDTH / 2, y)

  // ========================================
  // ===== 5. 三张牌 =====
  // ========================================
  y += 62
  const cardWidth = 130
  const cardHeight = 195
  const cardGap = 36
  const totalCardsWidth = cardWidth * 3 + cardGap * 2
  const cardStartX = (WIDTH - totalCardsWidth) / 2

  for (let i = 0; i < 3; i++) {
    const cx = cardStartX + i * (cardWidth + cardGap)
    const card = cards?.[i]
    const img = cardImages[i]
    const isReversed = card?.isReversed

    // 金色光晕底
    ctx.save()
    roundRect(ctx, cx - 4, y - 4, cardWidth + 8, cardHeight + 8, 14)
    ctx.fillStyle = 'rgba(201,169,110,0.06)'
    ctx.shadowColor = 'rgba(201,169,110,0.45)'
    ctx.shadowBlur = 28
    ctx.fill()
    ctx.fill()
    ctx.restore()

    if (img) {
      // 圆角裁剪 + 绘制牌面
      ctx.save()
      roundRect(ctx, cx, y, cardWidth, cardHeight, 10)
      ctx.clip()

      if (isReversed) {
        ctx.translate(cx + cardWidth / 2, y + cardHeight / 2)
        ctx.rotate(Math.PI)
        ctx.drawImage(img, -cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight)
      } else {
        ctx.drawImage(img, cx, y, cardWidth, cardHeight)
      }
      ctx.restore()

      // 金色边框
      ctx.strokeStyle = 'rgba(201,169,110,0.45)'
      ctx.lineWidth = 2
      roundRect(ctx, cx, y, cardWidth, cardHeight, 10)
      ctx.stroke()

      // 逆位标签
      if (isReversed) {
        const tagW = 40
        const tagH = 22
        const tagX = cx + cardWidth - tagW - 6
        const tagY = y + 6
        roundRect(ctx, tagX, tagY, tagW, tagH, 11)
        ctx.fillStyle = 'rgba(201,169,110,0.2)'
        ctx.fill()
        ctx.strokeStyle = 'rgba(201,169,110,0.5)'
        ctx.lineWidth = 1
        ctx.stroke()
        ctx.fillStyle = '#c9a96e'
        ctx.font = '12px "PingFang SC", sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('逆位', tagX + tagW / 2, tagY + tagH / 2 + 4)
      }
    } else {
      // 兜底：渐变矩形 + 牌名
      roundRect(ctx, cx, y, cardWidth, cardHeight, 10)
      const cardGrad = ctx.createLinearGradient(cx, y, cx + cardWidth, y + cardHeight)
      cardGrad.addColorStop(0, '#1e1050')
      cardGrad.addColorStop(1, '#0d1b3e')
      ctx.fillStyle = cardGrad
      ctx.fill()

      ctx.strokeStyle = 'rgba(201,169,110,0.35)'
      ctx.lineWidth = 2
      ctx.stroke()

      ctx.fillStyle = '#c9a96e'
      ctx.font = 'bold 16px "Noto Serif SC", serif'
      ctx.textAlign = 'center'
      ctx.fillText(card?.name || '?', cx + cardWidth / 2, y + cardHeight / 2)

      if (isReversed) {
        ctx.fillStyle = 'rgba(201,169,110,0.7)'
        ctx.font = '13px "PingFang SC", sans-serif'
        ctx.fillText('逆位', cx + cardWidth / 2, y + cardHeight / 2 + 24)
      }
    }

    // 位置标签（纯文字，无 emoji）
    const posKey = card?.position || (i === 0 ? 'past' : i === 1 ? 'present' : 'future')
    ctx.fillStyle = 'rgba(201,169,110,0.7)'
    ctx.font = '15px "PingFang SC", sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(POS_LABEL[posKey] || posKey, cx + cardWidth / 2, y + cardHeight + 28)

    // 牌名（逆位加「逆」）
    const cardName = (card?.name || '') + (isReversed ? '逆' : '')
    if (cardName) {
      ctx.fillStyle = '#ffffff'
      ctx.font = '14px "Noto Serif SC", serif'
      ctx.fillText(cardName, cx + cardWidth / 2, y + cardHeight + 48)
    }
  }

  // ========================================
  // ===== 6. 关键词脉络 =====
  // ========================================
  y += cardHeight + 80
  const keywords = (cards || []).map((c) => c?.keyword).filter(Boolean)
  if (keywords.length > 0) {
    const keywordText = keywords.join(' · ')
    ctx.fillStyle = 'rgba(201,169,110,0.6)'
    ctx.font = '13px "PingFang SC", sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(keywordText, WIDTH / 2, y)
    y += 28
  }

  // ========================================
  // ===== 7. 金句（shareQuote）=====
  // ========================================
  if (shareQuote) {
    y += 16
    drawGoldDivider(ctx, y)
    y += 36
    ctx.fillStyle = '#F1DCA0'
    ctx.font = '18px/1.85 "Noto Serif SC", serif'
    ctx.textAlign = 'center'
    const quoteLines = wrapText(ctx, shareQuote, WIDTH - PADDING * 3)
    for (const line of quoteLines) {
      if (y > HEIGHT - 280) break
      ctx.fillText(line, WIDTH / 2, y)
      y += 34
    }
  }

  // ========================================
  // ===== 8. 浓缩叙事（shareNarrative）=====
  // ========================================
  if (shareNarrative) {
    y += 12
    ctx.fillStyle = 'rgba(255,255,255,0.72)'
    ctx.font = '14px/2.0 "PingFang SC", sans-serif'
    ctx.textAlign = 'center'
    const narrativeLines = wrapText(ctx, shareNarrative, WIDTH - PADDING * 2.5)
    for (const line of narrativeLines) {
      if (y > HEIGHT - 230) break
      ctx.fillText(line, WIDTH / 2, y)
      y += 28
    }
  }

  // ========================================
  // ===== 9. 底部：分隔线 + 水印 + 二维码 =====
  // ========================================
  const footerStartY = Math.max(y + 30, HEIGHT - 200)

  // 底部渐变遮罩
  const footerGrad = ctx.createLinearGradient(0, footerStartY - 60, 0, HEIGHT)
  footerGrad.addColorStop(0, 'rgba(13,2,33,0)')
  footerGrad.addColorStop(0.6, 'rgba(13,2,33,0.85)')
  ctx.fillStyle = footerGrad
  ctx.fillRect(0, footerStartY - 60, WIDTH, HEIGHT - footerStartY + 60)

  // 分隔线
  const dividerY = footerStartY + 15
  drawGoldDivider(ctx, dividerY)

  // 左侧：水印「灵境」
  ctx.fillStyle = '#c9a96e'
  ctx.font = 'bold 40px "Noto Serif SC", serif'
  ctx.textAlign = 'left'
  ctx.shadowColor = 'rgba(201,169,110,0.15)'
  ctx.shadowBlur = 12
  ctx.fillText('灵 境', PADDING, dividerY + 60)
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0

  ctx.fillStyle = 'rgba(255,255,255,0.35)'
  ctx.font = '14px "PingFang SC", sans-serif'
  ctx.fillText('让心事皆有回响', PADDING, dividerY + 86)

  // 右侧：二维码
  if (qrImage) {
    const qrSize = 78
    const qrX = WIDTH - PADDING - qrSize
    const qrY = dividerY + 12

    // 白色背景
    ctx.fillStyle = '#f3eede'
    roundRect(ctx, qrX - 5, qrY - 5, qrSize + 10, qrSize + 10, 6)
    ctx.fill()

    ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize)

    // 二维码下方文字
    ctx.fillStyle = 'rgba(201,169,110,0.55)'
    ctx.font = '10px "PingFang SC", sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('扫码 · 抽你的牌', qrX + qrSize / 2, qrY + qrSize + 18)
  }

  return canvas
}

/**
 * Canvas → PNG Data URL
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
