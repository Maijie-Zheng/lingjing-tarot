import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSystemPrompt, buildUserPrompt } from '../utils/promptBuilder'
import { callDeepSeek } from '../utils/api'
import { saveReading } from '../utils/storage'
import { parseReadingResponse } from '../utils/parseResponse'

/**
 * 塔罗解读核心逻辑 Hook
 *
 * 从 ReadingPage 抽离：状态机、API 调用、数据解析、保存、分享素材计算。
 * 让 ReadingPage 只关心渲染和分享交互。
 *
 * @param {object} params
 * @param {string} params.question
 * @param {Array} params.cards - 三张牌
 * @param {string|null} params.preReading - ReadingLoadingPage 预取结果
 * @param {string|null} params.preError - ReadingLoadingPage 预取错误
 * @returns {{ status, readingData, readingRawText, errorMessage, saved,
 *             posterCards, shareQuote, shareNarrative, hasValidData,
 *             handleSave, handleReshuffle }}
 */
export default function useReading({ question, cards, preReading, preError }) {
  const navigate = useNavigate()

  const hasValidData = question && cards && cards.length === 3

  // 状态机
  const [status, setStatus] = useState('loading') // loading | error | ready
  const [readingData, setReadingData] = useState(null)
  const [readingRawText, setReadingRawText] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [saved, setSaved] = useState(false)

  const hasStartedRef = useRef(false)
  const readingRef = useRef('')

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

  // ===== 核心流程：预取优先 → 降级 API 调用 =====
  useEffect(() => {
    if (hasStartedRef.current) return
    hasStartedRef.current = true

    // 预取结果（来自 ReadingLoadingPage）
    if (preReading) {
      readingRef.current = preReading
      setReadingRawText(preReading)
      const parsed = parseReadingResponse(preReading, cards)
      setReadingData(parsed)
      setStatus('ready')

      try {
        saveReading({ question, cards, reading: parsed, suggestions: [] })
        setSaved(true)
      } catch { /* 保存失败不影响使用 */ }
      return
    }

    // 预取错误（来自 ReadingLoadingPage）
    if (preError) {
      setStatus('error')
      setErrorMessage(preError)
      return
    }

    // 降级路径：没有预取数据（直接访问 /reading）
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

        const parsed = parseReadingResponse(text, cards)
        setReadingData(parsed)
        setStatus('ready')

        try {
          saveReading({ question, cards, reading: parsed, suggestions: [] })
          setSaved(true)
        } catch { /* 保存失败不影响使用 */ }
      } catch (err) {
        console.error('AI 解读失败:', err)
        setErrorMessage(err.message || '牌面能量有点波动，请再试一次')
        setStatus('error')
      }
    }

    fetchReading()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ===== 重新抽牌 =====
  const handleReshuffle = useCallback(() => {
    navigate(`/shuffle?q=${encodeURIComponent(question)}`)
  }, [question, navigate])

  // ===== 手动保存 =====
  const handleSave = useCallback(() => {
    try {
      saveReading({
        question,
        cards,
        reading: readingData || parseReadingResponse(readingRef.current, cards),
        suggestions: [],
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch { /* 静默失败 */ }
  }, [question, cards, readingData])

  return {
    status,
    readingData,
    readingRawText,
    errorMessage,
    saved,
    posterCards,
    shareQuote,
    shareNarrative,
    hasValidData,
    handleSave,
    handleReshuffle,
  }
}
