import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * 解读文字逐段显示动画
 * 把 AI 返回的完整解读按段落拆分，逐段淡入
 *
 * Props:
 * - rawText: string — AI 返回的原始文本
 * - speed: number — 每段间隔（ms），默认 800
 */

// 分段规则：按【xxx】标记拆分
const SECTION_PATTERN = /(【[^】]+】)/g

function parseSections(rawText) {
  if (!rawText) return []

  // 按标题分割，保留标题
  const parts = rawText.split(SECTION_PATTERN).filter(Boolean)

  const sections = []
  let currentTitle = null
  let currentContent = ''

  for (const part of parts) {
    if (SECTION_PATTERN.test(part)) {
      // 遇到新标题：先保存上一段
      if (currentContent.trim()) {
        sections.push({ title: currentTitle, content: currentContent.trim() })
      }
      currentTitle = part.replace(/【|】/g, '')
      currentContent = ''
    } else {
      currentContent += part
    }
  }

  // 最后一段
  if (currentContent.trim()) {
    sections.push({ title: currentTitle, content: currentContent.trim() })
  }

  return sections
}

export default function ReadingText({ rawText = '', speed = 800 }) {
  const sections = useMemo(() => parseSections(rawText), [rawText])
  const [visibleCount, setVisibleCount] = useState(0)

  useEffect(() => {
    if (sections.length === 0) return

    // 重置
    setVisibleCount(0)

    // 第一段立即显示
    const showFirst = setTimeout(() => setVisibleCount(1), 100)

    // 后续段落逐段显示
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
    <div className="flex flex-col gap-6">
      <AnimatePresence>
        {sections.slice(0, visibleCount).map((section, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="flex flex-col gap-2"
          >
            {/* 段落标题 */}
            {section.title && (
              <h3 className="text-brand-gold text-lg font-serif font-semibold">
                {section.title}
              </h3>
            )}

            {/* 段落内容 */}
            <div className="text-white/85 text-body leading-relaxed whitespace-pre-line">
              {section.content}
            </div>

            {/* 分隔线（非最后一段） */}
            {i < visibleCount - 1 && (
              <div
                className="h-px mt-2"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.2), transparent)',
                }}
              />
            )}
          </motion.div>
        ))}
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
