import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

/**
 * 问题输入页
 * 第 2 轮将加入：输入框 UI 细化、Chip 快捷标签、隐私提示
 */
export default function AskPage() {
  const [question, setQuestion] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (question.trim()) {
      // 将问题通过 URL 参数传到洗牌页
      navigate(`/shuffle?q=${encodeURIComponent(question.trim())}`)
    }
  }

  return (
    <div className="flex flex-col min-h-screen pt-12 gap-6">
      {/* 返回 */}
      <Link to="/" className="text-brand-gold text-sm">&larr; 返回首页</Link>

      <h1 className="text-2xl">你想问什么？</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="比如：他对我是什么感觉？"
          rows={3}
          className="w-full bg-white/5 border border-white/10 rounded-card p-4 text-white
                     placeholder:text-white/30 focus:outline-none focus:border-brand-gold/50
                     resize-none"
        />

        <button type="submit" className="btn-gold" disabled={!question.trim()}>
          开始洗牌
        </button>
      </form>

      {/* 页面导航（开发调试用） */}
      <div className="mt-auto pb-8 flex gap-4 text-sm text-white/30">
        <Link to="/">首页</Link>
        <Link to="/shuffle">洗牌页</Link>
        <Link to="/reading">解读页</Link>
        <Link to="/history">历史</Link>
      </div>
    </div>
  )
}
