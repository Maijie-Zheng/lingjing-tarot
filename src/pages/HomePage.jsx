import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import StarEye from '../components/StarEye'

/**
 * 首页 —— 灵境入口
 * 3 秒建立情绪氛围：星空背景 + 灵境之眼 + 品牌标题 + CTA
 */
export default function HomePage() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen text-center gap-7 px-page">
      {/* 主视觉：灵境之眼 —— 双层星环 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <StarEye />
      </motion.div>

      {/* 品牌区域 */}
      <motion.div
        className="flex flex-col gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
      >
        <h1 className="text-4xl tracking-wider text-brand-gold">
          灵 境
        </h1>
        <p className="text-base text-white/50 tracking-wide">
          解锁灵境，让心事皆有回响
        </p>
      </motion.div>

      {/* CTA 按钮 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <Link to="/ask" className="btn-gold inline-block text-lg px-10 py-3">
          ✨ 开启灵境
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
