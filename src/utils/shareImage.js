/**
 * Canvas 分享卡片生成 —— P0-12 重写
 *
 * 尺寸：750×1334（3:4 竖版，适合微信/朋友圈/小红书）
 *
 * 改动：
 * - 真实韦特塔罗牌面图片（异步加载，非文字占位）
 * - 新标语"解锁灵境，让心事都有回响"
 * - 精选片段智能提取：优先【整体叙事】→ 情感关键词打分 → 问题关键词加权
 * - 移除虚假二维码占位，品牌收尾干净利落
 * - 壁纸级视觉：星云光斑 + 金色光晕牌面 + 渐变遮罩
 */

const WIDTH = 750
const HEIGHT = 1334
const PADDING = 48

// ===== 情感关键词（精选片段打分用）=====
const EMOTION_KEYWORDS = [
  '内心', '感受', '情感', '渴望', '迷茫', '焦虑', '期待',
  '爱', '孤独', '勇气', '恐惧', '希望', '成长', '改变',
  '放下', '面对', '选择', '答案', '方向', '未来', '过去',
  '自己', '他人', '关系', '工作', '生活', '梦想', '坚持',
  '治愈', '疗愈', '自由', '力量', '相信', '接纳', '放手',
  '沉默', '等待', '答案', '真正', '其实', '有时候',
]

const FILLER_WORDS = ['让我们', '接下来', '首先', '最后', '综上所述', '请注意', '开始解读', '亲爱的']

// ===== 星空背景 + 星云光斑 =====
function drawStarryBackground(ctx) {
  // 深紫渐变
  const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT)
  gradient.addColorStop(0, '#1a0a2e')
  gradient.addColorStop(0.4, '#150830')
  gradient.addColorStop(1, '#0d0221')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, WIDTH, HEIGHT)

  // 星云光斑（大尺寸径向渐变，微弱彩色）
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

    // 稍亮的星加光晕
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

// ===== 异步加载牌面图片 =====
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

// ===== 从问题中提取关键词 =====
function extractQuestionKeywords(question) {
  if (!question) return []
  // 简单分词：取2字及以上的片段
  const words = []
  // 去掉常见停用词
  const cleaned = question.replace(/[？?！!。，,、\s]/g, '')
  for (let i = 0; i < cleaned.length - 1; i++) {
    const word = cleaned.slice(i, i + 2)
    if (!['什么', '怎么', '为什么', '是不是', '有没有', '能不能', '可以', '还是'].includes(word)) {
      words.push(word)
    }
  }
  return [...new Set(words)]
}

// ===== 句子打分 =====
function scoreSentence(sentence, questionKeywords) {
  let score = 0

  // 长度适中（15-60 字最适合引用）
  const len = sentence.length
  if (len >= 15 && len <= 60) score += 4
  else if (len >= 10 && len <= 80) score += 1
  else if (len < 6) score -= 3

  // 情感关键词匹配
  for (const kw of EMOTION_KEYWORDS) {
    if (sentence.includes(kw)) score += 2
  }

  // 问题关键词匹配（额外加权——让用户觉得"说的是我"）
  if (questionKeywords) {
    for (const kw of questionKeywords) {
      if (sentence.includes(kw)) score += 3
    }
  }

  // 过渡句/客套话扣分
  for (const fw of FILLER_WORDS) {
    if (sentence.includes(fw)) score -= 6
  }

  // 有引号/括号/问号的句子不适合引用，轻微扣分
  if (sentence.includes('【') || sentence.includes('】')) score -= 4

  return score
}

