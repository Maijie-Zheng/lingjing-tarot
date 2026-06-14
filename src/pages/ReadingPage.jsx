import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Check, BookOpen, Home, Moon } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import ReadingText from '../components/ReadingText'
import ShareOverlay from '../components/ShareOverlay'
import SharePoster from '../components/SharePoster'
import { getSystemPrompt, buildUserPrompt } from '../utils/promptBuilder'
import { callDeepSeek } from '../utils/api'
import { saveReading } from '../utils/storage'
import { generateShareImage, downloadImage } from '../utils/shareImage'
import { parseReadingResponse } from '../utils/parseResponse'

/** 检测是否微信浏览器 */
function isWeChat() {
  return /micromessenger/i.test(navigator.userAgent)
}

/**
 * 解读结果页 —— P3-5 v0.6
 *
 * - AI 返回 JSON 结构化数据（整体叙事 + 三牌关键词 + 行动建议含来源牌）
 * - ReadingText 模块化渲染（NarrativeThread + ActionItem 新设计）
 * - 全页无 emoji，统一金色细线图标（lucide）
 * - 背景光晕 + 漂浮光斑 + 金色星轨环
 */
export default function ReadingPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { question, cards, preReading, preError } = location.state || {
    question: '',
    cards: [],
    preReading: null,
    preError: null,
  }

  const hasValidData = question && cards && cards.length === 3

  // ===== 合并海报所需牌数据（picks 的 image + AI 的 keyword）=====
  const posterCards = useMemo(() => {
    if (!cards || !readingData?.cards) return cards || []
    return (readingData.cards || []).map((aiCard, i) => {
      const pick = cards[i] || {}
      return {
        ...aiCard,
        image: pick.image || aiCard.image,
        nameEn: pick.nameEn || aiCard.nameEn || '',
        isReversed: aiCard.reversed ?? pick.isReversed ?? false,
        position: aiCard.position || pick.position?.key || (i === 0 ? 'past' : i === 1 ? 'present' : 'future'),
      }
    })
  }, [cards, readingData])

  // ===== 分享金句 + 浓缩叙事（含降级）=====
  const shareQuote = useMemo(() => {
    if (readingData?.shareQuote) return readingData.shareQuote
    // 降级：从 narrative 取第一句，截断到 20 字
    const narrative = readingData?.narrative || ''
    const firstSentence = narrative.split(/[。！？；\n]/)[0]?.trim() || ''
    if (firstSentence && firstSentence.length > 0) {
      return firstSentence.length > 20 ? firstSentence.slice(0, 20) : firstSentence
    }
    return null
  }, [readingData])

  const shareNarrative = useMemo(() => {
    return readingData?.shareNarrative || null
  }, [readingData])

  // 状态机
  const [status, setStatus] = useState('loading') // loading | error | ready
  const [readingData, setReadingData] = useState(null) // 结构化解读数据
  const [readingRawText, setReadingRawText] = useState('') // 保留原始文本用于分享卡片
  const [errorMessage, setErrorMessage] = useState('')
  const [saved, setSaved] = useState(false)
  const [shareImage, setShareImage] = useState(null)
  const [isGeneratingShare, setIsGeneratingShare] = useState(false)
  const hasStartedRef = useRef(false)
  const readingRef = useRef('')
  const posterRef = useRef(null)

  useEffect(() => {
    if (hasStartedRef.current) return
    hasStartedRef.current = true

    // ===== 预取结果（来自 ReadingLoadingPage）：直接使用，跳过 AI 调用 =====
    if (preReading) {
      readingRef.current = preReading
      setReadingRawText(preReading)
      const parsed = parseReadingResponse(preReading, cards)
      setReadingData(parsed)
      setStatus('ready')

      try {
        saveReading({ question, cards, reading: parsed, suggestions: [] })
        setSaved(true)
      } catch {
        // 保存失败不影响使用
      }
      return
    }

    // ===== 预取错误（来自 ReadingLoadingPage）：直接显示错误 =====
    if (preError) {
      setStatus('error')
      setErrorMessage(preError)
      return
    }

    // ===== 降级路径：没有预取数据（直接访问 /reading 或历史记录回访）=====
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
        setReadingRawText(text)

        // 解析 AI 响应为结构化数据
        const parsed = parseReadingResponse(text, cards)
        setReadingData(parsed)
        setStatus('ready')

        // 自动保存（结构化数据 + 原始文本）
        try {
          saveReading({
            question,
            cards,
            reading: parsed, // 存储结构化数据
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

  // ===== 分享（P3-7 v0.9：html-to-image 导出 SharePoster DOM）=====
  const handleShare = useCallback(async () => {
    // 1) 触发海报渲染（隐藏 DOM）
    setIsGeneratingShare(true)
  }, [])

  // ===== 海报 DOM 就绪后 → html-to-image 导出 =====
  useEffect(() => {
    if (!isGeneratingShare || !posterRef.current) return

    let cancelled = false

    const capture = async () => {
      // 等一帧确保所有图片 + 二维码 SVG 渲染完成
      await new Promise((r) => requestAnimationFrame(r))
      // 再等 200ms 确保图片加载（html-to-image 自带等待，但多等一帧更安全）
      await new Promise((r) => setTimeout(r, 200))

      if (cancelled) return

      try {
        const dataURL = await generateShareImage(posterRef.current)

        if (cancelled) return

        // 2) 微信浏览器 → 弹窗浮层
        if (isWeChat()) {
          setShareImage(dataURL)
          setIsGeneratingShare(false)
          return
        }

        // 3) 支持 Web Share API → 优先分享文件
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
              setIsGeneratingShare(false)
              return
            }
          } catch (err) {
            if (err.name === 'AbortError') {
              setIsGeneratingShare(false)
              return
            }
            // Web Share 失败 → 降级下载
          }
        }

        // 4) 降级：直接下载
        downloadImage(dataURL)
        setIsGeneratingShare(false)
      } catch (err) {
        console.error('海报生成失败:', err)
        // html-to-image 失败 → 静默降级（不做 Canvas 兜底，保持简洁）
        setIsGeneratingShare(false)
      }
    }

    capture()

    return () => {
      cancelled = true
    }
  }, [isGeneratingShare])

  // ===== 手动保存 =====
  const handleSave = () => {
    try {
      saveReading({
        question,
        cards,
        reading: readingData || parseReadingResponse(readingRef.current, cards),
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

      {/* 微信分享浮层 */}
      <ShareOverlay
        visible={!!shareImage}
        imageDataURL={shareImage}
        onClose={() => setShareImage(null)}
      />

      {/* 隐藏海报 DOM（供 html-to-image 截图，不显示在页面上） */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          opacity: 0,
          pointerEvents: 'none',
          zIndex: -1,
        }}
      >
        {isGeneratingShare && (
          <SharePoster
            ref={posterRef}
            question={question}
            cards={posterCards}
            shareQuote={shareQuote}
            shareNarrative={shareNarrative}
          />
        )}
      </div>
    </div>
  )
}
