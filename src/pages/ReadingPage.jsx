import { useState, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Check, BookOpen, Home, Moon } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import ReadingText from '../components/ReadingText'
import ShareOverlay from '../components/ShareOverlay'
import { generateShareCanvas, canvasToDataURL } from '../utils/shareImage'
import useReading from '../hooks/useReading'

/** 检测是否微信浏览器 */
function isWeChat() {
  return /micromessenger/i.test(navigator.userAgent)
}

/**
 * 解读结果页 —— P3-5 v0.6
 *
 * 业务逻辑抽离至 useReading hook，本组件只负责渲染 + 分享交互。
 * - 全页无 emoji，统一金色细线图标（lucide）
 * - 背景光晕 + 漂浮光斑 + 金色星轨环
 */
export default function ReadingPage() {
  const location = useLocation()
  const { question, cards, preReading, preError } = location.state || {
    question: '',
    cards: [],
    preReading: null,
    preError: null,
  }

  const {
    status,
    readingData,
    errorMessage,
    saved,
    posterCards,
    shareQuote,
    shareNarrative,
    hasValidData,
    handleSave,
    handleReshuffle,
  } = useReading({ question, cards, preReading, preError })

  const [shareImage, setShareImage] = useState(null)

  // ===== 分享 —— Phase 4: 非微信也先预览再下载 =====
  const handleShare = useCallback(async () => {
    try {
      const canvas = await generateShareCanvas({
        question,
        cards: posterCards,
        shareQuote,
        shareNarrative,
      })
      const dataURL = canvasToDataURL(canvas)

      // 微信浏览器 → 弹窗浮层（长按保存模式）
      if (isWeChat()) {
        setShareImage({ dataURL, mode: 'wechat' })
        return
      }

      // Web Share API（优先系统分享）
      if (navigator.share && navigator.canShare) {
        try {
          const blob = await (await fetch(dataURL)).blob()
          const file = new File([blob], '灵境-塔罗解读.png', { type: 'image/png' })
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: '灵境 · AI 塔罗解读',
              text: '来看看我的塔罗解读结果',
              files: [file],
            })
            return
          }
        } catch (err) {
          if (err.name === 'AbortError') return
        }
      }

      // 降级：预览浮层（可预览 + 下载，不再直接下载）
      setShareImage({ dataURL, mode: 'download' })
    } catch (err) {
      console.error('海报生成失败:', err)
    }
  }, [question, posterCards, shareQuote, shareNarrative])

  return (
    <div className="flex flex-col min-h-screen pt-6 gap-5 px-page relative">
      {/* ===== 背景光晕（页面中央）===== */}
      <motion.div
        className="fixed pointer-events-none left-1/2"
        style={{
          top: '40%',
          marginLeft: -200,
          marginTop: -200,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(139,92,246,0.04) 0%, rgba(139,92,246,0.01) 40%, transparent 60%)',
          zIndex: 0,
        }}
        animate={{
          opacity: status === 'loading' ? [0.5, 1, 0.5] : 0.4,
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* ===== 漂浮光斑 ===== */}
      <motion.div
        className="fixed pointer-events-none rounded-full"
        style={{
          width: 300,
          height: 300,
          background:
            'radial-gradient(circle, rgba(201,169,110,0.03) 0%, transparent 60%)',
          right: '-10%',
          top: '15%',
          zIndex: 0,
        }}
        animate={{
          x: [0, -30, 0, 20, 0],
          y: [0, 20, -15, -25, 0],
          opacity: [0.6, 1, 0.5, 0.8, 0.6],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="fixed pointer-events-none rounded-full"
        style={{
          width: 250,
          height: 250,
          background:
            'radial-gradient(circle, rgba(139,92,246,0.03) 0%, transparent 60%)',
          left: '-8%',
          top: '55%',
          zIndex: 0,
        }}
        animate={{
          x: [0, 25, -15, 0],
          y: [0, -25, 15, 0],
          opacity: [0.4, 0.8, 0.5, 0.4],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* ===== 金色星轨粒子环 ===== */}
      {status === 'ready' && (
        <motion.div
          className="fixed pointer-events-none left-1/2 rounded-full"
          style={{
            top: '50%',
            width: 320,
            height: 320,
            marginLeft: -160,
            marginTop: -200,
            border: '1px solid rgba(201,169,110,0.08)',
            zIndex: 0,
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        >
          {[0, 60, 120, 180, 240, 300].map((angle) => (
            <div
              key={angle}
              className="absolute rounded-full"
              style={{
                width: 3,
                height: 3,
                background: 'rgba(201,169,110,0.4)',
                boxShadow: '0 0 8px rgba(201,169,110,0.3), 0 0 20px rgba(201,169,110,0.1)',
                left: '50%',
                top: 0,
                marginLeft: -1.5,
                marginTop: -1.5,
                transform: `rotate(${angle}deg) translateY(-160px)`,
              }}
            />
          ))}
        </motion.div>
      )}

      {/* ===== 顶栏 ===== */}
      <div className="flex items-center justify-between relative z-10">
        <button
          onClick={handleReshuffle}
          className="text-sm transition-colors"
          style={{ color: 'rgba(201,169,110,0.7)' }}
          onMouseEnter={(e) => (e.target.style.color = '#c9a96e')}
          onMouseLeave={(e) => (e.target.style.color = 'rgba(201,169,110,0.7)')}
        >
          &larr; 重新抽牌
        </button>
      </div>

      {/* ===== 问题展示卡（磨砂玻璃风格）===== */}
      {question && (
        <motion.div
          className="rounded-card px-4 py-3 text-center relative z-10"
          style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)',
          }}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-white/30 text-xs mb-1">你问的是</p>
          <p className="text-white/80 text-sm leading-relaxed">{question}</p>
        </motion.div>
      )}

      {/* ===== 内容区域 ===== */}
      <div className="flex-1 pb-6 relative z-10">
        {/* Loading 状态：星轨仪式感动画 */}
        {status === 'loading' && <LoadingSpinner visible />}

        {/* Error 状态 */}
        {status === 'error' && (
          <motion.div
            className="flex flex-col items-center justify-center gap-6 py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Moon size={48} strokeWidth={1.2} className="text-white/30" aria-hidden />
            <p className="text-white/60 text-center">{errorMessage}</p>
            <div className="flex gap-4">
              <button onClick={handleReshuffle} className="btn-gold">
                重试
              </button>
              <Link to="/" className="text-brand-gold text-sm self-center">
                返回首页
              </Link>
            </div>
          </motion.div>
        )}

        {/* Ready 状态：解读内容 */}
        <AnimatePresence mode="wait">
          {status === 'ready' && readingData && (
            <motion.div
              key="reading-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <ReadingText
                data={readingData}
                cards={hasValidData ? cards : null}
                speed={800}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ===== 底部操作按钮（P3-5 v0.6：去 emoji，改 lucide 图标）===== */}
      <AnimatePresence>
        {status === 'ready' && (
          <motion.div
            className="flex flex-col gap-3 pb-6 relative z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <button className="btn-gold flex items-center justify-center gap-2" onClick={handleShare}>
              <Upload size={17} strokeWidth={1.8} aria-hidden />
              分享卡片
            </button>
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleSave}
                className="text-sm transition-colors flex items-center gap-1"
                style={{ color: saved ? '#c9a96e' : 'rgba(201,169,110,0.6)' }}
              >
                {saved ? (
                  <>
                    <Check size={15} strokeWidth={1.8} aria-hidden />
                    已保存
                  </>
                ) : (
                  <>
                    <Check size={15} strokeWidth={1.8} aria-hidden />
                    保存
                  </>
                )}
              </button>
              <Link
                to="/history"
                className="text-sm flex items-center gap-1"
                style={{ color: 'rgba(201,169,110,0.6)' }}
              >
                <BookOpen size={15} strokeWidth={1.8} aria-hidden />
                历史记录
              </Link>
              <Link
                to="/"
                className="text-sm flex items-center gap-1"
                style={{ color: 'rgba(201,169,110,0.6)' }}
              >
                <Home size={15} strokeWidth={1.8} aria-hidden />
                首页
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 分享预览浮层（微信长按保存 / 通用预览下载） */}
      <ShareOverlay
        visible={!!shareImage}
        imageDataURL={shareImage?.dataURL}
        mode={shareImage?.mode || 'wechat'}
        onClose={() => setShareImage(null)}
      />
    </div>
  )
}
