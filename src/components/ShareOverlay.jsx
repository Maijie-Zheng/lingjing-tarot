import { motion, AnimatePresence } from 'framer-motion'
import { Hand } from 'lucide-react'

/**
 * 分享卡片全屏浮层 —— P3-7 v0.9
 *
 * 用于微信浏览器等不支持 Web Share API / 下载的环境。
 * 展示生成的分享卡片图片，引导用户长按保存。
 *
 * 改动（v0.9）：
 * - 去 emoji，手指图标改用 lucide Hand
 * - 按钮布局不重叠
 * - 模态背景全暗（bg-black/92）不透底层
 *
 * Props:
 * - visible: boolean
 * - imageDataURL: string — 海报 PNG Data URL
 * - onClose: () => void
 */
export default function ShareOverlay({ visible, imageDataURL, onClose }) {
  return (
    <AnimatePresence>
      {visible && imageDataURL && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5"
          style={{ background: 'rgba(0,0,0,0.92)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
        >
          {/* 卡片图片 */}
          <motion.img
            src={imageDataURL}
            alt="分享卡片"
            className="rounded-xl"
            style={{
              maxWidth: '88vw',
              maxHeight: '70vh',
              objectFit: 'contain',
              boxShadow: '0 0 40px rgba(201,169,110,0.2)',
            }}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            onClick={(e) => e.stopPropagation()}
          />

          {/* 引导提示 */}
          <motion.div
            className="flex flex-col items-center gap-1.5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center gap-2">
              <Hand
                size={18}
                strokeWidth={1.5}
                color="rgba(201,169,110,0.7)"
                aria-hidden
              />
              <span className="text-white/75 text-sm">长按图片保存到相册</span>
            </div>
            <span className="text-white/25 text-xs">保存后可在微信/朋友圈分享</span>
          </motion.div>

          {/* 关闭按钮（幽灵按钮，细描边） */}
          <motion.button
            className="text-white/45 text-sm px-8 py-2 rounded-full border transition-colors"
            style={{ borderColor: 'rgba(255,255,255,0.18)' }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            onClick={onClose}
          >
            关闭
          </motion.button>

          {/* 占位 spacer 防止按钮与底部操作栏重叠 */}
          <div className="h-2" />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
