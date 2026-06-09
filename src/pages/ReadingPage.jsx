import { Link } from 'react-router-dom'

/**
 * 解读结果页
 * 第 4 轮将加入：AI 解读逐段显示、LoadingSpinner、三牌缩略图、行动建议
 */
export default function ReadingPage() {
  return (
    <div className="flex flex-col min-h-screen pt-12 gap-6">
      <Link to="/shuffle" className="text-brand-gold text-sm">&larr; 重新抽牌</Link>

      <h1 className="text-2xl text-center">✨ 你的解读</h1>

      {/* 占位：三张牌缩略图 */}
      <div className="flex justify-center gap-3">
        {['过去', '现在', '未来'].map((pos) => (
          <div key={pos} className="mystic-card w-20 h-28 flex flex-col items-center justify-center gap-1">
            <span className="text-2xl">🃏</span>
            <span className="text-white/40 text-xs">{pos}</span>
          </div>
        ))}
      </div>

      {/* 占位：解读文字区域 */}
      <div className="mystic-card w-full flex-1">
        <p className="text-white/30 text-center leading-relaxed">
          AI 解读文字将在这里逐段显示...<br />
          <span className="text-sm">（第 4 轮实现）</span>
        </p>
      </div>

      {/* 占位：行动建议 */}
      <div className="flex flex-col gap-2 mb-8">
        <button className="btn-gold">📤 分享卡片</button>
        <Link to="/history" className="text-center text-brand-gold text-sm underline">
          查看历史记录
        </Link>
      </div>

      {/* 页面导航（开发调试用） */}
      <div className="flex gap-4 text-sm text-white/30 pb-4 justify-center">
        <Link to="/">首页</Link>
        <Link to="/ask">输入</Link>
        <Link to="/shuffle">洗牌</Link>
        <Link to="/history">历史</Link>
      </div>
    </div>
  )
}
