import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * 解读等待时的 Loading 动画
 * 文案循环轮换，制造"正在为你准备"的沉浸感
 */

const LOADING_MESSAGES = [
  '✨ 牌面正在连接你的心灵...',
  '🔮 观察牌面中...',
  '🌙 聆听你的故事...',
  '💫 解读正在生成...',
]

const MESSAGE_INTERVAL = 2500 // 每条文案显示 2.5 秒

export default function LoadingSpinner({ visible = true }) {
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    if (!visible) return
    const timer = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length)
    }, MESSAGE_INTERVAL)
    return () => clearInterval(timer)
  }, [visible])

  return (
    <div className="flex flex-col items-center justify-center gap-8 py-12">
      {/* 旋转的塔罗牌 */}
      <motion.div
        className="relative w-20 h-20"
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      >
        <div className="absolute inset-2 rounded-full border-2 border-brand-gold/30" />
        <div className="absolute inset-0 rounded-full border-t-2 border-brand-gold"
          style={{ animation: 'spin 1.5s linear infinite' }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl">🃏</span>
        </div>
      </motion.div>

      {/* 轮换文案 */}
      <div className="h-8 relative">
        <AnimatePresence mode="wait">
          <motion.p
            key={messageIndex}
            className="text-white/50 text-sm absolute left-1/2 -translate-x-1/2 whitespace-nowrap"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
          >
            {LOADING_MESSAGES[messageIndex]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* 装饰点 */}
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-brand-gold/50"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.3,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </div>
  )
}
