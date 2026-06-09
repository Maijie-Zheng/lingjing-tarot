import { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import TarotCard from '../components/TarotCard'
import { drawRandomCards } from '../data/tarotCards'

// 三张牌的位置定义
const POSITIONS = [
  { key: 'past',   label: '过去', emoji: '🌙', desc: '影响你的根源' },
  { key: 'present', label: '现在', emoji: '✨', desc: '你当下的状态' },
  { key: 'future',  label: '未来', emoji: '🔮', desc: '趋势与方向' },
]

const STAGE_DURATION = {
  shuffle: 2500,   // 洗牌动画时长
  revealPause: 600, // 每张翻牌后停顿
  finalPause: 800,  // 最后一张翻完后停顿
}

/**
 * 洗牌选牌页 —— 仪式感的核心
 * 阶段 1：洗牌动画（自动）
 * 阶段 2：3×3 网格选 3 张牌
 * 阶段 3：逐张翻牌揭示
 */
export default function ShufflePage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const question = searchParams.get('q') || '未提供问题'

  // 阶段状态：shuffle → select → reveal
  const [stage, setStage] = useState('shuffle')
  const [gridCards] = useState(() => drawRandomCards(9))  // 9 张候选牌
  const [selectedCards, setSelectedCards] = useState([])   // 已选中的牌（含位置）
  const [revealedCount, setRevealedCount] = useState(0)    // 已翻牌数量

  // ===== 阶段 1：洗牌 → 自动进入选牌 =====
  useEffect(() => {
    if (stage !== 'shuffle') return
    const timer = setTimeout(() => setStage('select'), STAGE_DURATION.shuffle)
    return () => clearTimeout(timer)
  }, [stage])

  // ===== 阶段 2：选牌逻辑 =====
  const handleSelectCard = useCallback((card) => {
    setSelectedCards((prev) => {
      // 已选中的牌：点击取消
      const isSelected = prev.find((c) => c.id === card.id)
      if (isSelected) {
        // 取消选中，后面的牌位置前移
        const filtered = prev.filter((c) => c.id !== card.id)
        return filtered.map((c, i) => ({ ...c, position: POSITIONS[i] }))
      }
      // 已满 3 张
      if (prev.length >= 3) return prev
      // 新选中的牌
      const pos = POSITIONS[prev.length]
      return [...prev, { ...card, position: pos, isReversed: Math.random() < 0.3 }]
    })
  }, [])

  // ===== 阶段 3：翻牌序列 =====
  useEffect(() => {
    if (stage !== 'reveal') return
    if (revealedCount >= selectedCards.length) {
      // 全部翻完 → 跳转解读页
      const timer = setTimeout(() => {
        navigate('/reading', {
          state: {
            question,
            cards: selectedCards,
          },
        })
      }, STAGE_DURATION.finalPause)
      return () => clearTimeout(timer)
    }

    // 逐张翻牌
    const timer = setTimeout(() => {
      setRevealedCount((c) => c + 1)
    }, STAGE_DURATION.revealPause)
    return () => clearTimeout(timer)
  }, [stage, revealedCount, selectedCards, question, navigate])

  // ===== 确认选牌 =====
  const handleConfirm = () => {
    if (selectedCards.length !== 3) return
    setStage('reveal')
    setRevealedCount(1) // 立即揭示第一张
  }

  // ===== 判断某张牌是否被选中 =====
  const isCardSelected = (card) => selectedCards.some((c) => c.id === card.id)
  const getSelectionIndex = (card) => {
    const idx = selectedCards.findIndex((c) => c.id === card.id)
    return idx >= 0 ? idx + 1 : null
  }

  return (
    <div className="flex flex-col min-h-screen pt-6 gap-6 px-page">
      {/* 顶栏 */}
      <div className="flex items-center justify-between">
        <Link to="/ask" className="text-brand-gold text-sm">
          &larr; 换问题
        </Link>
        <span className="text-white/30 text-xs capitalize">{stage}</span>
      </div>

      {/* 用户问题 */}
      <div className="mystic-card text-center">
        <p className="text-white/50 text-xs mb-1">你在问</p>
        <p className="text-white/90 text-sm leading-relaxed">{question}</p>
      </div>

      {/* ===== 阶段 1：洗牌动画 ===== */}
      <AnimatePresence mode="wait">
        {stage === 'shuffle' && (
          <motion.div
            key="shuffle"
            className="flex-1 flex flex-col items-center justify-center gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <p className="text-white/50 text-lg">✨ 正在为你洗牌...</p>

            {/* 洗牌动画：5 张牌背交替穿插 */}
            <div className="relative w-full max-w-[280px] h-[160px] flex items-center justify-center">
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  style={{ zIndex: i }}
                  animate={{
                    x: [
                      (i - 2) * 50,
                      (i - 2) * -40 + Math.sin(i) * 30,
                      (i - 2) * 50,
                    ],
                    rotate: [0, i % 2 === 0 ? 8 : -8, 0],
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: i * 0.08,
                  }}
                >
                  <TarotCard size="sm" />
                </motion.div>
              ))}
            </div>

            {/* 进度条 */}
            <div className="w-48 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: '#c9a96e' }}
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: STAGE_DURATION.shuffle / 1000, ease: 'linear' }}
              />
            </div>
          </motion.div>
        )}

        {/* ===== 阶段 2：选牌 ===== */}
        {stage === 'select' && (
          <motion.div
            key="select"
            className="flex-1 flex flex-col gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* 引导文字 */}
            <div className="text-center">
              <p className="text-white/60 text-sm">
                {selectedCards.length === 0
                  ? '请凭直觉，选出 3 张牌'
                  : `已选 ${selectedCards.length} / 3`}
              </p>
              {/* 当前选择提示 */}
              {selectedCards.length < 3 && (
                <p className="text-brand-gold text-xs mt-1">
                  {POSITIONS[selectedCards.length]?.emoji} 第 {selectedCards.length + 1} 张：代表「{POSITIONS[selectedCards.length]?.label}」——{POSITIONS[selectedCards.length]?.desc}
                </p>
              )}
            </div>

            {/* 3×3 牌阵 */}
            <div className="grid grid-cols-3 gap-y-4 gap-x-2 place-items-center mx-auto">
              {gridCards.map((card) => {
                const selected = isCardSelected(card)
                const index = getSelectionIndex(card)
                const isFull = selectedCards.length >= 3 && !selected

                return (
                  <motion.div
                    key={card.id}
                    className="relative"
                    whileHover={!isFull ? { scale: 1.05 } : {}}
                    whileTap={!isFull ? { scale: 0.95 } : {}}
                    onClick={() => handleSelectCard(card)}
                  >
                    <TarotCard
                      size="sm"
                      selected={selected}
                      disabled={isFull}
                    />
                    {/* 选中序号角标 */}
                    {index && (
                      <motion.div
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                        style={{ background: '#c9a96e' }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                      >
                        {index}
                      </motion.div>
                    )}
                  </motion.div>
                )
              })}
            </div>

            {/* 已选牌概览 + 确认按钮 */}
            <div className="flex flex-col gap-3 mt-auto">
              {selectedCards.length > 0 && (
                <div className="flex justify-center gap-2">
                  {selectedCards.map((card, i) => (
                    <div key={card.id} className="text-center">
                      <div className="w-12 h-18 rounded flex items-center justify-center text-xs"
                        style={{ background: 'linear-gradient(135deg, #0d1b3e, #162447)', border: '1px solid rgba(201,169,110,0.4)' }}>
                        🃏
                      </div>
                      <span className="text-xs text-brand-gold">{card.position?.label}</span>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={handleConfirm}
                disabled={selectedCards.length !== 3}
                className={`btn-gold text-lg py-3 ${
                  selectedCards.length === 3 ? '' : 'opacity-30 pointer-events-none'
                }`}
              >
                {selectedCards.length === 3 ? '🔮 确认这三张牌' : `请选 ${3 - selectedCards.length} 张牌`}
              </button>
            </div>
          </motion.div>
        )}

        {/* ===== 阶段 3：翻牌揭示 ===== */}
        {stage === 'reveal' && (
          <motion.div
            key="reveal"
            className="flex-1 flex flex-col items-center justify-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-white/40 text-sm mb-2">牌面正在揭示...</p>

            <div className="flex gap-3 justify-center">
              {selectedCards.map((card, i) => {
                const isRevealed = i < revealedCount

                return (
                  <motion.div
                    key={card.id}
                    className="flex flex-col items-center gap-2"
                    layout
                  >
                    {/* 3D 翻转容器 */}
                    <motion.div
                      style={{
                        width: 100,
                        height: 150,
                        perspective: 600,
                      }}
                    >
                      <motion.div
                        className="relative w-full h-full"
                        animate={{ rotateY: isRevealed ? 180 : 0 }}
                        transition={{ duration: 0.6, ease: 'easeInOut' }}
                        style={{
                          transformStyle: 'preserve-3d',
                        }}
                      >
                        {/* 牌背 */}
                        <div
                          className="absolute inset-0 rounded-card overflow-hidden"
                          style={{ backfaceVisibility: 'hidden' }}
                        >
                          <div
                            className="w-full h-full flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, #0d1b3e, #162447)', border: '2px solid rgba(255,255,255,0.1)' }}
                          >
                            <div className="text-brand-gold/60 text-2xl">✦</div>
                          </div>
                        </div>

                        {/* 牌面（翻转后） */}
                        <div
                          className="absolute inset-0 rounded-card overflow-hidden flex flex-col items-center justify-center gap-2 p-3 text-center"
                          style={{
                            backfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)',
                            background: 'linear-gradient(135deg, #1e1050, #1a0a2e)',
                            border: '2px solid rgba(201,169,110,0.3)',
                          }}
                        >
                          <span className="text-xl">🃏</span>
                          <span className="text-sm font-serif text-brand-gold leading-tight">
                            {card.name}
                          </span>
                          {card.isReversed && (
                            <span className="text-xs text-red-400">(逆位)</span>
                          )}
                        </div>
                      </motion.div>
                    </motion.div>

                    {/* 位置标签 */}
                    <motion.div
                      className="text-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: isRevealed ? 1 : 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <span className="text-xs text-brand-gold">
                        {card.position?.emoji} {card.position?.label}
                      </span>
                    </motion.div>
                  </motion.div>
                )
              })}
            </div>

            {/* 揭示进度提示 */}
            <p className="text-white/30 text-xs mt-4">
              {revealedCount < selectedCards.length
                ? `正在揭示第 ${revealedCount + 1} 张...`
                : '即将进入解读...'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
