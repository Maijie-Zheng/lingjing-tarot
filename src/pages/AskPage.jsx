import { useState, useRef, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * 问题输入页 —— P0-7 升级
 *
 * 视觉：磨砂玻璃输入框 + 聚焦光效 + 胶囊 chip + 微光按钮
 * 交互：chip 分类标签 + 换一批旋转 + 聚焦光晕扩散
 * 品牌：灵境已启文案 + 诗意隐私提示
 */

// 问题示例库（20 条，4 个场景 × 5 条）
const EXAMPLE_QUESTIONS = [
  // 感情
  { category: '💫', label: '感情', text: '他对我到底是什么感觉？' },
  { category: '💫', label: '感情', text: '这段关系应该继续还是放手？' },
  { category: '💫', label: '感情', text: '我和 TA 能走到一起吗？' },
  { category: '💫', label: '感情', text: '为什么我总是遇到相似的感情问题？' },
  { category: '💫', label: '感情', text: 'TA 心里还有我吗？' },

  // 事业
  { category: '⚡', label: '事业', text: '我该不该接受这个 offer？' },
  { category: '⚡', label: '事业', text: '我适合现在转行吗？' },
  { category: '⚡', label: '事业', text: '接下来三个月工作上有什么需要注意？' },
  { category: '⚡', label: '事业', text: '我该创业还是继续上班？' },
  { category: '⚡', label: '事业', text: '为什么我总感觉在工作中被低估？' },

  // 自我
  { category: '🌙', label: '自我', text: '最近的整体运势怎么样？' },
  { category: '🌙', label: '自我', text: '为什么我总觉得很焦虑？' },
  { category: '🌙', label: '自我', text: '我接下来的人生方向在哪里？' },
  { category: '🌙', label: '自我', text: '我该如何找回自己？' },
  { category: '🌙', label: '自我', text: '今年我的生活会有什么变化？' },

  // 日常
  { category: '🔮', label: '日常', text: '今天有什么需要留意的？' },
  { category: '🔮', label: '日常', text: '这周适合做出改变吗？' },
  { category: '🔮', label: '日常', text: '今天适合做重要决定吗？' },
  { category: '🔮', label: '日常', text: '最近有没有什么机会我该抓住？' },
  { category: '🔮', label: '日常', text: '这件事的结果会好吗？' },
]

/** 每次随机选 5 条（不重复） */
function pickExamples() {
  const shuffled = [...EXAMPLE_QUESTIONS].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 5)
}

