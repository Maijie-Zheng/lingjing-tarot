import { Link } from 'react-router-dom'

/**
 * 历史记录页
 * 空状态：引导文案 + 去抽牌按钮
 * 有记录时：卡片列表（第 5 轮实现真实数据）
 */

// 占位：模拟记录数据（第 5 轮替换为 localStorage 真实数据）
const MOCK_RECORDS = [] // 改为空数组 = 空状态；第 5 轮删掉这行

export default function HistoryPage() {
  const records = MOCK_RECORDS
  const isEmpty = records.length === 0

  return (
    <div className="flex flex-col min-h-screen pt-6 gap-6 px-page">
      {/* 顶栏 */}
      <div className="flex items-center justify-between">
        <Link to="/" className="text-brand-gold text-sm">
          &larr; 返回
        </Link>
        <h1 className="text-xl">📜 我的解读记录</h1>
        {/* 占位，保持标题居中 */}
        <div className="w-10" />
      </div>

      {isEmpty ? (
        /* ===== 空状态 ===== */
        <div className="flex-1 flex flex-col items-center justify-center gap-6 -mt-12">
          <span className="text-6xl">🌙</span>
          <div className="text-center">
            <p className="text-white/40 text-lg">还没有解读记录</p>
            <p className="text-white/25 text-sm mt-2">去算一次吧，塔罗牌在等你</p>
          </div>
          <Link to="/" className="btn-gold">
            ✨ 开始抽牌
          </Link>
        </div>
      ) : (
        /* ===== 记录列表 ===== */
        <div className="flex flex-col gap-4 flex-1">
          {records.map((record) => (
            <Link
              key={record.id}
              to={`/reading?id=${record.id}`}
              className="mystic-card flex items-center gap-4 active:scale-[0.98] transition-transform"
            >
              {/* 三张小牌缩略图 */}
              <div className="flex gap-1 shrink-0">
                {record.cards.map((card, i) => (
                  <div
                    key={i}
                    className="w-10 h-14 rounded flex items-center justify-center text-sm"
                    style={{ background: 'linear-gradient(135deg, #0d1b3e, #162447)' }}
                  >
                    🃏
                  </div>
                ))}
              </div>

              {/* 信息 */}
              <div className="flex-1 min-w-0">
                <p className="text-white truncate">{record.question}</p>
                <p className="text-white/30 text-xs mt-1">{record.createdAt}</p>
              </div>

              {/* 箭头 */}
              <span className="text-white/20 text-lg">→</span>
            </Link>
          ))}
        </div>
      )}

      {/* 清空按钮（有记录时显示） */}
      {!isEmpty && (
        <button
          className="text-sm text-red-400/60 text-center pb-4 hover:text-red-400 transition-colors"
          onClick={() => {
            if (window.confirm('确定要清空所有记录吗？此操作不可撤销')) {
              // 第 5 轮实现
            }
          }}
        >
          清空所有记录
        </button>
      )}
    </div>
  )
}