// ===== 智能提取精选片段 =====
function extractHighlights(readingText, question) {
  if (!readingText) return ['牌面已揭示你的答案…']

  const questionKeywords = extractQuestionKeywords(question)

  // 1) 优先从【整体叙事】提取
  const narrativeMatch = readingText.match(/【整体叙事】([\s\S]*?)(?=【|$)/)

  // 2) 如果没有整体叙事，尝试从三张牌各取一句
  const sourceText = narrativeMatch ? narrativeMatch[1] : readingText

  // 3) 拆分为句子
  const sentences = sourceText
    .replace(/\n+/g, '。')
    .replace(/\*\*/g, '')
    .replace(/#{1,6}\s*/g, '')
    .split(/[。！？；]/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 6)

  // 4) 打分排序
  const scored = sentences
    .map((text) => ({ text, score: scoreSentence(text, questionKeywords) }))
    .sort((a, b) => b.score - a.score)

  // 5) 去重（相似度 > 80% 的只保留高分那条）
  const deduped = []
  for (const item of scored) {
    const isDuplicate = deduped.some(
      (d) => similarity(d.text, item.text) > 0.7
    )
    if (!isDuplicate) deduped.push(item)
  }

  // 6) 取前 3 句，只要分数 > 0 的
  const highlights = deduped
    .filter((s) => s.score > 0)
    .slice(0, 3)
    .map((s) => s.text)

  if (highlights.length === 0) {
    // 兜底：取 readingText 前 60 字
    const fallback = readingText.replace(/[【】#*\n]/g, '').slice(0, 60).trim()
    return fallback ? [fallback] : ['牌面已揭示你的答案…']
  }

  return highlights
}

// ===== 简单字符串相似度（去重用）=====
function similarity(a, b) {
  if (!a || !b) return 0
  const shorter = a.length < b.length ? a : b
  const longer = a.length < b.length ? b : a
  let matches = 0
  for (let i = 0; i < shorter.length - 1; i++) {
    const bigram = shorter.slice(i, i + 2)
    if (longer.includes(bigram)) matches++
  }
  return matches / (shorter.length - 1)
}

// ===== 绘制金色渐变分隔线 =====
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

/**
 * 生成分享卡片 Canvas（异步——需要加载牌面图片）
 * @param {object} data - { question, cards, reading }
 * @returns {Promise<HTMLCanvasElement>}
 */
export async function generateShareCanvas({ question, cards, reading }) {
  const canvas = document.createElement('canvas')
  canvas.width = WIDTH
  canvas.height = HEIGHT
  const ctx = canvas.getContext('2d')

  // ===== 1. 星空背景 =====
  drawStarryBackground(ctx)

  // ===== 2. 加载牌面图片 =====
  const cardImages = cards ? await loadCardImages(cards) : [null, null, null]

  // ========================================
  // ===== 3. 头部品牌区 =====
  // ========================================
  let y = 85

  ctx.fillStyle = '#c9a96e'
  ctx.font = 'bold 48px "Noto Serif SC", serif'
  ctx.textAlign = 'center'
  ctx.shadowColor = 'rgba(201,169,110,0.2)'
  ctx.shadowBlur = 16
  ctx.fillText('灵 境', WIDTH / 2, y)
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0

  y += 46
  ctx.fillStyle = 'rgba(255,255,255,0.55)'
  ctx.font = '20px "PingFang SC", "Noto Sans SC", sans-serif'
  ctx.fillText('解锁灵境，让心事都有回响', WIDTH / 2, y)

  // 分隔线
  y += 32
  drawGoldDivider(ctx, y)

  // ===== 4. 问题 =====
  y += 52
  ctx.fillStyle = 'rgba(255,255,255,0.3)'
  ctx.font = '17px "PingFang SC", sans-serif'
  ctx.fillText('关于', WIDTH / 2, y)

  y += 36
  ctx.fillStyle = 'rgba(255,255,255,0.88)'
  ctx.font = '24px "Noto Serif SC", serif'
  const qText = question && question.length > 22
    ? question.slice(0, 22) + '…'
    : (question || '')
  ctx.fillText(`「${qText}」`, WIDTH / 2, y)

  // ========================================
  // ===== 5. 三张真实牌面 =====
  // ========================================
  y += 65
  const cardWidth = 130
  const cardHeight = 195
  const cardGap = 36
  const totalCardsWidth = cardWidth * 3 + cardGap * 2
  const cardStartX = (WIDTH - totalCardsWidth) / 2

  const posLabels = ['过去', '现在', '未来']
  const posEmojis = ['🌙', '✨', '🌟']

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
        // 逆位：旋转 180°
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

      // 逆位标签（金色胶囊，牌面右上角）
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

    // 位置标签
    ctx.fillStyle = 'rgba(255,255,255,0.55)'
    ctx.font = '17px "PingFang SC", sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(`${posEmojis[i]} ${posLabels[i]}`, cx + cardWidth / 2, y + cardHeight + 32)
  }

  // ========================================
  // ===== 6. 精选解读片段 =====
  // ========================================
  y += cardHeight + 72
  const highlights = extractHighlights(reading, question)

  drawGoldDivider(ctx, y)

  y += 42
  ctx.fillStyle = 'rgba(255,255,255,0.45)'
  ctx.font = '17px "PingFang SC", sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('牌面这样说', WIDTH / 2, y)

  y += 42
  ctx.fillStyle = 'rgba(255,255,255,0.82)'
  ctx.font = '22px/1.75 "Noto Serif SC", serif'
  ctx.textAlign = 'center'

  for (const highlight of highlights) {
    const quoteText = `"${highlight}"`
    const lines = wrapText(ctx, quoteText, WIDTH - PADDING * 3.5)
    for (const line of lines) {
      if (y > HEIGHT - 250) break
      ctx.fillText(line, WIDTH / 2, y)
      y += 35
    }
    y += 12
  }

  // ========================================
  // ===== 7. 品牌底部 =====
  // ========================================
  const footerStartY = Math.max(y + 30, HEIGHT - 190)

  // 底部渐变遮罩（让底部文字更清晰）
  const footerGrad = ctx.createLinearGradient(0, footerStartY - 60, 0, HEIGHT)
  footerGrad.addColorStop(0, 'rgba(13,2,33,0)')
  footerGrad.addColorStop(0.6, 'rgba(13,2,33,0.85)')
  ctx.fillStyle = footerGrad
  ctx.fillRect(0, footerStartY - 60, WIDTH, HEIGHT - footerStartY + 60)

  // 分隔线
  const dividerY = footerStartY + 15
  drawGoldDivider(ctx, dividerY)

  // 品牌名
  ctx.fillStyle = '#c9a96e'
  ctx.font = 'bold 40px "Noto Serif SC", serif'
  ctx.textAlign = 'center'
  ctx.shadowColor = 'rgba(201,169,110,0.15)'
  ctx.shadowBlur = 12
  ctx.fillText('灵 境', WIDTH / 2, dividerY + 60)
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0

  // 标语
  ctx.fillStyle = 'rgba(255,255,255,0.4)'
  ctx.font = '18px "PingFang SC", sans-serif'
  ctx.fillText('解锁灵境，让心事都有回响', WIDTH / 2, dividerY + 96)

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
