/**
 * AI 响应解析器 —— P3-5 v0.6
 *
 * 处理三种格式：
 * 1. 纯 JSON（新版 AI 直接返回）→ 直接解析
 * 2. Markdown 代码块包裹的 JSON → 提取后解析
 * 3. 旧版【标题】格式纯文本（历史记录）→ 降级为结构化数据
 *
 * 输出统一为：
 * {
 *   narrative: string,
 *   cards: [{ position, name, reversed, keyword, reading }],
 *   actions: [{ title, sourceCard, body }],
 * }
 */

// ===== 旧版文本章节正则 =====
const SECTION_PATTERN = /(【[^】]+】)/g

function cleanContent(text) {
  if (!text) return ''
  return text
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^[-*_]{3,}\s*$/gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/**
 * 从旧版【标题】格式文本中提取结构化数据
 */
function parseLegacyText(rawText, cards) {
  const cleaned = cleanContent(rawText)
  const parts = cleaned.split(SECTION_PATTERN).filter(Boolean)

  const sections = []
  let currentTitle = null
  let currentContent = ''

  for (const part of parts) {
    if (SECTION_PATTERN.test(part)) {
      if (currentContent.trim()) {
        sections.push({ title: currentTitle, content: cleanContent(currentContent) })
      }
      currentTitle = part.replace(/【|】/g, '')
      currentContent = ''
    } else {
      currentContent += part
    }
  }
  if (currentContent.trim()) {
    sections.push({ title: currentTitle, content: cleanContent(currentContent) })
  }

  // 提取各模块
  const narrativeSection = sections.find((s) => s.title?.includes('整体叙事'))
  const pastSection = sections.find((s) => s.title?.includes('过去'))
  const presentSection = sections.find((s) => s.title?.includes('现在'))
  const futureSection = sections.find((s) => s.title?.includes('未来'))
  const actionSection = sections.find((s) => s.title?.includes('行动建议'))

  // 构建 cards 结构（匹配外部传入的 cards 信息）
  const getCardInfo = (section, posKey) => {
    const matched = cards?.find((c) => {
      if (!section) return false
      return section.title?.includes(c.name) || c.position?.key === posKey
    })
    return {
      position: posKey,
      name: matched?.name || section?.title?.split('·')[1]?.trim() || '',
      reversed: matched?.isReversed || false,
      keyword: null, // 旧版没有 keyword
      reading: section?.content || '',
    }
  }

  // 解析行动建议
  let actionItems = []
  if (actionSection?.content) {
    const ac = cleanContent(actionSection.content)
    const blocks = ac.split(/\n\n+/).filter((b) => b.trim())
    if (blocks.length >= 2) {
      actionItems = blocks.map((b) => ({ title: b.trim(), sourceCard: null, body: '' }))
    } else {
      actionItems = ac
        .split('\n')
        .filter((l) => l.trim())
        .map((l) => ({ title: l.trim(), sourceCard: null, body: '' }))
    }
  }

  return {
    narrative: narrativeSection?.content || '',
    cards: [
      getCardInfo(pastSection, 'past'),
      getCardInfo(presentSection, 'present'),
      getCardInfo(futureSection, 'future'),
    ],
    actions: actionItems,
    shareQuote: null, // 旧版无此字段，触发降级
    shareNarrative: null,
  }
}

/**
 * 标准化 JSON 响应，补全缺失字段
 */
function normalizeJsonResponse(json, externalCards) {
  const cards = (json.cards || []).map((c, i) => ({
    position: c.position || (i === 0 ? 'past' : i === 1 ? 'present' : 'future'),
    name: c.name || externalCards?.[i]?.name || '',
    reversed: c.reversed ?? externalCards?.[i]?.isReversed ?? false,
    keyword: c.keyword || null,
    reading: c.reading || '',
  }))

  // 确保 3 张牌的位置正确
  const posOrder = ['past', 'present', 'future']
  const orderedCards = posOrder.map((pos) => {
    const found = cards.find((c) => c.position === pos)
    return found || { position: pos, name: '', reversed: false, keyword: null, reading: '' }
  })

  const actions = (json.actions || []).map((a) => ({
    title: a.title || (typeof a === 'string' ? a : ''),
    sourceCard: a.sourceCard || null,
    body: a.body || '',
  }))

  return {
    narrative: json.narrative || '',
    cards: orderedCards,
    actions,
    shareQuote: json.shareQuote || null,
    shareNarrative: json.shareNarrative || null,
  }
}

/**
 * 主入口：解析 AI 响应为结构化数据
 *
 * @param {string} rawText - AI 返回的原始文本
 * @param {Array} cards - 三张牌数据（用于旧版文本降级时匹配牌名）
 * @returns {{ narrative, cards, actions }}
 */
export function parseReadingResponse(rawText, cards = []) {
  if (!rawText) {
    return { narrative: '', cards: [], actions: [] }
  }

  // 1) 尝试直接 JSON 解析
  try {
    const json = JSON.parse(rawText)
    return normalizeJsonResponse(json, cards)
  } catch {
    // 继续尝试
  }

  // 2) 尝试从 markdown 代码块中提取 JSON
  const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (jsonMatch) {
    try {
      const json = JSON.parse(jsonMatch[1])
      return normalizeJsonResponse(json, cards)
    } catch {
      // 继续尝试
    }
  }

  // 3) 降级：按旧版【标题】格式解析
  return parseLegacyText(rawText, cards)
}

/**
 * 将结构化数据还原为可渲染的纯文本（兼容旧接口）
 * 用于 saveReading 存储原始文本版本
 */
export function structuredToRawText(data) {
  if (!data) return ''
  const parts = []

  if (data.narrative) {
    parts.push(`【整体叙事】\n${data.narrative}`)
  }

  const posLabel = { past: '过去', present: '现在', future: '未来' }
  for (const card of data.cards || []) {
    if (card.reading) {
      const label = posLabel[card.position] || card.position
      const name = card.name || ''
      parts.push(`【${label} · ${name}】\n${card.reading}`)
    }
  }

  if (data.actions?.length) {
    const actionText = data.actions
      .map((a) => (a.body ? `${a.title}\n${a.body}` : a.title))
      .join('\n\n')
    parts.push(`【行动建议】\n${actionText}`)
  }

  return parts.join('\n\n')
}