export default function AskPage() {
  const [question, setQuestion] = useState('')
  const [examples, setExamples] = useState(() => pickExamples())
  const [refreshKey, setRefreshKey] = useState(0) // 触发 AnimatePresence
  const [isRefreshSpin, setIsRefreshSpin] = useState(false) // 换一批旋转
  const [isFocused, setIsFocused] = useState(false) // 输入框聚焦态
  const textareaRef = useRef(null)
  const navigate = useNavigate()

  const MAX_LENGTH = 200
  const showCharCount = question.length > 50
  const hasInput = !!question.trim()

  // 自动聚焦（延迟 300ms）
  useEffect(() => {
    const timer = setTimeout(() => {
      textareaRef.current?.focus()
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  // 点击 chip 填入输入框
  const handleChipClick = (text) => {
    setQuestion(text)
    textareaRef.current?.focus()
  }

  // 换一批
  const handleRefresh = useCallback(() => {
    if (isRefreshSpin) return
    setIsRefreshSpin(true)
    setRefreshKey((k) => k + 1)
    setTimeout(() => {
      setExamples(pickExamples())
      setIsRefreshSpin(false)
    }, 150)
  }, [isRefreshSpin])

  // 提交
  const handleSubmit = (e) => {
    e.preventDefault()
    if (hasInput) {
      navigate(`/shuffle?q=${encodeURIComponent(question.trim())}`)
    }
  }

  return (
    <div className="flex flex-col min-h-screen pt-6 gap-5 px-page">
      {/* 返回按钮 */}
      <Link to="/" className="text-brand-gold text-sm self-start">
        &larr; 返回
      </Link>

      {/* 标题 */}
      <motion.h1
        className="text-2xl text-center mt-4 font-serif"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        灵境已启，说说你的心事吧
      </motion.h1>

      {/* ===== 输入框区域 ===== */}
      <div className="flex flex-col gap-1.5">
        {/* 磨砂玻璃输入框 + 聚焦光效 */}
        <div
          className="rounded-card transition-all duration-400"
          style={{
            background: isFocused
              ? 'rgba(255,255,255,0.06)'
              : 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: isFocused
              ? '1px solid rgba(201,169,110,0.35)'
              : '1px solid rgba(255,255,255,0.08)',
            boxShadow: isFocused
              ? '0 0 24px rgba(201,169,110,0.08), 0 0 60px rgba(201,169,110,0.04), inset 0 1px 0 rgba(255,255,255,0.03)'
              : 'inset 0 1px 0 rgba(255,255,255,0.03)',
            transition: 'border-color 0.4s ease, box-shadow 0.4s ease, background 0.4s ease',
          }}
        >
          <textarea
            ref={textareaRef}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="写下你的心事..."
            rows={3}
            maxLength={MAX_LENGTH}
            className="w-full bg-transparent px-4 py-4 text-white text-body
                       placeholder-breathe focus:outline-none
                       resize-none min-h-[80px]"
            style={{ color: '#e8e0f0' }}
          />
        </div>

        {/* 字数统计（超过 50 字才显示） */}
        {showCharCount && (
          <span
            className={`text-xs self-end ${
              question.length >= MAX_LENGTH ? 'text-red-400' : 'text-white/30'
            }`}
          >
            {question.length}/{MAX_LENGTH}
          </span>
        )}

        {/* 隐私提示 —— 移到输入框下方 */}
        <p className="text-xs text-center text-white/20 mt-0.5">
          ✨ 你的心事，仅存于你的掌心
        </p>
      </div>

      {/* ===== 问题推荐区 ===== */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs text-white/30">试试这些问题：</p>
          <motion.button
            type="button"
            onClick={handleRefresh}
            className="text-xs flex items-center gap-1 transition-colors"
            style={{ color: 'rgba(201,169,110,0.7)' }}
            whileHover={{ color: '#c9a96e' }}
            whileTap={{ scale: 0.9 }}
          >
            <motion.span
              animate={{ rotate: isRefreshSpin ? 360 : 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              🔄
            </motion.span>
            换一批
          </motion.button>
        </div>

        <div className="flex flex-wrap gap-2">
          <AnimatePresence mode="wait">
            {examples.map((item, i) => (
              <motion.button
                key={`${refreshKey}-${i}`}
                type="button"
                onClick={() => handleChipClick(item.text)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{
                  duration: 0.25,
                  delay: i * 0.05,
                  ease: 'easeOut',
                }}
                whileHover={{
                  scale: 1.02,
                  y: -2,
                  boxShadow: '0 0 14px rgba(201,169,110,0.15)',
                  borderColor: 'rgba(201,169,110,0.45)',
                  backgroundColor: 'rgba(201,169,110,0.15)',
                }}
                whileTap={{ scale: 0.97 }}
                className="text-sm px-4 py-2 rounded-full border transition-all
                           active:scale-95 whitespace-nowrap"
                style={{
                  background: 'rgba(201,169,110,0.08)',
                  borderColor: 'rgba(201,169,110,0.25)',
                  color: '#c9a96e',
                  transition: 'background 0.2s, border-color 0.2s, box-shadow 0.2s',
                }}
              >
                <span className="mr-1">{item.category}</span>
                <span className="text-white/40 text-xs mr-0.5">{item.label}</span>
                <span className="text-white/40 text-xs mr-1">·</span>
                {item.text}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* ===== CTA 按钮 ===== */}
      <motion.button
        onClick={handleSubmit}
        disabled={!hasInput}
        className={`btn-gold text-lg py-3 mt-auto relative overflow-hidden ${
          !hasInput ? 'opacity-30 pointer-events-none' : ''
        }`}
        style={{
          transition: 'opacity 0.4s ease',
        }}
        whileTap={hasInput ? { scale: 0.97 } : {}}
      >
        {/* 微光流动动画（enabled 状态播放） */}
        {hasInput && (
          <motion.div
            className="absolute inset-y-0 w-20"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
            }}
            animate={{ left: ['-25%', '120%'] }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'easeInOut',
              repeatDelay: 0.5,
            }}
          />
        )}
        <span className="relative z-10">✨ 开启灵境</span>
      </motion.button>
    </div>
  )
}
