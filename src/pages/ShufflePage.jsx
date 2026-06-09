import { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import TarotCard from '../components/TarotCard'
import CardCarousel from '../components/CardCarousel'
import tarotCards from '../data/tarotCards'

// 三张牌的位置定义
const POSITIONS = [
  { key: 'past',   label: '过去', emoji: '🌙' },
  { key: 'present', label: '现在', emoji: '✨' },
  { key: 'future',  label: '未来', emoji: '🔮' },
]

const SHUFFLE_DURATION = 1500  // 洗牌动画 1.5s
const FINAL_PAUSE = 1000       // 选满后停顿 1s

/**
 * 洗牌选牌页 —— P0-3 重做：滚动轮播 + 选即翻
 *
 * 阶段 1：洗牌动画（1.5s）
 * 阶段 2：CardCarousel 滚动选牌 + 底部已选区
 * 选满 3 张 → 1s 停顿 → 跳转解读页
 */
export default function ShufflePage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const question = searchParams.get('q') || '未提供问题'

  const [stage, setStage] = useState('shuffle')
  const [selectedCards, setSelectedCards] = useState([])
  const [justFlipped, setJustFlipped] = useState(null) // 刚翻的牌 id（触发飞入动画）

  // ===== 阶段 1：洗牌 → 自动进入选牌 =====
  useEffect(() => {
    if (stage !== 'shuffle') return
    const timer = setTimeout(() => setStage('select'), SHUFFLE_DURATION)
    return () => clearTimeout(timer)
  }, [stage])

  // ===== 选中一张牌 =====
  const handleSelectCard = useCallback((card) => {
    setSelectedCards((prev) => {
      if (prev.length >= 3) return prev
      const newCard = {
        ...card,
        position: POSITIONS[prev.length],
        isReversed: Math.random() < 0.3,
      }
      return [...prev, newCard]
    })
    setJustFlipped(card.id)
    setTimeout(() => setJustFlipped(null), 600)
  }, [])

  // ===== 选满 3 张 → 跳转解读页 =====
  useEffect(() => {
    if (selectedCards.length < 3) return
    const timer = setTimeout(() => {
      navigate('/reading', {
        state: { question, cards: selectedCards },
      })
    }, FINAL_PAUSE)
    return () => clearTimeout(timer)
  }, [selectedCards.length, selectedCards, question, navigate])

  return (
    <div className="flex flex-col min-h-screen pt-6 gap-4 px-page">
      {/* 顶栏 */}
      <div className="flex items-center justify-between">
        <Link to="/ask" className="text-brand-gold text-sm">
          &larr; 换问题
        </Link>
      </div>

      {/* 用户问题 */}
      <div className="mystic-card text-center">
        <p className="text-white/50 text-xs mb-1">你在问</p>
        <p className="text-white/90 text-sm leading-relaxed">{question}</p>
      </div>

      <AnimatePresence mode="wait">
        {/* ===== 阶段 1：洗牌动画 ===== */}
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
                transition={{ duration: SHUFFLE_DURATION / 1000, ease: 'linear' }}
              />
            </div>
          </motion.div>
        )}

        {/* ===== 阶段 2：滚动选牌 ===== */}
        {stage === 'select' && (
          <motion.div
            key="select"
            className="flex-1 flex flex-col gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* 引导文字 */}
            <div className="text-center">
              <p className="text-white/60 text-sm">
                {selectedCards.length === 0
                  ? '滑动浏览，凭直觉选出 3 张牌'
                  : `已选 ${selectedCards.length} / 3`}
              </p>
              {selectedCards.length < 3 && (
                <p className="text-brand-gold text-xs mt-1">
                  {POSITIONS[selectedCards.length]?.emoji} 第 {selectedCards.length + 1} 张：代表「{POSITIONS[selectedCards.length]?.label}」
                </p>
              )}
            </div>

            {/* 牌轮播 */}
            <div className="flex-1 flex items-center -mx-page">
              <CardCarousel
                cards={tarotCards}
                selectedCards={selectedCards}
                onSelect={handleSelectCard}
                maxSelect={3}
              />
            </div>

            {/* 底部：已选牌位 */}
            <div className="flex justify-center gap-3 pb-2">
              {POSITIONS.map((pos, i) => {
                const card = selectedCards[i]
                return (
                  <motion.div
                    key={pos.key}
                    className="flex flex-col items-center gap-1"
                    layout
                  >
                    {/* 牌槽 */}
                    <motion.div
                      className="rounded-card flex items-center justify-center"
                      style={{
                        width: 72,
                        height: 108,
                        background: card
                          ? 'transparent'
                          : 'rgba(255,255,255,0.05)',
                        border: card
                          ? '2px solid rgba(201,169,110,0.4)'
                          : '1px dashed rgba(255,255,255,0.15)',
                      }}
                    >
                      {card ? (
                        <motion.div
                          className="w-full h-full rounded-card overflow-hidden"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                        >
                          <TarotCard
                            card={card}
                            size="sm"
                          />
                        </motion.div>
                      ) : (
                        <span className="text-white/15 text-lg">{pos.emoji}</span>
                      )}
                    </motion.div>
                    {/* 位置标签 */}
                    <span className="text-xs text-brand-gold">{pos.label}</span>
                  </motion.div>
                )
              })}
            </div>

            {/* 选满提示 */}
            <AnimatePresence>
              {selectedCards.length === 3 && (
                <motion.p
                  className="text-center text-brand-gold text-sm"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  ✨ 命运之牌已揭示，即将进入解读...
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
