import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * 问题输入页
 * 让用户舒服地说出心事：引导文案 + 大输入框 + 示例 chip + 隐私提示
 */

// 问题示例库（20 条，覆盖 4 个场景）
const EXAMPLE_QUESTIONS = [
  // 感情
  { category: '💕', text: '他对我到底是什么感觉？' },
  { category: '💕', text: '这段关系应该继续还是放手？' },
  { category: '💕', text: '我和 TA 能走到一起吗？' },
  { category: '💕', text: '为什么我总是遇到相似的感情问题？' },
  { category: '💕', text: 'TA 心里还有我吗？' },

  // 事业
  { category: '💼', text: '我该不该接受这个 offer？' },
  { category: '💼', text: '我适合现在转行吗？' },
  { category: '💼', text: '接下来三个月工作上有什么需要注意？' },
  { category: '💼', text: '我该创业还是继续上班？' },
  { category: '💼', text: '为什么我总感觉在工作中被低估？' },

  // 自我
  { category: '🌱', text: '最近的整体运势怎么样？' },
  { category: '🌱', text: '为什么我总觉得很焦虑？' },
  { category: '🌱', text: '我接下来的人生方向在哪里？' },
  { category: '🌱', text: '我该如何找回自己？' },
  { category: '🌱', text: '今年我的生活会有什么变化？' },

  // 日常
  { category: '✨', text: '今天有什么需要留意的？' },
  { category: '✨', text: '这周适合做出改变吗？' },
  { category: '✨', text: '今天适合做重要决定吗？' },
  { category: '✨', text: '最近有没有什么机会我该抓住？' },
  { category: '✨', text: '这件事的结果会好吗？' },
]

/** 每次随机选 5 条（不重复） */
function pickExamples() {
  const shuffled = [...EXAMPLE_QUESTIONS].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 5)
}

export default function AskPage() {
  const [question, setQuestion] = useState('')
  const [examples, setExamples] = useState(() => pickExamples())
  const [refreshKey, setRefreshKey] = useState(0)  // 用于触发 AnimatePresence
  const textareaRef = useRef(null)
  const navigate = useNavigate()

  const MAX_LENGTH = 200
  const showCharCount = question.length > 50

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
    setRefreshKey((k) => k + 1)
    // 延迟更新内容，让 exit 动画先播放
    setTimeout(() => {
      setExamples(pickExamples())
    }, 150)
  }, [])

  // 提交
  const handleSubmit = (e) => {
    e.preventDefault()
    if (question.trim()) {
      navigate(`/shuffle?q=${encodeURIComponent(question.trim())}`)
    }
  }

  return (
    <div className="flex flex-col min-h-screen pt-6 gap-6 px-page">
      {/* 返回按钮 */}
      <Link to="/" className="text-brand-gold text-sm self-start">
        &larr; 返回
      </Link>

      {/* 引导文案 */}
      <h1 className="text-2xl text-center mt-6">
        "此刻，你在想什么？"
      </h1>

      {/* 输入框区域 */}
      <div className="flex flex-col gap-2">
        <textarea
          ref={textareaRef}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="写下你的心事..."
          rows={3}
          maxLength={MAX_LENGTH}
          className="w-full bg-white/5 border-b-2 border-white/10 rounded-t-card
                     px-4 py-4 text-white text-body
                     placeholder:text-white/25 focus:outline-none
                     focus:border-brand-gold/50 transition-colors
                     resize-none min-h-[80px]"
          style={{ background: 'rgba(255,255,255,0.05)' }}
        />

        {/* 字数统计（超过 50 字才显示） */}
        {showCharCount && (
          <span className={`text-xs self-end ${question.length >= MAX_LENGTH ? 'text-red-400' : 'text-white/30'}`}>
            {question.length}/{MAX_LENGTH}
          </span>
        )}
      </div>

      {/* 问题示例 chip */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs text-white/30">试试这些问题：</p>
          <motion.button
            type="button"
            onClick={handleRefresh}
            className="text-xs flex items-center gap-1 transition-colors"
            style={{ color: 'rgba(201,169,110,0.7)' }}
            whileTap={{ scale: 0.9 }}
            whileHover={{ color: '#c9a96e' }}
          >
            <motion.span
              key={refreshKey}
              initial={{ rotate: -180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
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
                  delay: i * 0.05,  // stagger 效果
                  ease: 'easeOut',
                }}
                className="text-sm px-4 py-2 rounded-full border transition-all
                           active:scale-95 whitespace-nowrap"
                style={{
                  background: 'rgba(201,169,110,0.12)',
                  borderColor: 'rgba(201,169,110,0.3)',
                  color: '#c9a96e',
                }}
              >
                <span className="mr-1">{item.category}</span>
                {item.text}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* 提交按钮 */}
      <button
        onClick={handleSubmit}
        disabled={!question.trim()}
        className={`btn-gold text-lg py-3 mt-auto ${
          !question.trim() ? 'opacity-30 pointer-events-none' : ''
        }`}
      >
        🔮 开始抽牌
      </button>

      {/* 隐私提示 */}
      <p className="text-xs text-center pb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>
        🔒 你的问题只保存在你的手机里
      </p>
    </div>
  )
}
