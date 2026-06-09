import { Link, useLocation } from 'react-router-dom'
import TarotCard from '../components/TarotCard'

/**
 * 解读结果页
 * 接收 ShufflePage 传来的 question + cards
 * 第 4 轮将加入：AI 解读逐段显示、LoadingSpinner、行动建议
 */
export default function ReadingPage() {
  const location = useLocation()
  const { question, cards } = location.state || {
    question: '未提供问题',
    cards: [],
  }

  const hasCards = cards && cards.length === 3

  return (
    <div className="flex flex-col min-h-screen pt-6 gap-6">
      <Link to="/shuffle" className="text-brand-gold text-sm px-page">
        &larr; 重新抽牌
      </Link>

      {/* 用户问题回顾 */}
      <div className="px-page text-center">
        <p className="text-white/50 text-xs">你问的是</p>
        <p className="text-white/90 mt-1 leading-relaxed">「{question}」</p>
      </div>

      {/* 三张牌缩略图 */}
      {hasCards && (
        <div className="flex justify-center gap-3 px-page">
          {cards.map((card, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <TarotCard
                card={card}
                size="sm"
              />
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
        </div>
      )}

      {/* 分隔线 */}
      <div className="mx-page h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.3), transparent)' }} />

      {/* 解读区域（第 4 轮实现） */}
      <div className="flex-1 flex flex-col items-center justify-center px-page gap-4">
        <span className="text-5xl">🔮</span>
        <p className="text-white/30 text-center leading-relaxed">
          {hasCards
            ? 'AI 解读文字将在这里逐段显示...'
            : '请先从洗牌选牌页进入'}
        </p>
        {!hasCards && (
          <Link to="/shuffle" className="btn-gold mt-4">
            去抽牌
          </Link>
        )}
      </div>

      {/* 操作按钮（第 4 轮实现完整功能） */}
      {hasCards && (
        <div className="flex flex-col gap-3 px-page pb-6">
          <button className="btn-gold">📤 分享卡片</button>
          <div className="flex gap-4 justify-center">
            <button className="text-sm text-brand-gold/60">💾 保存</button>
            <Link to="/history" className="text-sm text-brand-gold/60">
              📜 历史记录
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
