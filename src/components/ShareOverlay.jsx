import { motion, AnimatePresence } from 'framer-motion'

/**
 * 分享卡片全屏浮层
 *
 * 用于微信浏览器等不支持 Web Share API / 下载的环境。
 * 展示生成的分享卡片图片，引导用户长按保存。
 *
 * Props:
 * - visible: boolean
 * - imageDataURL: string — Canvas 生成的 PNG Data URL
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
            className="rounded-xl shadow-2xl"
            style={{
              maxWidth: '88vw',
              maxHeight: '75vh',
              objectFit: 'contain',
              boxShadow: '0 0 40px rgba(201,169,110,0.2)',
            }}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            onClick={(e) => e.stopPropagation()} // 防止点击图片关闭
          />

          {/* 引导提示 */}
          <motion.div
            className="flex flex-col items-center gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <p className="text-white/80 text-base">👆 长按图片保存到相册</p>
            <p className="text-white/30 text-xs">保存后可在微信/朋友圈分享</p>
          </motion.div>

          {/* 关闭按钮 */}
          <motion.button
            className="text-white/50 text-sm px-6 py-2 rounded-full border transition-colors active:scale-95"
            style={{ borderColor: 'rgba(255,255,255,0.2)' }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            onClick={onClose}
          >
            关闭
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
