import { Link } from 'react-router-dom'

/**
 * 首页 —— 灵境入口
 * 第 2 轮将加入：星空背景动画、中央塔罗牌视觉、CTA 按钮
 */
export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center gap-6">
      <h1 className="text-3xl">🔮 灵境</h1>
      <p className="text-white/60">AI 塔罗解读 · 懂你的心事</p>

      <Link to="/ask" className="btn-gold">
        开始抽牌
      </Link>

      <div className="flex gap-4 mt-4">
        <Link to="/history" className="text-brand-gold text-sm underline">
          历史记录
        </Link>
      </div>
    </div>
  )
}
