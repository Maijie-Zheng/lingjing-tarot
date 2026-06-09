import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import TarotCard from './TarotCard'

/**
 * 解读文字逐段显示动画
 *
 * Props:
 * - rawText: string — AI 返回的原始文本
 * - cards: Array | null — 三张牌数据，传入后显示牌+文字配对布局
 * - speed: number — 每段间隔（ms），默认 800
 */

// 分段规则：按【xxx】标记拆分
const SECTION_PATTERN = /(【[^】]+】)/g

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

/** 根据段落标题匹配对应的牌 */
function matchCard(title, cards) {
  if (!cards || !title) return null
  return cards.find((card) => {
    const cardName = card.name
    const posLabel = card.position?.label
    // 匹配 "过去 · 愚者" 或 "过去·愚者" 格式
    return title.includes(cardName) || (posLabel && title.includes(posLabel))
  }) || null
}

export default function ReadingText({ rawText = '', cards = null, speed = 800 }) {
  const sections = useMemo(() => parseSections(rawText), [rawText])
  const [visibleCount, setVisibleCount] = useState(0)

  useEffect(() => {
    if (sections.length === 0) return

    setVisibleCount(0)

    const showFirst = setTimeout(() => setVisibleCount(1), 100)

    const timers = []
    for (let i = 1; i < sections.length; i++) {
      timers.push(
        setTimeout(() => setVisibleCount(i + 1), 100 + i * speed)
      )
    }

    return () => {
      clearTimeout(showFirst)
      timers.forEach(clearTimeout)
    }
  }, [rawText, sections.length, speed])

  if (!rawText) return null

  return (
    <div className="flex flex-col gap-5">
      <AnimatePresence>
        {sections.slice(0, visibleCount).map((section, i) => {
          const card = cards ? matchCard(section.title, cards) : null

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              {/* ===== 有匹配牌面 → 图文并茂布局 ===== */}
              {card ? (
                <div className="flex gap-3">
                  {/* 左侧牌面 */}
                  <div className="flex-shrink-0">
                    <TarotCard card={card} size="md" />
                  </div>

                  {/* 右侧文字 */}
                  <div className="flex-1 min-w-0 flex flex-col gap-2">
                    {/* 标题 */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">{card.position?.emoji}</span>
                      <h3 className="text-brand-gold text-base font-serif font-semibold">
                        {card.position?.label} · {card.name}
                      </h3>
                      {card.isReversed && (
                        <span className="text-xs text-red-400">逆位</span>
                      )}
                    </div>

                    {/* 正文 */}
                    <p className="text-white/85 text-body leading-relaxed">
                      {section.content}
                    </p>
                  </div>
                </div>
              ) : (
                /* ===== 无匹配牌面 → 全宽纯文字布局 ===== */
                <div className="flex flex-col gap-2">
                  {section.title && (
                    <h3 className="text-brand-gold text-lg font-serif font-semibold">
                      {section.title}
                    </h3>
                  )}
                  <div className="text-white/85 text-body leading-relaxed whitespace-pre-line">
                    {section.content}
                  </div>
                </div>
              )}

              {/* 分隔线（非最后一段） */}
              {i < visibleCount - 1 && (
                <div
                  className="h-px mt-4"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.2), transparent)',
                  }}
                />
              )}
            </motion.div>
          )
        })}
      </AnimatePresence>

      {/* 打字中指示器 */}
      {visibleCount < sections.length && (
        <div className="flex gap-1 mt-2">
          <motion.span
            className="w-2 h-2 rounded-full bg-brand-gold/50 inline-block"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <motion.span
            className="w-2 h-2 rounded-full bg-brand-gold/50 inline-block"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
          />
          <motion.span
            className="w-2 h-2 rounded-full bg-brand-gold/50 inline-block"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
          />
        </div>
      )}
    </div>
  )
}
