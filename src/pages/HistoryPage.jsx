import { Link } from 'react-router-dom'

/**
 * 历史记录页
 * 第 5 轮将加入：localStorage 读取、记录卡片列表、左滑删除、空状态
 */
export default function HistoryPage() {
  return (
    <div className="flex flex-col min-h-screen pt-12 gap-6">
      <Link to="/" className="text-brand-gold text-sm">&larr; 返回首页</Link>

      <h1 className="text-2xl">📜 解读历史</h1>

      {/* 占位：空状态 */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <span className="text-5xl">📭</span>
        <p className="text-white/30 text-center">
          还没有解读记录<br />
          <span className="text-sm">（第 5 轮实现）</span>
        </p>
        <Link to="/" className="btn-gold mt-4">
          去抽第一张牌
        </Link>
      </div>

      {/* 页面导航（开发调试用） */}
      <div className="flex gap-4 text-sm text-white/30 pb-4 justify-center">
        <Link to="/">首页</Link>
        <Link to="/ask">输入</Link>
        <Link to="/shuffle">洗牌</Link>
        <Link to="/reading">解读</Link>
      </div>
    </div>
  )
}
