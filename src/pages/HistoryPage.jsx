import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import useHistory from '../hooks/useHistory'

/**
 * 历史记录页
 * 真实数据从 localStorage 读取
 * 空状态 → 引导去抽牌
 * 有记录 → 卡片列表 + 左滑删除 + 清空确认
 */
export default function HistoryPage() {
  const { records, loading, isEmpty, remove, clearAll } = useHistory()
  const [showConfirm, setShowConfirm] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [touchStart, setTouchStart] = useState(null)
  const [swipedId, setSwipedId] = useState(null)

  // 左滑检测
  const handleTouchStart = (e, id) => {
    setTouchStart({ x: e.touches[0].clientX, id })
  }
  const handleTouchEnd = (e, id) => {
    if (!touchStart || touchStart.id !== id) return
    const diff = touchStart.x - e.changedTouches[0].clientX
    if (diff > 60) {
      setSwipedId(id) // 左滑超过 60px → 显示删除
    } else if (diff < -30) {
      setSwipedId(null) // 右滑 → 收起
    }
    setTouchStart(null)
  }

  // 确认删除
  const handleDelete = (id) => {
    setDeletingId(id)
    setTimeout(() => {
      remove(id)
      setDeletingId(null)
      setSwipedId(null)
    }, 300)
  }

  // 确认清空
  const handleClearAll = () => {
    setShowConfirm(false)
    clearAll()
  }

  // 格式化日期
  const formatDate = (isoString) => {
    const d = new Date(isoString)
    const pad = (n) => String(n).padStart(2, '0')
    return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
  }

  return (
    <div className="flex flex-col min-h-screen pt-6 gap-6 px-page">
      {/* 顶栏 */}
      <div className="flex items-center justify-between">
        <Link to="/" className="text-brand-gold text-sm">
          &larr; 返回
        </Link>
        <h1 className="text-xl">📜 我的解读记录</h1>
        <div className="w-10" />
      </div>

      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-white/30">加载中...</p>
        </div>
      )}

      {!loading && isEmpty && (
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
      )}

      {!loading && !isEmpty && (
        /* ===== 记录列表 ===== */
        <>
          <div className="flex-1 flex flex-col gap-3">
            <AnimatePresence>
              {records.map((record) => (
                <motion.div
                  key={record.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 40, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.3 }}
                  onTouchStart={(e) => handleTouchStart(e, record.id)}
                  onTouchEnd={(e) => handleTouchEnd(e, record.id)}
                  className="relative overflow-hidden"
                >
                  {/* 底部删除按钮（左滑露出） */}
                  <motion.div
                    className="absolute right-0 top-0 bottom-0 flex items-center px-4 rounded-r-card"
                    style={{ background: 'rgba(239,68,68,0.15)' }}
                    animate={{
                      x: swipedId === record.id ? 0 : '100%',
                      opacity: swipedId === record.id ? 1 : 0,
                    }}
                  >
                    <button
                      onClick={() => handleDelete(record.id)}
                      className="text-red-400 text-sm font-semibold whitespace-nowrap"
                    >
                      删除
                    </button>
                  </motion.div>

                  {/* 卡片主体 */}
                  <motion.div
                    className="mystic-card flex items-center gap-3 cursor-pointer"
                    animate={{
                      x: swipedId === record.id ? -56 : 0,
                      opacity: deletingId === record.id ? 0.5 : 1,
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    onClick={() => {
                      if (swipedId) {
                        setSwipedId(null) // 点击收起删除
                      }
                      // 第 5 轮后可以加跳转回看
                    }}
                  >
                    {/* 三张小牌缩略图 */}
                    <div className="flex gap-1 shrink-0">
                      {record.cards && record.cards.map((card, i) => (
                        <div
                          key={i}
                          className="w-9 h-13 rounded flex items-center justify-center text-xs"
                          style={{
                            background: 'linear-gradient(135deg, #0d1b3e, #162447)',
                            border: '1px solid rgba(255,255,255,0.08)',
                          }}
                        >
                          🃏
                        </div>
                      ))}
                    </div>

                    {/* 信息 */}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm truncate">{record.question}</p>
                      <p className="text-white/30 text-xs mt-1">
                        {formatDate(record.createdAt)}
                      </p>
                    </div>

                    {/* 箭头 */}
                    <span className="text-white/15 text-sm">→</span>
                  </motion.div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* 清空按钮 */}
          <button
            className="text-sm text-red-400/50 text-center py-2 hover:text-red-400 transition-colors"
            onClick={() => setShowConfirm(true)}
          >
            清空所有记录
          </button>
        </>
      )}

      {/* 清空确认弹窗 */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 px-8"
            style={{ background: 'rgba(0,0,0,0.7)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowConfirm(false)}
          >
            <motion.div
              className="mystic-card w-full max-w-xs text-center gap-4 flex flex-col"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-white text-lg">确定要清空吗？</p>
              <p className="text-white/50 text-sm">
                所有解读记录将被永久删除，此操作不可撤销。
              </p>
              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-2 rounded-card text-sm border border-white/10 text-white/60"
                >
                  取消
                </button>
                <button
                  onClick={handleClearAll}
                  className="flex-1 py-2 rounded-card text-sm bg-red-500/80 text-white font-semibold"
                >
                  清空
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
