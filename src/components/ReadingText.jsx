import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import TarotCard from './TarotCard'

/**
 * 解读文字逐段显示动画 —— P0-10 重写
 *
 * 三大内容模块各用磨砂玻璃容器：
 * 1. 整体叙事 —— ✨ 灵境总览 · 整体叙事
 * 2. 单牌解读 ×3 —— 图文并茂 + 金色光晕牌面 + 引导语
 * 3. 行动建议 —— 💫 条目式 stagger 入场
 *
 * Props:
 * - rawText: string — AI 返回的原始文本
 * - cards: Array | null — 三张牌数据
 * - speed: number — 保留兼容，P0-10 使用固定节奏
 * - onCardClick: (card) => void — 卡牌点击放大回调
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

// ===== 解析 AI 返回文本为段落数组 =====
function parseSections(rawText) {
  if (!rawText) return []

  const parts = rawText.split(SECTION_PATTERN).filter(Boolean)
  const sections = []
  let currentTitle = null
  let currentContent = ''

  for (const part of parts) {
    if (SECTION_PATTERN.test(part)) {
      if (currentContent.trim()) {
        sections.push({ title: currentTitle, content: currentContent.trim() })
      }
      currentTitle = part.replace(/【|】/g, '')
      currentContent = ''
    } else {
      currentContent += part
    }
  }

  if (currentContent.trim()) {
    sections.push({ title: currentTitle, content: currentContent.trim() })
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
  // 按空行或数字+点+空格开头拆分
  const lines = content.split(/\n\n+/)
  if (lines.length >= 2) {
    return lines.filter((l) => l.trim())
  }
  // 兜底：按单行拆分
  return content
    .split('\n')
    .filter((l) => l.trim())
}

export default function ReadingText({ rawText = '', cards = null, speed, onCardClick }) {
  const sections = useMemo(() => parseSections(rawText), [rawText])
  const [visibleCount, setVisibleCount] = useState(0)

  // ===== 分段动画节奏：叙事 → 过去 → 现在 → 未来 → 行动 =====
  useEffect(() => {
    if (sections.length === 0) return
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
  }, [rawText, sections.length])

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
            {/* ===== 磨砂玻璃容器 ===== */}
            <motion.div
              className="rounded-card px-4 py-4"
              style={{
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: `1px solid ${config.borderColor}`,
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.02)',
              }}
            >
              {/* ===== 标题行 ===== */}
              <div className="flex flex-col gap-2 mb-3">
                <h3 className="text-brand-gold text-base font-serif font-semibold flex items-center gap-1.5 flex-wrap">
                  <span className="inline-block">{emoji}</span>
                  <span>{displayTitle}</span>
                  {card?.isReversed && (
                    <span
                      className="text-xs font-normal px-2 py-0.5 rounded-full inline-flex items-center"
                      style={{
                        border: '1px solid rgba(201,169,110,0.4)',
                        color: 'rgba(201,169,110,0.8)',
                        background: 'rgba(201,169,110,0.08)',
                        fontFamily: 'PingFang SC, Noto Sans SC, sans-serif',
                      }}
                    >
                      逆位
                    </span>
                  )}
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

              {/* ===== 内容区 ===== */}
              {card ? (
                /* --- 单牌解读：图文并茂 --- */
                <div className="flex gap-3">
                  {/* 左侧牌面：金色光晕 + 悬浮 */}
                  <motion.div
                    className="flex-shrink-0 cursor-pointer"
                    animate={{ y: [0, -4, 0] }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    style={{
                      borderRadius: 12,
                      boxShadow:
                        '0 0 16px rgba(201,169,110,0.2), 0 0 40px rgba(201,169,110,0.08)',
                    }}
                    onClick={() => onCardClick?.(card)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <TarotCard card={card} size="md" />
                  </motion.div>

                  {/* 右侧文字 */}
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-white/85 text-body leading-relaxed whitespace-pre-line"
                      dangerouslySetInnerHTML={{
                        __html: highlightCardNames(displayContent, cards),
                      }}
                    />
                  </div>
                </div>
              ) : type === 'action' && actionItems && actionItems.length >= 2 ? (
                /* --- 行动建议：条目式 stagger --- */
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
                      <span className="text-white/85 text-body leading-relaxed whitespace-pre-line">
                        {item.trim()}
                      </span>
                    </motion.div>
                  ))}
                </div>
              ) : (
                /* --- 整体叙事 / 纯文字 --- */
                <p
                  className="text-white/85 text-body leading-relaxed whitespace-pre-line"
                  dangerouslySetInnerHTML={{
                    __html: highlightCardNames(displayContent, cards),
                  }}
                />
              )}
            </motion.div>

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
