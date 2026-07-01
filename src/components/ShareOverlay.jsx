import { motion, AnimatePresence } from 'framer-motion'
import { Hand, Download } from 'lucide-react'
import { downloadImage } from '../utils/shareImage'

/**
 * 分享卡片全屏浮层 —— P3-7 v0.9 → Phase 4
 *
 * 两种模式：
 * - wechat: 微信浏览器，引导长按保存
 * - download: 非微信浏览器，预览卡片 + 下载按钮
 *
 * Props:
 * - visible: boolean
 * - imageDataURL: string — 海报 PNG Data URL
 * - mode: 'wechat' | 'download' — 默认 'wechat'
 * - onClose: () => void
 */
export default function ShareOverlay({ visible, imageDataURL, mode = 'wechat', onClose }) {
  const isWechat = mode === 'wechat'

  const handleDownload = (e) => {
    e.stopPropagation()
    downloadImage(imageDataURL)
  }

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
            {isWechat ? (
              <>
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
              </>
            ) : (
              <span className="text-white/60 text-sm">预览分享卡片</span>
            )}
          </motion.div>

          {/* 底部按钮 */}
          <motion.div
            className="flex gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {/* 下载按钮（仅 download 模式） */}
            {!isWechat && (
              <motion.button
                className="text-mystic-deeper text-sm px-6 py-2.5 rounded-full font-medium flex items-center gap-2"
                style={{ background: '#c9a96e' }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDownload}
              >
                <Download size={16} strokeWidth={1.8} aria-hidden />
                下载图片
              </motion.button>
            )}

            {/* 关闭按钮 */}
            <motion.button
              className="text-white/45 text-sm px-8 py-2 rounded-full border transition-colors"
              style={{ borderColor: 'rgba(255,255,255,0.18)' }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
            >
              关闭
            </motion.button>
          </motion.div>

          {/* 占位 spacer */}
          <div className="h-2" />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
