import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Moon, Sun, Route } from 'lucide-react'
import TarotCard from './TarotCard'
import GlassCard from './GlassCard'
import SectionTitle from './SectionTitle'
import Divider from './Divider'
import NarrativeThread from './NarrativeThread'
import ActionItem from './ActionItem'
import { parseReadingResponse } from '../utils/parseResponse'

/**
 * 解读文字逐段显示动画 —— P3-5 v0.6
 *
 * 内容模块：
 * 1. 整体叙事 —— GlassCard + SectionTitle(Sparkles) + Divider + NarrativeThread + 叙事正文
 * 2. 单牌解读 ×3 —— 卡牌居中 + 金色光晕 + 标题下置 + · 引导正文（保持不动）
 * 3. 行动建议 —— GlassCard + SectionTitle(Route) + Divider + ActionItem ×3
 *
 * Props:
 * - data: object | null — 新版结构化数据 { narrative, cards, actions }
 * - rawText: string — 旧版纯文本（向后兼容历史记录）
 * - cards: Array | null — 三张牌数据（用于旧版文本降级 + 牌名高亮）
 * - speed: number — 动画速度（0 = 一次性全显示）
 */

// ===== 牌名金色高亮（正文中出现的牌名用金色）=====
function highlightCardNames(text, cards) {
  if (!cards || cards.length === 0 || !text) return text
  let result = text
  const sortedCards = [...cards].sort((a, b) => b.name.length - a.name.length)
  sortedCards.forEach((card) => {
    const name = card.name
    if (!name) return
    const regex = new RegExp(`(?<![\\w])(${escapeRegex(name)})(?![\\w])`, 'g')
    result = result.replace(
      regex,
      '<span class="text-[#EAD49A] font-medium">$1</span>'
    )
  })
  return result
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// ===== 单牌标题图标映射 =====
const POS_ICON = {
  past: Moon,
  present: Sparkles,
  future: Sun,
}

const POS_LABEL = {
  past: '过去',
  present: '现在',
  future: '未来',
}

// ===== 叙事引导语 =====
const INTRO_PREFIX = {
  past: (name) => `回顾过去，${name}揭示了一段重要的信息——`,
  present: (name) => `聚焦当下，${name}映照出你此刻的内心状态——`,
  future: (name) => `展望未来，${name}指向一种可能的趋势——`,
}

export default function ReadingText({ rawText = '', data = null, cards = null, speed }) {
  // ===== 统一为结构化数据 =====
  const structured = useMemo(() => {
    if (data && data.cards?.length) return data
    if (rawText) {
      // 新版：rawText 本身就是结构化对象（从 localStorage 取出）
      if (typeof rawText === 'object' && rawText.cards) return rawText
      // 旧版：rawText 是 AI 原文文本，需解析
      if (typeof rawText === 'string') return parseReadingResponse(rawText, cards)
    }
    return null
  }, [rawText, data, cards])

  const sections = useMemo(() => {
    if (!structured) return []
    const items = []

    // 1) 整体叙事
    if (structured.narrative) {
      items.push({ type: 'narrative' })
    }

    // 2) 单牌解读 ×3
    for (const card of structured.cards || []) {
      if (card.reading) {
        items.push({ type: 'card', card })
      }
    }

    // 3) 行动建议
    if (structured.actions?.length) {
      items.push({ type: 'action' })
    }

    return items
  }, [structured])

  const [visibleCount, setVisibleCount] = useState(0)

  // ===== 分段动画节奏 =====
  useEffect(() => {
    if (sections.length === 0) return

    // speed=0：一次性全部显示
    if (speed === 0) {
      setVisibleCount(sections.length)
      return
    }

    setVisibleCount(0)

    let cumulative = 80
    const timers = []

    sections.forEach((section, i) => {
      timers.push(
        setTimeout(() => setVisibleCount(i + 1), cumulative)
      )
      cumulative += section.type === 'narrative' || section.type === 'action' ? 350 : 600
    })

    return () => timers.forEach(clearTimeout)
  }, [rawText, data, sections.length, speed])

  if (!structured || sections.length === 0) return null

  return (
    <div className="flex flex-col gap-6">
      {sections.slice(0, visibleCount).map((section, i) => {
        // ===== 整体叙事 =====
        if (section.type === 'narrative') {
          return (
            <motion.div
              key="narrative"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
            >
              <GlassCard>
                <SectionTitle icon={Sparkles}>灵境总览 · 整体叙事</SectionTitle>
                <Divider />
                <NarrativeThread cards={structured.cards} />
                <p className="mt-4 text-[14.5px] font-light leading-[2] text-white/80">
                  {structured.narrative}
                </p>
              </GlassCard>
            </motion.div>
          )
        }

        // ===== 单牌解读（保持不动）=====
        if (section.type === 'card') {
          const card = section.card
          // 合并 AI 结构化数据与原牌面数据（image / nameEn / keywords 等来自 cards 数组）
          const merged = cards?.find((c) => c.name === card.name) || {}
          const cardForRender = {
            ...card,
            nameEn: card.nameEn || merged.nameEn || '',
            image: card.image || merged.image,
            keywords: card.keywords || merged.keywords || '',
            isReversed: card.reversed,
          }
          const IconComp = POS_ICON[card.position] || Sparkles
          const introFn = INTRO_PREFIX[card.position]
          const introPrefix = card.name && introFn ? introFn(card.name) : null

          return (
            <motion.div
              key={`card-${card.position}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
            >
              <div className="flex flex-col items-center">
                {/* 卡牌居中：三层金色光晕 + 悬浮呼吸 */}
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
                    <TarotCard card={cardForRender} size="md" />
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
                  <IconComp size={20} strokeWidth={1.6} className="inline-block mr-1.5 -mt-0.5" aria-hidden />
                  {POS_LABEL[card.position] || card.position} · {card.name}
                  {card.reversed && (
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

                {/* 正文：导语句（略暗金）+ 正文段落（与整体叙事统一） */}
                <div className="w-full">
                  {/* 导语句 */}
                  {introPrefix && (
                    <p
                      className="mt-[18px] text-[13px] leading-[1.9] text-gold-200/70"
                      dangerouslySetInnerHTML={{
                        __html: highlightCardNames(introPrefix, cards || structured.cards),
                      }}
                    />
                  )}
                  {/* 正文段落 */}
                  {card.reading
                    .split(/\n\n+/)
                    .filter((p) => p.trim())
                    .map((paragraph, idx) => (
                      <p
                        key={idx}
                        className="mt-3 text-[14.5px] font-light leading-[2.0] text-white/80"
                        dangerouslySetInnerHTML={{
                          __html: highlightCardNames(paragraph.trim(), cards || structured.cards),
                        }}
                      />
                    ))}
                </div>
              </div>
            </motion.div>
          )
        }

        // ===== 行动建议 =====
        if (section.type === 'action') {
          return (
            <motion.div
              key="action"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
            >
              <GlassCard>
                <SectionTitle icon={Route}>行动建议</SectionTitle>
                <Divider />
                <div className="flex flex-col">
                  {structured.actions.map((action, idx) => (
                    <ActionItem
                      key={idx}
                      index={idx + 1}
                      title={action.title}
                      sourceCard={action.sourceCard}
                      body={action.body}
                      isLast={idx === structured.actions.length - 1}
                    />
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          )
        }

        return null
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
