import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Moon, Sparkles } from 'lucide-react'
import useHistory from '../hooks/useHistory'
import TarotCard from '../components/TarotCard'
import ReadingText from '../components/ReadingText'

/**
 * 历史记录页 —— P0-11 升级
 *
 * - 磨砂玻璃卡片 + 真实牌面缩略图（TarotCard size="sm"）
 * - 点击卡片内联展开完整解读（ReadingText speed=0 即时显示）
 * - Framer Motion drag 左滑删除（跟手拖拽）
 * - 空状态呼吸动画 + 诗意文案
 * - 顶栏品牌化（无 emoji 标题）
 * - 分页加载：每次 20 条，避免过多 DOM 导致旧记录图片加载失败
 */
export default function HistoryPage() {
  const { records, loading, isEmpty, remove, clearAll } = useHistory()
  const PAGE_SIZE = 20
  const [showConfirm, setShowConfirm] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [swipedId, setSwipedId] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  // 重置分页（清空后）
  const resetPagination = () => setVisibleCount(PAGE_SIZE)

  // ===== 加载更多 =====
  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, records.length))
  }

  const visibleRecords = records.slice(0, visibleCount)
  const hasMore = visibleCount < records.length

  // ===== 删除单条 =====
  const handleDelete = (id) => {
    setDeletingId(id)
    setTimeout(() => {
      remove(id)
      setDeletingId(null)
      setSwipedId(null)
      if (expandedId === id) setExpandedId(null)
    }, 300)
  }

  // ===== 展开 / 收起 =====
  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id))
    setSwipedId(null)
  }

  // ===== 清空全部 =====
  const handleClearAll = () => {
    setShowConfirm(false)
    setExpandedId(null)
    resetPagination()
    clearAll()
  }

  // ===== 格式化日期 =====
  const formatDate = (isoString) => {
    const d = new Date(isoString)
    const pad = (n) => String(n).padStart(2, '0')
    return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
  }

  return (
    <div className="flex flex-col min-h-screen pt-6 gap-5 px-page">
      {/* ===== 顶栏 ===== */}
      <div className="flex items-center justify-between">
        <Link to="/" className="text-brand-gold text-sm">
          &larr; 返回
        </Link>
        <h1 className="text-white font-serif text-lg">我的解读记录</h1>
        <span className="text-white/25 text-xs w-10 text-right">
          {!loading && !isEmpty ? `${records.length} 条` : ''}
        </span>
      </div>

      {/* ===== 加载中 ===== */}
      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-white/30">加载中...</p>
        </div>
      )}

      {/* ===== 空状态 ===== */}
      {!loading && isEmpty && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 -mt-12">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Moon size={48} strokeWidth={1.2} className="text-white/20" aria-hidden />
          </motion.div>
          <div className="text-center">
            <p className="text-white/50 text-lg">还没有解读记录</p>
            <p className="text-white/25 text-sm mt-2 leading-relaxed">
              每一次塔罗解读，
              <br />
              都是一次与内心的对话。
            </p>
          </div>
          <Link to="/" className="btn-gold flex items-center gap-1.5">
            <Sparkles size={16} strokeWidth={1.6} aria-hidden />
            开始第一次抽牌
          </Link>
        </div>
      )}

      {/* ===== 记录列表 ===== */}
      {!loading && !isEmpty && (
        <>
          <div className="flex-1 flex flex-col gap-3">
            <AnimatePresence>
              {visibleRecords.map((record) => {
                const isExpanded = expandedId === record.id
                const isSwiped = swipedId === record.id
                const isDeleting = deletingId === record.id

                return (
                  <motion.div
                    key={record.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: isDeleting ? 0.4 : 1, y: 0 }}
                    exit={{ opacity: 0, x: 40, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.3 }}
                    className="relative overflow-hidden rounded-card"
                  >
                    {/* 底部删除按钮（卡片左滑后露出） */}
                    <div
                      className="absolute right-0 top-0 bottom-0 flex items-center px-4 rounded-r-card"
                      style={{ background: 'rgba(239,68,68,0.12)' }}
                    >
                      <button
                        onClick={() => handleDelete(record.id)}
                        className="text-red-400 text-sm font-semibold whitespace-nowrap"
                      >
                        删除
                      </button>
                    </div>

                    {/* 可拖拽卡片主体 */}
                    <motion.div
                      className="rounded-card relative cursor-pointer"
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        border: isExpanded
                          ? '1px solid rgba(201,169,110,0.2)'
                          : '1px solid rgba(255,255,255,0.06)',
                        boxShadow: isExpanded
                          ? '0 0 20px rgba(201,169,110,0.08), inset 0 1px 0 rgba(255,255,255,0.03)'
                          : 'inset 0 1px 0 rgba(255,255,255,0.02)',
                      }}
                      drag="x"
                      dragConstraints={{ left: -80, right: 0 }}
                      dragElastic={0.08}
                      onDragEnd={(_, info) => {
                        if (info.offset.x < -40) setSwipedId(record.id)
                        else if (info.offset.x > 20) setSwipedId(null)
                      }}
                      animate={{ x: isSwiped ? -56 : 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      onClick={() => {
                        if (isSwiped) {
                          setSwipedId(null)
                          return
                        }
                        toggleExpand(record.id)
                      }}
                    >
                      {/* === 卡片头部：缩略图 + 信息 === */}
                      <div className="flex items-center gap-3 p-3">
                        {/* 三张牌缩略图（真实牌面） */}
                        <div className="flex gap-1 shrink-0">
                          {record.cards && record.cards.length > 0 ? (
                            record.cards.map((card, i) => (
                              <TarotCard key={i} card={card} size="sm" />
                            ))
                          ) : (
                            <div
                              className="w-9 h-13 rounded flex items-center justify-center"
                              style={{
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.08)',
                              }}
                            >
                              <Moon size={16} strokeWidth={1.2} className="text-white/15" aria-hidden />
                            </div>
                          )}
                        </div>

                        {/* 问题 + 日期 */}
                        <div className="flex-1 min-w-0">
                          <p className="text-white/85 text-sm truncate">
                            {record.question}
                          </p>
                          <p className="text-white/25 text-xs mt-1">
                            {formatDate(record.createdAt)}
                          </p>
                        </div>

                        {/* 展开箭头 */}
                        <motion.span
                          className="text-brand-gold/40 text-sm flex-shrink-0"
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.25 }}
                        >
                          ▼
                        </motion.span>
                      </div>

                      {/* === 展开区：完整解读回看 === */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.35, ease: 'easeOut' }}
                            className="overflow-hidden"
                          >
                            <div className="px-3 pb-4">
                              {/* 金色渐变分隔线 */}
                              <div
                                className="h-px mb-4"
                                style={{
                                  background:
                                    'linear-gradient(90deg, transparent, rgba(201,169,110,0.2), transparent)',
                                }}
                              />

                              {/* 解读内容（speed=0 一次性全显示） */}
                              {record.reading ? (
                                <ReadingText
                                  rawText={record.reading}
                                  cards={record.cards || null}
                                  speed={0}
                                />
                              ) : (
                                <p className="text-white/25 text-sm text-center py-4">
                                  解读内容已丢失
                                </p>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>

          {/* ===== 加载更多 ===== */}
          {hasMore && (
            <button
              onClick={handleLoadMore}
              className="text-sm text-center py-2.5 rounded-card transition-colors"
              style={{
                color: 'rgba(201,169,110,0.6)',
                border: '1px solid rgba(201,169,110,0.15)',
                background: 'rgba(255,255,255,0.02)',
              }}
              onMouseEnter={(e) => {
                e.target.style.color = '#c9a96e'
                e.target.style.borderColor = 'rgba(201,169,110,0.35)'
              }}
              onMouseLeave={(e) => {
                e.target.style.color = 'rgba(201,169,110,0.6)'
                e.target.style.borderColor = 'rgba(201,169,110,0.15)'
              }}
            >
              加载更多（还有 {records.length - visibleCount} 条）
            </button>
          )}

          {/* ===== 清空按钮 ===== */}
          <button
            className="text-sm text-red-400/40 text-center py-2 hover:text-red-400/70 transition-colors"
            onClick={() => setShowConfirm(true)}
          >
            清空所有记录
          </button>
        </>
      )}

      {/* ===== 清空确认弹窗 ===== */}
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
              className="rounded-card w-full max-w-xs text-center gap-4 flex flex-col px-5 py-6"
              style={{
                background: 'rgba(30,10,50,0.95)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 0 40px rgba(139,92,246,0.15)',
              }}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-white text-lg font-serif">确定要清空吗？</p>
              <p className="text-white/45 text-sm leading-relaxed">
                所有解读记录将被永久删除，此操作不可撤销。
              </p>
              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-2.5 rounded-card text-sm border border-white/8 text-white/50 hover:text-white/70 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleClearAll}
                  className="flex-1 py-2.5 rounded-card text-sm font-semibold text-white transition-colors"
                  style={{
                    background: 'rgba(239,68,68,0.6)',
                  }}
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
