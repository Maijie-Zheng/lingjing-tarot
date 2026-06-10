import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import TarotCard from './TarotCard'

/**
 * 解读文字逐段显示动画 —— P0-10 重写
 *
 * 内容模块：
 * 1. 整体叙事 —— ✨ 灵境总览 · 整体叙事（磨砂玻璃容器）
 * 2. 单牌解读 ×3 —— 图文并茂 + 金色光晕牌面（无容器，清爽布局）
 * 3. 行动建议 —— 💫 条目式 stagger 入场（磨砂玻璃容器）
 *
 * Props:
 * - rawText: string — AI 返回的原始文本
 * - cards: Array | null — 三张牌数据
 * - speed: number — 保留兼容，P0-10 使用固定节奏
 */

const SECTION_PATTERN = /(【[^】]+】)/g

// ===== 段落类型判断 =====
function getSectionType(title) {
  if (!title) return 'unknown'
  if (title.includes('整体叙事')) return 'narrative'
  if (title.includes('行动建议')) return 'action'
  if (title.includes('过去')) return 'past'
  if (title.includes('现在')) return 'present'
  if (title.includes('未来')) return 'future'
  return 'unknown'
}

// ===== 段落视觉配置 =====
const SECTION_CONFIG = {
  narrative: {
    icon: '✨',
    titleOverride: '灵境总览 · 整体叙事',
    borderColor: 'rgba(255,255,255,0.06)',
  },
  past: {
    icon: '🌙',
    titleOverride: null,
    borderColor: 'rgba(201,169,110,0.1)',
  },
  present: {
    icon: '✨',
    titleOverride: null,
    borderColor: 'rgba(201,169,110,0.1)',
  },
  future: {
    icon: '🌟',
    titleOverride: null,
    borderColor: 'rgba(201,169,110,0.1)',
  },
  action: {
    icon: '💫',
    titleOverride: '行动建议',
    borderColor: 'rgba(255,255,255,0.06)',
  },
  unknown: {
    icon: '🔮',
    titleOverride: null,
    borderColor: 'rgba(255,255,255,0.06)',
  },
}

// ===== 叙事引导语 =====
const INTRO_PREFIX = {
  past: (name) => `回顾过去，${name}揭示了一段重要的信息——`,
  present: (name) => `聚焦当下，${name}映照出你此刻的内心状态——`,
  future: (name) => `展望未来，${name}指向一种可能的趋势——`,
}

