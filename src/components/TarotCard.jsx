import { motion } from 'framer-motion'

/**
 * 单张塔罗牌组件
 *
 * Props:
 * - card: { name, nameEn, keywords } | null — 牌面数据，null 时显示牌背
 * - size: 'sm' | 'md' | 'lg' — 尺寸等级（默认 md）
 * - selected: boolean — 是否选中（金色发光边框）
 * - floating: boolean — 是否开启浮动动画（首页用）
 * - disabled: boolean — 是否置灰不可交互
 * - onClick: function — 点击回调
 * - className: string — 额外样式
 */

const sizeMap = {
  sm:  { width: 64,  height: 96  },
  md:  { width: 100, height: 150 },
  lg:  { width: 140, height: 210 },
}

export default function TarotCard({
  card = null,
  size = 'md',
  selected = false,
  floating = false,
  disabled = false,
  onClick,
  className = '',
}) {
  const { width, height } = sizeMap[size]
  const isFaceUp = !!card

  // 浮动动画配置
  const floatAnimation = floating
    ? {
        y: [0, -10, 0],
        rotate: [0, 5, 0],
      }
    : {}

  const floatTransition = floating
    ? {
        y: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
        rotate: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
      }
    : {}

  return (
    <motion.div
      onClick={disabled ? undefined : onClick}
      animate={floatAnimation}
      transition={floatTransition}
      style={{
        width,
        height,
        // 选中发光效果
        boxShadow: selected
          ? '0 0 20px rgba(201, 169, 110, 0.6), 0 0 40px rgba(201, 169, 110, 0.2)'
          : '0 4px 12px rgba(0, 0, 0, 0.3)',
        opacity: disabled ? 0.3 : 1,
        borderColor: selected ? 'rgba(201, 169, 110, 0.6)' : 'rgba(255,255,255,0.1)',
      }}
      className={`
        relative rounded-card border-2 cursor-pointer select-none
        flex items-center justify-center overflow-hidden
        ${onClick ? 'active:scale-95' : ''}
        transition-transform duration-200
        ${className}
      `}
    >
      {isFaceUp ? (
        /* ===== 牌面：真实韦特塔罗图片 + 中文牌名叠加 ===== */
        <div className="w-full h-full relative">
          <img
            src={card.image}
            alt={card.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {/* 牌名渐变叠加层 */}
          <div
            className="absolute bottom-0 left-0 right-0 rounded-b-card"
            style={{
              background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
              paddingTop: size === 'sm' ? 12 : 20,
              paddingBottom: size === 'sm' ? 3 : 6,
              paddingLeft: 4,
              paddingRight: 4,
            }}
          >
            <span
              className="block text-center font-serif leading-tight text-brand-gold"
              style={{ fontSize: size === 'sm' ? 10 : 13 }}
            >
              {card.name}
            </span>
            {size !== 'sm' && (
              <span
                className="block text-center leading-tight"
                style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)' }}
              >
                {card.isReversed ? '逆位' : card.nameEn}
              </span>
            )}
          </div>
        </div>
      ) : (
        /* ===== 牌背（深蓝底 + 金色星星几何图案） ===== */
        <div
          className="w-full h-full flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #0d1b3e, #162447)' }}
        >
          {/* 简化版星星几何图案 —— CSS 绘制 */}
          <div className="relative w-2/3 h-4/5 border border-brand-gold/40 rounded-card"
            style={{ background: 'rgba(201, 169, 110, 0.05)' }}
          >
            {/* 中心星形 */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-brand-gold/60 text-2xl">
              ✦
            </div>
            {/* 四角装饰 */}
            <div className="absolute top-2 left-2 text-brand-gold/30 text-xs">✦</div>
            <div className="absolute top-2 right-2 text-brand-gold/30 text-xs">✦</div>
            <div className="absolute bottom-2 left-2 text-brand-gold/30 text-xs">✦</div>
            <div className="absolute bottom-2 right-2 text-brand-gold/30 text-xs">✦</div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
