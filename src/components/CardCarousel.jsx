import { useRef, useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import TarotCard from './TarotCard'

const CARD_W = 140  // 中心牌 lg 宽度
const CARD_H = 210  // 中心牌 lg 高度
const GAP = 16      // 牌间距
const SLOT_W = CARD_W + GAP  // 每槽位宽度

/**
 * 水平滚动牌轮播 —— P0-8 升级
 *
 * - 修复中心检测：找离视口中心最近的牌（不再用 Math.round）
 * - 景深效果：中心牌亮、两侧渐暗渐小
 * - 首次加载呼吸引导动画
 * - 选中时星芒闪烁 + 翻转
 * - 点击非中心牌 → 滚动到该牌
 */
export default function CardCarousel({
  cards,
  selectedCards,
  onSelect,
  maxSelect = 3,
}) {
  const containerRef = useRef(null)
  const [centerIndex, setCenterIndex] = useState(Math.floor(cards.length / 2))
  const [flippingId, setFlippingId] = useState(null)
  const [sparkingId, setSparkingId] = useState(null)   // 选中瞬间星芒闪烁
  const [showGuide, setShowGuide] = useState(true)     // 首次呼吸引导
  const [isProgrammaticScroll, setIsProgrammaticScroll] = useState(false)
  const isFull = selectedCards.length >= maxSelect

  // 已选中 id 集合
  const selectedIds = new Set(selectedCards.map((c) => c.id))

  // ===== 找离视口中心最近的牌（替代 Math.round，解决跳偏 bug）=====
  const findClosestCard = useCallback(() => {
    const el = containerRef.current
    if (!el) return 0
    const viewportCenter = el.scrollLeft + el.offsetWidth / 2
    const paddingLeft = el.offsetWidth / 2 - CARD_W / 2

    let closestIdx = 0
    let minDist = Infinity
    for (let i = 0; i < cards.length; i++) {
      const cardCenter = paddingLeft + i * SLOT_W + CARD_W / 2
      const dist = Math.abs(viewportCenter - cardCenter)
      if (dist < minDist) {
        minDist = dist
        closestIdx = i
      }
    }
    return closestIdx
  }, [cards.length])

  // ===== 滚动检测中心牌 =====
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const handleScroll = () => {
      // 程序化滚动（scrollToIndex）期间不更新 centerIndex，避免中间态误判
      if (isProgrammaticScroll) return
      setCenterIndex(findClosestCard())
    }

    el.addEventListener('scroll', handleScroll, { passive: true })
    // 初始检测
    handleScroll()
    return () => el.removeEventListener('scroll', handleScroll)
  }, [findClosestCard, isProgrammaticScroll])

  // ===== 首次呼吸引导（2s 后消失）=====
  useEffect(() => {
    const timer = setTimeout(() => setShowGuide(false), 2500)
    return () => clearTimeout(timer)
  }, [])

  // ===== 点击牌 =====
  const handleCardClick = (card, index) => {
    if (selectedIds.has(card.id)) return   // 已选
    if (isFull) return                      // 已满
    if (flippingId) return                  // 正在翻
    if (sparkingId) return                  // 正在星芒

    // 非中心牌 → 滚动到它
    if (index !== centerIndex) {
      scrollToIndex(index)
      return
    }

    // 中心牌 → 星芒闪烁 → 翻转
    setSparkingId(card.id)
    setTimeout(() => {
      setSparkingId(null)
      setFlippingId(card.id)
      setTimeout(() => {
        setFlippingId(null)
        onSelect(card)
      }, 650)
    }, 350) // 星芒持续 350ms
  }

  // ===== 滚动到指定牌（修正目标位置）=====
  const scrollToIndex = useCallback((index) => {
    const el = containerRef.current
    if (!el) return
    // scrollLeft = index * SLOT_W 时该牌居中（CSS padding 已处理首牌居中）
    const target = index * SLOT_W

    setIsProgrammaticScroll(true)
    el.scrollTo({ left: Math.max(0, target), behavior: 'smooth' })

    // 滚动结束后恢复检测（smooth scroll 约 300-500ms）
    setTimeout(() => {
      setCenterIndex(index)
      setIsProgrammaticScroll(false)
    }, 500)
  }, [])

  // ===== 卡牌离中心距离 → 视觉参数 =====
  const getVisualParams = (index) => {
    const dist = Math.abs(index - centerIndex)
    if (dist === 0) return { scale: 1, opacity: 1, brightness: 1, zIndex: 5 }
    if (dist === 1) return { scale: 0.78, opacity: 0.65, brightness: 0.65, zIndex: 3 }
    if (dist === 2) return { scale: 0.58, opacity: 0.35, brightness: 0.45, zIndex: 2 }
    return { scale: 0.42, opacity: 0.15, brightness: 0.3, zIndex: 1 }
  }

  // ===== 初始滚动到中间 =====
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const t = setTimeout(() => {
      scrollToIndex(Math.floor(cards.length / 2))
    }, 150)
    return () => clearTimeout(t)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative w-full">
      {/* 中心光晕 —— "灵境通道"（呼吸动画） */}
      <motion.div
        className="absolute left-1/2 pointer-events-none z-0"
        style={{
          top: '50%',
          marginLeft: -140,
          marginTop: -140,
          width: 280,
          height: 280,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(139,92,246,0.07) 0%, rgba(139,92,246,0.03) 40%, transparent 70%)',
        }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* 左右渐变遮罩 */}
      <div
        className="absolute left-0 top-0 bottom-0 z-10 pointer-events-none"
        style={{
          width: 40,
          background: 'linear-gradient(to right, #0d0221, transparent)',
        }}
      />
      <div
        className="absolute right-0 top-0 bottom-0 z-10 pointer-events-none"
        style={{
          width: 40,
          background: 'linear-gradient(to left, #0d0221, transparent)',
        }}
      />

      {/* 滚动容器 */}
      <div
        ref={containerRef}
        className="flex overflow-x-auto no-scrollbar carousel-snap relative z-[1]"
        style={{
          paddingLeft: `calc(50% - ${CARD_W / 2}px)`,
          paddingRight: `calc(50% - ${CARD_W / 2}px)`,
          paddingTop: 8,
          paddingBottom: 8,
          overscrollBehavior: 'contain',
        }}
      >
        {cards.map((card, i) => {
          const selected = selectedIds.has(card.id)
          const flipping = flippingId === card.id
          const sparking = sparkingId === card.id
          const { scale, opacity, brightness, zIndex } = getVisualParams(i)
          const isCenter = i === centerIndex

          return (
            <div
              key={card.id}
              className="flex-shrink-0 flex items-center justify-center"
              style={{
                width: SLOT_W,
                height: CARD_H + 20,
                scrollSnapAlign: 'center',
                scrollSnapStop: 'always',
              }}
              onClick={() => handleCardClick(card, i)}
            >
              {/* 3D 翻转容器 */}
              <motion.div
                animate={{
                  scale: flipping ? 1.1 : sparking ? scale + 0.02 : scale,
                  rotateY: flipping ? 180 : selected ? 180 : 0,
                  filter: `brightness(${brightness})`,
                  opacity: selected ? 0.5 : opacity,
                }}
                transition={{
                  scale: { type: 'spring', stiffness: 200, damping: 15 },
                  rotateY: { duration: 0.6, ease: 'easeInOut' },
                  filter: { duration: 0.3 },
                  opacity: { duration: 0.3 },
                }}
                style={{
                  width: CARD_W,
                  height: CARD_H,
                  perspective: 800,
                  transformStyle: 'preserve-3d',
                  cursor: isCenter && !selected && !isFull ? 'pointer' : undefined,
                  zIndex,
                  position: 'relative',
                }}
              >
                {/* 星芒闪烁层（选中瞬间） */}
                <AnimatePresence>
                  {sparking && (
                    <motion.div
                      className="absolute inset-0 z-20 rounded-card pointer-events-none"
                      style={{
                        background:
                          'radial-gradient(circle at center, rgba(201,169,110,0.5) 0%, rgba(201,169,110,0.15) 30%, transparent 70%)',
                        boxShadow:
                          '0 0 30px rgba(201,169,110,0.6), 0 0 60px rgba(201,169,110,0.3), 0 0 100px rgba(201,169,110,0.12)',
                      }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: [0, 1, 0.6], scale: [0.8, 1.05, 1] }}
                      exit={{ opacity: 0, scale: 1.1 }}
                      transition={{ duration: 0.35 }}
                    />
                  )}
                </AnimatePresence>

                {/* 背面 */}
                <div
                  className="absolute inset-0"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <TarotCard
                    size="lg"
                    selected={isCenter && !selected && !isFull}
                    guideBreathing={showGuide && isCenter}
                  />
                </div>

                {/* 正面（翻转后 / 已选） */}
                <div
                  className="absolute inset-0"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    pointerEvents: selected ? 'none' : undefined,
                  }}
                >
                  <TarotCard
                    card={card}
                    size="lg"
                    selected={false}
                  />
                </div>
              </motion.div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