// ===== 清洗 Markdown 符号（AI 可能混入 #、---、** 等）=====
function cleanContent(text) {
  if (!text) return ''
  return text
    // 移除 markdown 标题标记（行首的 #，可能混在正文中）
    .replace(/^#{1,6}\s+/gm, '')
    // 移除分割线 --- 或 ***
    .replace(/^[-*_]{3,}\s*$/gm, '')
    // 移除粗体 **text** 标记（保留内部文字）
    .replace(/\*\*(.+?)\*\*/g, '$1')
    // 移除斜体 *text* 标记
    .replace(/\*(.+?)\*/g, '$1')
    // 移除多余空行（3+ → 2）
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

// ===== 解析 AI 返回文本为段落数组 =====
function parseSections(rawText) {
  if (!rawText) return []

  // 先清洗全文的 markdown 符号
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

  return sections
}

// ===== 段落标题匹配对应牌 =====
function matchCard(title, cards) {
  if (!cards || !title) return null
  return (
    cards.find((card) => {
      const cardName = card.name
      const posLabel = card.position?.label
      return title.includes(cardName) || (posLabel && title.includes(posLabel))
    }) || null
  )
}

// ===== 正文中牌名金色高亮 =====
function highlightCardNames(text, cards) {
  if (!cards || cards.length === 0) return text
  let result = text
  // 按牌名长度降序排列，避免短牌名误匹配长牌名
  const sortedCards = [...cards].sort((a, b) => b.name.length - a.name.length)
  sortedCards.forEach((card) => {
    const name = card.name
    // 只在牌名作为独立词出现时高亮（前后不是中文字符）
    const regex = new RegExp(`(?<![\\w])(${escapeRegex(name)})(?![\\w])`, 'g')
    result = result.replace(
      regex,
      '<span class="text-brand-gold font-medium">$1</span>'
    )
  })
  return result
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// ===== 解析行动建议为独立条目 =====
function parseActionItems(content) {
  if (!content) return []

  // 先清洗 markdown 残留
  const cleaned = cleanContent(content)

  // 1) 按双空行拆分（最自然的段落分隔）
  const blocks = cleaned.split(/\n\n+/).filter((b) => b.trim())
  if (blocks.length >= 2) {
    return blocks.map((b) => b.trim())
  }

  // 2) 如果只有一个 block，尝试按数字编号拆分："1. "、"2. "、"3. "
  const numbered = cleaned.split(/\n(?=\d+[\.\、\)]\s)/)
  if (numbered.length >= 2) {
    return numbered.map((b) => b.trim())
  }

  // 3) 兜底：按单行拆分
  return cleaned
    .split('\n')
    .filter((l) => l.trim())
    .map((l) => l.trim())
}

export default function ReadingText({ rawText = '', cards = null, speed }) {
  const sections = useMemo(() => parseSections(rawText), [rawText])
  const [visibleCount, setVisibleCount] = useState(0)

  // ===== 分段动画节奏：叙事 → 过去 → 现在 → 未来 → 行动 =====
  useEffect(() => {
    if (sections.length === 0) return

    // speed=0：一次性全部显示，不分段（历史记录回看用）
    if (speed === 0) {
      setVisibleCount(sections.length)
      return
    }

    setVisibleCount(0)

    let cumulative = 80
    const timers = []

    sections.forEach((section, i) => {
      const type = getSectionType(section.title)
      timers.push(
        setTimeout(() => setVisibleCount(i + 1), cumulative)
      )
      // 叙事和行动建议间隔较短，单牌解读间隔较长
      cumulative += type === 'narrative' || type === 'action' ? 350 : 600
    })

    return () => timers.forEach(clearTimeout)
  }, [rawText, sections.length, speed])

  if (!rawText) return null

  return (
    <div className="flex flex-col gap-6">
      {sections.slice(0, visibleCount).map((section, i) => {
        const type = getSectionType(section.title)
        const card = cards ? matchCard(section.title, cards) : null
        const config = SECTION_CONFIG[type] || SECTION_CONFIG.unknown

        // 标题
        const displayTitle = config.titleOverride || section.title
        // emoji 优先用牌面位置的，否则用配置默认的
        const emoji = card?.position?.emoji || config.icon

        // 引导语
        const introFn = INTRO_PREFIX[type]
        const introPrefix = card && introFn ? introFn(card.name) : null
        const displayContent = introPrefix
          ? `${introPrefix}\n\n${section.content}`
          : section.content

        // 行动建议拆分
        const actionItems = type === 'action' ? parseActionItems(section.content) : null

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
          >
            {/* ===== 单牌解读：卡牌居中 + 金色光晕 + 标题下置 + · 引导正文 ===== */}
            {card ? (
              <div className="flex flex-col items-center">
                {/* 卡牌居中：lg 尺寸 + 强烈三层金色光晕 + 悬浮呼吸 */}
                <motion.div
                  className="mb-5"
                  animate={{ y: [0, -6, 0] }}
                  transition={{
                    duration: 3.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <motion.div
                    animate={{
                      boxShadow: [
                        '0 0 40px rgba(201,169,110,0.35), 0 0 80px rgba(201,169,110,0.15), 0 0 140px rgba(201,169,110,0.06)',
                        '0 0 60px rgba(201,169,110,0.5), 0 0 120px rgba(201,169,110,0.25), 0 0 180px rgba(201,169,110,0.1)',
                        '0 0 40px rgba(201,169,110,0.35), 0 0 80px rgba(201,169,110,0.15), 0 0 140px rgba(201,169,110,0.06)',
                      ],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    style={{ borderRadius: 12 }}
                  >
                    <TarotCard card={card} size="lg" />
                  </motion.div>
                </motion.div>

                {/* 标题：大号金色衬线体，居中，外发光 */}
                <h3
                  className="text-brand-gold text-xl font-serif font-bold text-center mb-3"
                  style={{
                    textShadow: '0 0 20px rgba(201,169,110,0.25)',
                    letterSpacing: '0.05em',
                  }}
                >
                  {displayTitle}
                  {card.isReversed && (
                    <span
                      className="inline-block ml-2 text-xs font-normal px-2 py-0.5 rounded-full align-middle"
                      style={{
                        border: '1px solid rgba(201,169,110,0.4)',
                        color: 'rgba(201,169,110,0.8)',
                        background: 'rgba(201,169,110,0.08)',
                        fontFamily: 'PingFang SC, Noto Sans SC, sans-serif',
                        letterSpacing: 0,
                      }}
                    >
                      逆位
                    </span>
                  )}
                </h3>

                {/* 金色短分隔线 */}
                <div
                  className="h-px mb-4 mx-auto"
                  style={{
                    width: 80,
                    background:
                      'linear-gradient(90deg, transparent, rgba(201,169,110,0.35), transparent)',
                  }}
                />

                {/* 正文：· 引导，左对齐，浅金色，宽松行高 */}
                <div
                  className="w-full text-body leading-loose"
                  style={{
                    color: 'rgba(240,230,216,0.8)',
                    textShadow: '0 0 6px rgba(201,169,110,0.08)',
                  }}
                >
                  {displayContent
                    .split(/\n\n+/)
                    .filter((p) => p.trim())
                    .map((paragraph, idx) => (
                      <p key={idx} className="mb-3 flex gap-2">
                        <span
                          className="flex-shrink-0 select-none"
                          style={{ color: 'rgba(201,169,110,0.5)' }}
                        >
                          ·
                        </span>
                        <span
                          className="whitespace-pre-line"
                          dangerouslySetInnerHTML={{
                            __html: highlightCardNames(paragraph.trim(), cards),
                          }}
                        />
                      </p>
                    ))}
                </div>
              </div>
            ) : (
              /* ===== 整体叙事 / 行动建议：磨砂玻璃容器 ===== */
              <div
                className="rounded-card px-4 py-4"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  border: `1px solid ${config.borderColor}`,
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.02)',
                }}
              >
                {/* 标题行 */}
                <div className="flex flex-col gap-2 mb-3">
                  <h3 className="text-brand-gold text-base font-serif font-semibold flex items-center gap-1.5 flex-wrap">
                    <span className="inline-block">{emoji}</span>
                    <span>{displayTitle}</span>
                  </h3>
                  {/* 金色渐变分隔线 */}
                  <div
                    className="h-px"
                    style={{
                      background:
                        'linear-gradient(90deg, transparent, rgba(201,169,110,0.25), transparent)',
                    }}
                  />
                </div>

                {/* 内容 */}
                {type === 'action' && actionItems && actionItems.length >= 1 ? (
                  <div className="flex flex-col gap-3">
                    {actionItems.map((item, idx) => (
                      <motion.div
                        key={idx}
                        className="flex gap-2"
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: idx * 0.12,
                          duration: 0.35,
                          ease: 'easeOut',
                        }}
                      >
                        <span
                          className="flex-shrink-0 select-none"
                          style={{ color: 'rgba(201,169,110,0.5)' }}
                        >
                          ·
                        </span>
                        <span className="text-white/85 text-body leading-loose whitespace-pre-line">
                          {item}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p
                    className="text-white/85 text-body leading-loose whitespace-pre-line"
                    dangerouslySetInnerHTML={{
                      __html: highlightCardNames(displayContent, cards),
                    }}
                  />
                )}
              </div>
            )}

            {/* ===== 模块间分隔 ✦ ===== */}
            {i < visibleCount - 1 && (
              <div className="flex items-center justify-center mt-5">
                <motion.span
                  className="text-sm"
                  style={{ color: 'rgba(201,169,110,0.3)' }}
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  ✦
                </motion.span>
              </div>
            )}
          </motion.div>
        )
      })}

      {/* ===== 加载指示器 ===== */}
      {visibleCount > 0 && visibleCount < sections.length && (
        <div className="flex gap-1.5 justify-center mt-2">
          {[0, 0.2, 0.4].map((delay, i) => (
            <motion.span
              key={i}
              className="w-1.5 h-1.5 rounded-full inline-block"
              style={{ background: 'rgba(201,169,110,0.5)' }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity, delay }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
