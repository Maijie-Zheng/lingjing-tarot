import { useRef, useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import TarotCard from './TarotCard'

const CARD_W = 140  // 中心牌 lg 宽度
const CARD_H = 210  // 中心牌 lg 高度
const GAP = 16      // 牌间距

/**
 * 水平滚动牌轮播
 *
 * - CSS scroll-snap 吸附
 * - 中心牌最大，两侧渐小
 * - 已选牌显示牌面（真实图片）并半透明不可交互
 * - 点击中心牌 → 3D 翻转 → onSelect
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
  const isFull = selectedCards.length >= maxSelect

  // 已选中 id 集合
  const selectedIds = new Set(selectedCards.map((c) => c.id))

  // ===== 滚动检测中心牌 =====
  const updateCenter = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    const paddingLeft = el.offsetWidth / 2 - CARD_W / 2
    const scrollCenter = el.scrollLeft + el.offsetWidth / 2
    const slotW = CARD_W + GAP
    const idx = Math.round((scrollCenter - paddingLeft) / slotW)
    setCenterIndex(Math.max(0, Math.min(cards.length - 1, idx)))
  }, [cards.length])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.addEventListener('scroll', updateCenter, { passive: true })
    updateCenter()
    return () => el.removeEventListener('scroll', updateCenter)
  }, [updateCenter])

  // ===== 点击牌 =====
  const handleCardClick = (card, index) => {
    if (selectedIds.has(card.id)) return   // 已选
    if (isFull) return                      // 已满
    if (flippingId) return                  // 正在翻

    // 非中心牌 → 滚动到它
    if (index !== centerIndex) {
      scrollToIndex(index)
      return
    }

    // 中心牌 → 翻转
    setFlippingId(card.id)
    setTimeout(() => {
      setFlippingId(null)
      onSelect(card)
    }, 650) // 翻牌动画时长
  }

  // ===== 滚动到指定牌 =====
  const scrollToIndex = (index) => {
    const el = containerRef.current
    if (!el) return
    const paddingLeft = el.offsetWidth / 2 - CARD_W / 2
    const target = index * (CARD_W + GAP) - paddingLeft
    el.scrollTo({ left: Math.max(0, target), behavior: 'smooth' })
  }

  // ===== 根据离中心距离算缩放 =====
  const getScale = (index) => {
    const dist = Math.abs(index - centerIndex)
    if (dist === 0) return 1
    if (dist === 1) return 0.78
    if (dist === 2) return 0.6
    return 0.45
  }

  // ===== 初始滚动到中间 =====
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    // 延迟等 DOM 就绪
    const t = setTimeout(() => {
      scrollToIndex(Math.floor(cards.length / 2))
    }, 100)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="relative w-full">
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
        className="flex overflow-x-auto no-scrollbar carousel-snap"
        style={{
          paddingLeft: `calc(50% - ${CARD_W / 2}px)`,
          paddingRight: `calc(50% - ${CARD_W / 2}px)`,
          paddingTop: 8,
          paddingBottom: 8,
        }}
      >
        {cards.map((card, i) => {
          const selected = selectedIds.has(card.id)
          const flipping = flippingId === card.id
          const scale = getScale(i)
          const isCenter = i === centerIndex

          return (
            <div
              key={card.id}
              className="flex-shrink-0 flex items-center justify-center"
              style={{
                width: CARD_W + GAP,
                height: CARD_H + 20,
                scrollSnapAlign: 'center',
              }}
              onClick={() => handleCardClick(card, i)}
            >
              {/* 3D 翻转容器 */}
              <motion.div
                animate={{
                  scale: flipping ? 1.1 : scale,
                  rotateY: flipping ? 180 : selected ? 180 : 0,
                }}
                transition={{
                  scale: { type: 'spring', stiffness: 200, damping: 15 },
                  rotateY: { duration: 0.6, ease: 'easeInOut' },
                }}
                style={{
                  width: CARD_W,
                  height: CARD_H,
                  perspective: 800,
                  transformStyle: 'preserve-3d',
                  cursor: isCenter && !selected && !isFull ? 'pointer' : undefined,
                }}
              >
                {/* 背面 */}
                <div
                  className="absolute inset-0"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <TarotCard size="lg" selected={isCenter && !selected && !isFull} />
                </div>

                {/* 正面（翻转后 / 已选） */}
                <div
                  className="absolute inset-0"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    opacity: selected ? 0.5 : 1,
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
