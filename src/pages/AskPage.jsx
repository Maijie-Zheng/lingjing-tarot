import { useState, useRef, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'

/**
 * 问题输入页
 * 让用户舒服地说出心事：引导文案 + 大输入框 + 示例 chip + 隐私提示
 */

// 问题示例库（PRD 规定 8 条，每次随机显示 5 条）
const EXAMPLE_QUESTIONS = [
  '他对我到底是什么感觉？',
  '我该不该接受这个 offer？',
  '最近的整体运势怎么样？',
  '这段关系应该继续还是放手？',
  '为什么我总觉得很焦虑？',
  '我适合现在转行吗？',
  '接下来三个月有什么需要注意的？',
  '我和 TA 能走到一起吗？',
]

/** 每次随机选 5 条 */
function pickExamples() {
  const shuffled = [...EXAMPLE_QUESTIONS].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 5)
}

export default function AskPage() {
  const [question, setQuestion] = useState('')
  const [examples] = useState(() => pickExamples())
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
        <p className="text-xs text-white/30 mb-1">试试这些问题：</p>
        <div className="flex flex-wrap gap-2">
          {examples.map((text, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleChipClick(text)}
              className="text-sm px-4 py-2 rounded-full border transition-all
                         active:scale-95 whitespace-nowrap"
              style={{
                background: 'rgba(201,169,110,0.12)',
                borderColor: 'rgba(201,169,110,0.3)',
                color: '#c9a96e',
              }}
            >
              {text}
            </button>
          ))}
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
