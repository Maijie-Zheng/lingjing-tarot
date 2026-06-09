import { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import TarotCard from '../components/TarotCard'
import CardCarousel from '../components/CardCarousel'
import tarotCards from '../data/tarotCards'

// 三张牌的位置定义（P0-8 诗意标签升级）
const POSITIONS = [
  { key: 'past',    label: '过去 · 溯源', emoji: '🌙' },
  { key: 'present', label: '现在 · 当下', emoji: '✨' },
  { key: 'future',  label: '未来 · 趋势', emoji: '🌟' },
]

// 进度文案（根据已选数量动态切换）
const PROGRESS_TEXTS = [
  '指尖轻滑，凭心指引，选出属于你的三张牌',
  '🌙 第一张已感应，再选「现在 · 当下」',
  '✨ 第二张已感应，最后选「未来 · 趋势」',
]

const SHUFFLE_DURATION = 1500  // 洗牌动画 1.5s
const MEDITATE_DURATION = 3000 // 静心引导 3s

/**
 * 洗牌选牌页 —— P0-8 升级
 *
 * 阶段流程：静心引导 → 洗牌动画 → 选牌 → 星光汇聚 → 白屏过渡 → 解读页
 * 视觉：磨砂玻璃卡槽 + 景深轮播 + 牌背星盘 + 诗意文案
 */
export default function ShufflePage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const question = searchParams.get('q') || '未提供问题'

  const [stage, setStage] = useState('meditate')   // meditate → shuffle → select
  const [selectedCards, setSelectedCards] = useState([])
  const [justFlipped, setJustFlipped] = useState(null)     // 刚翻的牌 id
  const [convergeSlot, setConvergeSlot] = useState(null)   // 正在汇聚到哪个卡槽
  const [isTransitioning, setIsTransitioning] = useState(false)

  // ===== 阶段 0：静心引导 → 自动进入洗牌 =====
  const skipMeditate = useCallback(() => {
    setStage('shuffle')
  }, [])

  useEffect(() => {
    if (stage !== 'meditate') return
    const timer = setTimeout(() => setStage('shuffle'), MEDITATE_DURATION)
    return () => clearTimeout(timer)
  }, [stage])

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
        isReversed: Math.random() < 0.5,
      }
      // 触发卡槽星点汇聚
      setConvergeSlot(prev.length)
      setTimeout(() => setConvergeSlot(null), 500)
      return [...prev, newCard]
    })
    setJustFlipped(card.id)
    setTimeout(() => setJustFlipped(null), 600)
  }, [])

  // ===== 选满 3 张 → 星光过渡 → 跳转解读页 =====
  useEffect(() => {
    if (selectedCards.length < 3) return
    const timer = setTimeout(() => {
      setIsTransitioning(true)
      setTimeout(() => {
        navigate('/reading', {
          state: { question, cards: selectedCards },
        })
      }, 600) // 白屏扩散后跳转
    }, 800)    // 先让用户看到三张已选
    return () => clearTimeout(timer)
  }, [selectedCards.length, selectedCards, question, navigate])

  // ===== 槽位配置（渲染用）=====
  const slotConfigs = POSITIONS.map((pos, i) => {
    const card = selectedCards[i]
    const isConverging = convergeSlot === i
    return { ...pos, card, index: i, isConverging }
  })

  return (
    <div className="flex flex-col min-h-screen pt-6 gap-4 px-page relative">
      {/* ===== 静心引导遮罩（覆盖整个页面）===== */}
      <AnimatePresence>
        {stage === 'meditate' && (
          <motion.div
            key="meditate-overlay"
            className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8"
            style={{ background: 'rgba(0,0,0,0.55)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* 呼吸文字 */}
            <motion.p
              className="text-white/80 text-lg text-center px-10 font-serif leading-relaxed"
              animate={{ opacity: [0.35, 0.8, 0.35] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              请闭上眼睛，深呼吸
              <br />
              在心中默念你的问题…
            </motion.p>

            {/* 跳过按钮 */}
            <motion.button
              onClick={skipMeditate}
              className="text-white/30 text-sm mt-4"
              whileHover={{ color: 'rgba(255,255,255,0.6)' }}
              whileTap={{ scale: 0.95 }}
            >
              跳过 →
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== 顶栏 ===== */}
      <div className="flex items-center justify-between">
        <Link
          to="/ask"
          className="text-sm transition-colors"
          style={{ color: 'rgba(201,169,110,0.7)' }}
          onMouseEnter={(e) => (e.target.style.color = '#c9a96e')}
          onMouseLeave={(e) => (e.target.style.color = 'rgba(201,169,110,0.7)')}
        >
          &larr; 换问题
        </Link>
      </div>

      {/* ===== "你在问" 磨砂玻璃卡片（和 AskPage 输入框风格统一）===== */}
      <motion.div
        className="rounded-card px-4 py-3 text-center"
        style={{
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)',
        }}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <p className="text-white/30 text-xs mb-1">你在问</p>
        <p className="text-white/80 text-sm leading-relaxed">{question}</p>
      </motion.div>

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
            <p className="text-white/50 text-lg">✨ 灵境正在为你洗牌...</p>

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

            {/* 进度条（品牌金色渐变） */}
            <div
              className="w-48 h-1 rounded-full overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.1)' }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg, rgba(201,169,110,0.4), #c9a96e)',
                }}
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
            {/* 进度引导文字（动态切换） */}
            <div className="text-center min-h-[40px] flex flex-col justify-center">
              <AnimatePresence mode="wait">
                {selectedCards.length < 3 ? (
                  <motion.p
                    key={`progress-${selectedCards.length}`}
                    className="text-white/60 text-sm"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.25 }}
                  >
                    {PROGRESS_TEXTS[selectedCards.length]}
                  </motion.p>
                ) : (
                  <motion.p
                    key="complete"
                    className="text-brand-gold text-sm"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    🌟 三张已齐聚，命运之牌已揭示...
                  </motion.p>
                )}
              </AnimatePresence>
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

            {/* 底部：已选卡槽（磨砂玻璃风格） */}
            <div className="flex justify-center gap-3 pb-2">
              {slotConfigs.map((slot) => {
                const { card, emoji, label, index, isConverging } = slot
                const isFilled = !!card

                return (
                  <motion.div
                    key={POSITIONS[index].key}
                    className="flex flex-col items-center gap-1.5"
                    layout
                  >
                    {/* 卡槽 */}
                    <motion.div
                      className="rounded-card flex items-center justify-center overflow-hidden relative"
                      style={{
                        width: 72,
                        height: 108,
                        background: isFilled
                          ? 'transparent'
                          : 'rgba(255,255,255,0.04)',
                        backdropFilter: isFilled ? 'none' : 'blur(8px)',
                        WebkitBackdropFilter: isFilled ? 'none' : 'blur(8px)',
                        border: isFilled
                          ? '1.5px solid rgba(201,169,110,0.45)'
                          : '1px dashed rgba(255,255,255,0.12)',
                        boxShadow: isFilled
                          ? '0 0 12px rgba(201,169,110,0.15), inset 0 1px 0 rgba(255,255,255,0.03)'
                          : 'inset 0 1px 0 rgba(255,255,255,0.03)',
                        transition: 'border-color 0.4s ease, box-shadow 0.4s ease',
                      }}
                    >
                      {isFilled ? (
                        <motion.div
                          className="w-full h-full rounded-card overflow-hidden"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: 'spring', stiffness: 280, damping: 16 }}
                        >
                          <TarotCard card={card} fill />
                        </motion.div>
                      ) : (
                        <span className="text-white/12 text-lg">{emoji}</span>
                      )}

                      {/* 星点汇聚效果 */}
                      <AnimatePresence>
                        {isConverging && (
                          <>
                            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                              <motion.div
                                key={angle}
                                className="absolute rounded-full pointer-events-none"
                                style={{
                                  width: 4,
                                  height: 4,
                                  background: '#c9a96e',
                                  boxShadow: '0 0 6px rgba(201,169,110,0.6)',
                                }}
                                initial={{
                                  x: Math.cos((angle * Math.PI) / 180) * 45,
                                  y: Math.sin((angle * Math.PI) / 180) * 55,
                                  opacity: 0.9,
                                  scale: 1,
                                }}
                                animate={{
                                  x: 0,
                                  y: 0,
                                  opacity: 0,
                                  scale: 0,
                                }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.45, ease: 'easeIn' }}
                              />
                            ))}
                          </>
                        )}
                      </AnimatePresence>
                    </motion.div>

                    {/* 位置标签（诗意） */}
                    <span
                      className="text-xs transition-colors duration-300"
                      style={{
                        color: isFilled
                          ? 'rgba(201,169,110,0.8)'
                          : 'rgba(255,255,255,0.25)',
                      }}
                    >
                      {label}
                    </span>
                  </motion.div>
                )
              })}
            </div>

            {/* 选满提示（卡槽下方） */}
            <AnimatePresence>
              {selectedCards.length === 3 && !isTransitioning && (
                <motion.p
                  className="text-center text-brand-gold text-xs -mt-1"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  灵境正在解读...
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== 星光汇聚 + 白屏过渡（选满后覆盖全屏）===== */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            key="white-flash"
            className="fixed inset-0 z-50 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            {/* 中心光点 */}
            <motion.div
              className="absolute left-1/2 top-1/2 rounded-full"
              style={{
                width: 20,
                height: 20,
                marginLeft: -10,
                marginTop: -10,
                background: 'radial-gradient(circle, #fff, rgba(201,169,110,0.8))',
                boxShadow: '0 0 40px rgba(201,169,110,0.6), 0 0 80px rgba(201,169,110,0.3)',
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1, 0.5], opacity: [0, 1, 0.8] }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />

            {/* 全屏白光扩散 */}
            <motion.div
              className="absolute inset-0"
              style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.9), rgba(201,169,110,0.3))' }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.25, ease: 'easeOut' }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
