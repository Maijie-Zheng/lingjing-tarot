import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import TarotCard from '../components/TarotCard'

/**
 * 首页 —— 灵境入口
 * 3 秒建立情绪氛围：星空背景 + 浮动牌面 + 品牌标题 + CTA
 */
export default function HomePage() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen text-center gap-8 px-page">
      {/* 主视觉牌面 —— 浮动动画 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <TarotCard
          card={{ name: '星星', nameEn: 'The Star' }}
          size="lg"
          floating
        />
      </motion.div>

      {/* 品牌区域 */}
      <motion.div
        className="flex flex-col gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        <h1 className="text-4xl tracking-wider text-brand-gold">
          灵 境
        </h1>
        <p className="text-base text-white/50 tracking-wide">
          AI 塔罗 · 心灵之境
        </p>
      </motion.div>

      {/* 一句话 */}
      <motion.p
        className="text-sm text-white/30 italic"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      >
        "让塔罗倾听你的心事"
      </motion.p>

      {/* CTA 按钮 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <Link to="/ask" className="btn-gold inline-block text-lg px-10 py-3">
          ✨ 开始抽牌
        </Link>
      </motion.div>

      {/* 历史记录入口 */}
      <Link
        to="/history"
        className="absolute top-6 right-6 text-sm text-white/40 hover:text-brand-gold transition-colors"
      >
        📜 历史记录
      </Link>
    </div>
  )
}
