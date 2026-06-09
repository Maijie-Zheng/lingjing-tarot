import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import TarotCard from '../components/TarotCard'
import LoadingSpinner from '../components/LoadingSpinner'
import ReadingText from '../components/ReadingText'
import { getSystemPrompt, buildUserPrompt } from '../utils/promptBuilder'
import { callDeepSeek } from '../utils/api'

/**
 * 解读结果页
 * 状态机：loading → (error | ready) → display
 */
export default function ReadingPage() {
  const location = useLocation()
  const { question, cards } = location.state || {
    question: '',
    cards: [],
  }

  const hasValidData = question && cards && cards.length === 3

  // 状态机
  const [status, setStatus] = useState('loading') // loading | error | ready
  const [readingText, setReadingText] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const hasStartedRef = useRef(false)

  useEffect(() => {
    // 防止 StrictMode 双重调用
    if (hasStartedRef.current) return
    hasStartedRef.current = true

    if (!hasValidData) {
      setStatus('error')
      setErrorMessage('缺少抽牌数据，请从洗牌页重新进入')
      return
    }

    // 调用 DeepSeek API
    const fetchReading = async () => {
      try {
        const systemPrompt = getSystemPrompt()
        const userPrompt = buildUserPrompt(question, cards)
        const text = await callDeepSeek(systemPrompt, userPrompt)
        setReadingText(text)
        setStatus('ready')
      } catch (err) {
        console.error('AI 解读失败:', err)
        setErrorMessage(err.message || '牌面能量有点波动，请再试一次')
        setStatus('error')
      }
    }

    fetchReading()
  }, []) // 只在首次进入时调用

  return (
    <div className="flex flex-col min-h-screen pt-6 gap-6">
      {/* 顶栏 */}
      <Link to="/shuffle" className="text-brand-gold text-sm px-page">
        &larr; 重新抽牌
      </Link>

      {/* 用户问题 */}
      {question && (
        <div className="px-page text-center">
          <p className="text-white/50 text-xs">你问的是</p>
          <p className="text-white/90 mt-1 leading-relaxed">「{question}」</p>
        </div>
      )}

      {/* 三张牌缩略图 */}
      {hasValidData && (
        <motion.div
          className="flex justify-center gap-3 px-page"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {cards.map((card, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <TarotCard card={card} size="sm" />
              <div className="text-center">
                <span className="text-xs text-brand-gold">
                  {card.position?.emoji} {card.position?.label}
                </span>
                {card.isReversed && (
                  <span className="text-xs text-red-400 block">逆位</span>
                )}
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* 分隔线 */}
      <div className="mx-page h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.3), transparent)' }} />

      {/* 内容区域 */}
      <div className="flex-1 px-page pb-6">
        {status === 'loading' && (
          <LoadingSpinner visible />
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center justify-center gap-6 py-12">
            <span className="text-5xl">🌙</span>
            <p className="text-white/60 text-center">{errorMessage}</p>
            <div className="flex gap-4">
              <Link to="/shuffle" className="btn-gold">
                重试
              </Link>
              <Link to="/" className="text-brand-gold text-sm self-center">
                返回首页
              </Link>
            </div>
          </div>
        )}

        {status === 'ready' && readingText && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <ReadingText rawText={readingText} speed={800} />
          </motion.div>
        )}
      </div>

      {/* 底部操作按钮（解读完成后显示） */}
      {status === 'ready' && (
        <motion.div
          className="flex flex-col gap-3 px-page pb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <button className="btn-gold">📤 分享卡片</button>
          <div className="flex gap-4 justify-center">
            <button className="text-sm text-brand-gold/60">💾 保存</button>
            <Link to="/history" className="text-sm text-brand-gold/60">
              📜 历史记录
            </Link>
            <Link to="/" className="text-sm text-brand-gold/60">
              🏠 首页
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  )
}
