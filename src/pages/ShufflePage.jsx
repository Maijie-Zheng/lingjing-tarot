import { Link, useSearchParams } from 'react-router-dom'

/**
 * 洗牌选牌页 —— 核心交互页面
 * 第 3 轮将加入：洗牌动画、CardGrid 9 张牌背选择、翻牌序列
 */
export default function ShufflePage() {
  const [searchParams] = useSearchParams()
  const question = searchParams.get('q') || '未提供问题'

  return (
    <div className="flex flex-col items-center min-h-screen pt-12 gap-6">
      <Link to="/ask" className="text-brand-gold text-sm self-start">&larr; 换一个问题</Link>

      <h1 className="text-2xl text-center">洗牌 & 选牌</h1>

      {/* 显示用户问题 */}
      <div className="mystic-card w-full text-center">
        <p className="text-white/50 text-sm">你问的是</p>
        <p className="text-white mt-1">{question}</p>
      </div>

      {/* 占位：第 3 轮实现 */}
      <div className="flex-1 flex items-center justify-center w-full">
        <p className="text-white/30 text-center">
          🃏 洗牌动画 + 选牌区域<br />
          <span className="text-sm">（第 3 轮实现）</span>
        </p>
      </div>

      {/* 临时：模拟跳转到解读页 */}
      <Link to="/reading" className="btn-gold mb-8">
        模拟完成选牌 → 查看解读
      </Link>

      {/* 页面导航（开发调试用） */}
      <div className="flex gap-4 text-sm text-white/30 pb-4">
        <Link to="/">首页</Link>
        <Link to="/ask">输入</Link>
        <Link to="/reading">解读</Link>
        <Link to="/history">历史</Link>
      </div>
    </div>
  )
}
