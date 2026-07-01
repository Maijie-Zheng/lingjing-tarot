import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Minus } from 'lucide-react'
import { saveFeedback } from '../utils/storage'

/**
 * 解读反馈组件 —— Phase 5
 *
 * 极简设计，放在解读正文底部、操作按钮上方。
 * 不抢视觉权重——金色半透明线条，fade-in 动画。
 *
 * Props:
 * - readingId: string — 关联的解读记录 ID
 */
export default function ReadingFeedback({ readingId }) {
  const [submitted, setSubmitted] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [note, setNote] = useState('')

  const handleVote = (sentiment) => {
    saveFeedback(readingId, { sentiment, note: note.trim() || null })
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <motion.div
        className="text-center py-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-white/30 text-sm">谢谢你的反馈，愿你前行的路上常有星光 ✦</p>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="flex flex-col items-center gap-3 py-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 1.2 }}
    >
      {/* 引导文字 */}
      <p className="text-white/35 text-sm">这次解读，触动你了吗？</p>

      {/* 两个按钮 */}
      <div className="flex gap-6">
        {/* 有触动 */}
        <button
          onClick={() => handleVote('touched')}
          className="flex items-center gap-2 text-sm transition-colors"
          style={{ color: 'rgba(201,169,110,0.5)' }}
          onMouseEnter={(e) => (e.target.style.color = '#c9a96e')}
          onMouseLeave={(e) => (e.target.style.color = 'rgba(201,169,110,0.5)')}
        >
          <Heart size={18} strokeWidth={1.6} aria-hidden />
          有的
        </button>

        {/* 没感觉 */}
        <button
          onClick={() => setExpanded(true)}
          className="flex items-center gap-2 text-sm transition-colors"
          style={{ color: 'rgba(255,255,255,0.25)' }}
          onMouseEnter={(e) => (e.target.style.color = 'rgba(255,255,255,0.5)')}
          onMouseLeave={(e) => (e.target.style.color = 'rgba(255,255,255,0.25)')}
        >
          <Minus size={18} strokeWidth={1.6} aria-hidden />
          没感觉
        </button>
      </div>

      {/* 展开可选文字区域 */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            className="flex flex-col items-center gap-2 w-full max-w-xs"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="哪里没触动你？（可选）"
              rows={2}
              className="w-full resize-none rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/60 outline-none placeholder:text-white/20"
              autoFocus
            />
            <button
              onClick={() => handleVote('neutral')}
              className="text-xs px-4 py-1.5 rounded-full transition-colors"
              style={{
                color: 'rgba(201,169,110,0.6)',
                border: '1px solid rgba(201,169,110,0.2)',
              }}
            >
              提交
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
