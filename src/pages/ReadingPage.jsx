import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import LoadingSpinner from '../components/LoadingSpinner'
import ReadingText from '../components/ReadingText'
import ShareOverlay from '../components/ShareOverlay'
import { getSystemPrompt, buildUserPrompt } from '../utils/promptBuilder'
import { callDeepSeek } from '../utils/api'
import { saveReading } from '../utils/storage'
import { generateShareCanvas, canvasToDataURL, downloadImage } from '../utils/shareImage'

/** 检测是否微信浏览器 */
function isWeChat() {
  return /micromessenger/i.test(navigator.userAgent)
}

/**
 * 解读结果页 —— P0-9 升级
 *
 * - 问题卡片磨砂玻璃化（对齐 AskPage/ShufflePage 风格）
 * - Loading 星轨仪式感动画（星轨双环 + 牌面浮现 + 诗意文案）
 * - "重新抽牌"保留问题（修复 bug）
 * - 背景光晕氛围增强
 * - 解读完成后 loading 淡出 → 内容淡入
 */
export default function ReadingPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { question, cards } = location.state || {
    question: '',
    cards: [],
  }

  const hasValidData = question && cards && cards.length === 3

  // 状态机
  const [status, setStatus] = useState('loading') // loading | error | ready
  const [readingText, setReadingText] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [saved, setSaved] = useState(false)
  const [shareImage, setShareImage] = useState(null)
  const hasStartedRef = useRef(false)
  const readingRef = useRef('')

  useEffect(() => {
    if (hasStartedRef.current) return
    hasStartedRef.current = true

    if (!hasValidData) {
      setStatus('error')
      setErrorMessage('缺少抽牌数据，请从洗牌页重新进入')
      return
    }

    const fetchReading = async () => {
      try {
        const systemPrompt = getSystemPrompt()
        const userPrompt = buildUserPrompt(question, cards)
        const text = await callDeepSeek(systemPrompt, userPrompt)
        readingRef.current = text
        setReadingText(text)
        setStatus('ready')

        // 自动保存
        try {
          saveReading({
            question,
            cards,
            reading: text,
            suggestions: [],
          })
          setSaved(true)
        } catch {
          // 保存失败不影响使用
        }
      } catch (err) {
        console.error('AI 解读失败:', err)
        setErrorMessage(err.message || '牌面能量有点波动，请再试一次')
        setStatus('error')
      }
    }

    fetchReading()
  }, [])

  // ===== 重新抽牌（修复：保留问题参数）=====
  const handleReshuffle = useCallback(() => {
    navigate(`/shuffle?q=${encodeURIComponent(question)}`)
  }, [question, navigate])

  // ===== 分享 =====
  const handleShare = async () => {
    try {
      const canvas = generateShareCanvas({ question, cards, reading: readingRef.current })
      const dataURL = canvasToDataURL(canvas)

      if (isWeChat()) {
        setShareImage(dataURL)
        return
      }

      if (navigator.share && navigator.canShare) {
        const blob = await (await fetch(dataURL)).blob()
        const file = new File([blob], '灵境-塔罗解读.png', { type: 'image/png' })
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: '灵境 · AI 塔罗解读',
            text: '来看看我的塔罗解读结果 🔮',
            files: [file],
          })
          return
        }
      }

      downloadImage(dataURL)
    } catch (err) {
      if (err.name === 'AbortError') return
      try {
        const canvas = generateShareCanvas({ question, cards, reading: readingRef.current })
        downloadImage(canvasToDataURL(canvas))
      } catch {
        // 静默失败
      }
    }
  }

  // ===== 手动保存 =====
  const handleSave = () => {
    try {
      saveReading({
        question,
        cards,
        reading: readingRef.current,
        suggestions: [],
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      // 静默失败
    }
  }

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

      {/* ===== 问题展示卡（磨砂玻璃风格，对齐 AskPage/ShufflePage）===== */}
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
            <span className="text-5xl">🌙</span>
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
          {status === 'ready' && readingText && (
            <motion.div
              key="reading-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <ReadingText
                rawText={readingText}
                cards={hasValidData ? cards : null}
                speed={800}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ===== 底部操作按钮 ===== */}
      <AnimatePresence>
        {status === 'ready' && (
          <motion.div
            className="flex flex-col gap-3 pb-6 relative z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <button className="btn-gold" onClick={handleShare}>
              📤 分享卡片
            </button>
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleSave}
                className={`text-sm transition-colors ${
                  saved ? 'text-green-400' : 'text-brand-gold/60'
                }`}
              >
                {saved ? '✅ 已保存' : '💾 保存'}
              </button>
              <Link to="/history" className="text-sm text-brand-gold/60">
                📜 历史记录
              </Link>
              <Link to="/" className="text-sm text-brand-gold/60">
                🏠 首页
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 微信分享浮层 */}
      <ShareOverlay
        visible={!!shareImage}
        imageDataURL={shareImage}
        onClose={() => setShareImage(null)}
      />
    </div>
  )
}
