import { motion } from 'framer-motion'
import { Layers } from 'lucide-react'

/**
 * 行动建议单条 —— P3-5 v0.6
 *
 * 左侧：金色编号徽章（圆形金描边 + 渐变金数字 + 微光）
 * 右侧：标题（白 95%）、「源自 · 某张牌」金色小标签、正文
 *
 * Props:
 * - index: number — 序号（1/2/3）
 * - title: string — 建议标题
 * - sourceCard: string | null — 来源牌名+正逆位
 * - body: string — 建议正文
 * - isLast: boolean — 是否最后一条（控制底部 padding）
 */
export default function ActionItem({ index, title, sourceCard, body, isLast }) {
  return (
    <motion.div
      className={`flex gap-3 ${isLast ? 'pt-4' : 'border-b border-gold/[.12] py-4 first:pt-0'}`}
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: (index - 1) * 0.12, duration: 0.35, ease: 'easeOut' }}
    >
      {/* 编号徽章：金色描边圆 + 渐变金数字 */}
      <div
        className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full border border-gold/50"
        style={{ boxShadow: '0 0 12px rgba(230,201,130,0.15)' }}
      >
        <span className="text-gold-gradient animate-shine font-serif text-[15px] font-semibold">
          {index}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        {/* 标题 */}
        <div className="text-[14px] text-white/95">{title}</div>

        {/* 来源牌标签 */}
        {sourceCard && (
          <div className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-gold/10 px-2 py-0.5 text-[10.5px] text-gold-200/75">
            <Layers size={11} strokeWidth={1.6} aria-hidden />
            源自 · {sourceCard}
          </div>
        )}

        {/* 正文 */}
        {body && (
          <p className="mt-2 text-[13px] font-light leading-[1.85] text-white/72">
            {body}
          </p>
        )}
      </div>
    </motion.div>
  )
}
