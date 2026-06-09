import { motion } from 'framer-motion'

/**
 * 单张塔罗牌组件 —— P0-8 升级
 *
 * Props:
 * - card: { name, nameEn, keywords, image } | null — 牌面数据，null 时显示牌背
 * - size: 'sm' | 'md' | 'lg' — 尺寸等级（默认 md）
 * - selected: boolean — 是否选中（三层金色发光边框）
 * - floating: boolean — 是否开启浮动动画（首页用）
 * - disabled: boolean — 是否置灰不可交互
 * - fill: boolean — 填满父容器（用于卡槽场景，忽略 size 固定尺寸）
 * - guideBreathing: boolean — 是否播放呼吸引导动画（首次加载用）
 * - onClick: function — 点击回调
 * - className: string — 额外样式
 */

const sizeMap = {
  sm:  { width: 64,  height: 96  },
  md:  { width: 100, height: 150 },
  lg:  { width: 140, height: 210 },
}

// 选中态三层光晕（和 AskPage 聚焦光效风格统一）
const SELECTED_GLOW = [
  '0 0 12px rgba(201,169,110,0.3)',    // 紧贴发光
  '0 0 30px rgba(201,169,110,0.15)',   // 中距离
  '0 0 50px rgba(201,169,110,0.06)',   // 远距离光晕
].join(', ')

const DEFAULT_SHADOW = '0 4px 12px rgba(0, 0, 0, 0.3)'

export default function TarotCard({
  card = null,
  size = 'md',
  selected = false,
  floating = false,
  disabled = false,
  fill = false,
  guideBreathing = false,
  onClick,
  className = '',
}) {
  // fill 模式不设固定宽高，由父容器控制
  const { width, height } = fill ? {} : sizeMap[size]
  const isFaceUp = !!card

  // 浮动动画配置
  const floatAnimation = floating
    ? { y: [0, -10, 0], rotate: [0, 5, 0] }
    : {}

  const floatTransition = floating
    ? {
        y: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
        rotate: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
      }
    : {}

  // 呼吸引导动画（首次加载）
  const guideAnimation = guideBreathing
    ? {
        scale: [1, 1.03, 1, 0.98, 1],
        boxShadow: [
          '0 4px 16px rgba(201,169,110,0.2)',
          '0 4px 24px rgba(201,169,110,0.35)',
          '0 4px 16px rgba(201,169,110,0.2)',
          '0 4px 8px rgba(201,169,110,0.1)',
          '0 4px 16px rgba(201,169,110,0.2)',
        ],
      }
    : {}

  const guideTransition = guideBreathing
    ? { duration: 2.2, ease: 'easeInOut' }
    : {}

  return (
    <motion.div
      onClick={disabled ? undefined : onClick}
      animate={{
        ...floatAnimation,
        ...guideAnimation,
        boxShadow: selected ? SELECTED_GLOW : guideBreathing ? undefined : DEFAULT_SHADOW,
        borderColor: selected ? 'rgba(201,169,110,0.55)' : 'rgba(255,255,255,0.1)',
      }}
      transition={{
        ...floatTransition,
        ...guideTransition,
      }}
      style={{
        ...(fill ? {} : { width, height }),
        opacity: disabled ? 0.3 : 1,
      }}
      className={`
        relative rounded-card border-2 cursor-pointer select-none
        flex items-center justify-center overflow-hidden
        ${fill ? 'w-full h-full' : ''}
        ${onClick ? 'active:scale-95' : ''}
        transition-transform duration-200
        ${className}
      `}
    >
      {isFaceUp ? (
        /* ===== 牌面：真实韦特塔罗图片 + 中文牌名叠加层 ===== */
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
        /* ===== 牌背：深蓝底 + 星盘几何图案（P0-8 升级）===== */
        <div
          className="w-full h-full flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #0d1b3e, #162447)' }}
        >
          {/* 外层边框 */}
          <div
            className="relative w-[85%] h-[90%] rounded-card flex items-center justify-center"
            style={{
              border: '1px solid rgba(201,169,110,0.3)',
              background: 'rgba(201,169,110,0.04)',
            }}
          >
            {/* 环形轨道 1（外层） */}
            <div
              className="absolute rounded-full"
              style={{
                width: '82%',
                height: '68%',
                border: '1px solid rgba(201,169,110,0.1)',
              }}
            />

            {/* 环形轨道 2（内层） */}
            <div
              className="absolute rounded-full"
              style={{
                width: '60%',
                height: '48%',
                border: '1px solid rgba(201,169,110,0.12)',
              }}
            />

            {/* 星盘对角线（X 形） */}
            <div
              className="absolute w-px"
              style={{
                height: '78%',
                background: 'rgba(201,169,110,0.12)',
                transform: 'rotate(45deg)',
              }}
            />
            <div
              className="absolute w-px"
              style={{
                height: '78%',
                background: 'rgba(201,169,110,0.12)',
                transform: 'rotate(-45deg)',
              }}
            />

            {/* 中心星形 */}
            <div
              className="absolute"
              style={{
                color: 'rgba(201,169,110,0.5)',
                fontSize: size === 'sm' ? 18 : 28,
              }}
            >
              ✦
            </div>

            {/* 四角符文 —— 小圆点组成的几何图形 */}
            {[
              { top: 6, left: 6 },
              { top: 6, right: 6 },
              { bottom: 6, left: 6 },
              { bottom: 6, right: 6 },
            ].map((pos, i) => (
              <div
                key={i}
                className="absolute flex items-center justify-center"
                style={{
                  ...pos,
                  width: 16,
                  height: 16,
                }}
              >
                {/* 中心小点 */}
                <div
                  style={{
                    width: 3,
                    height: 3,
                    borderRadius: '50%',
                    background: 'rgba(201,169,110,0.35)',
                  }}
                />
                {/* 四周围绕小点 */}
                {[0, 90, 180, 270].map((angle) => (
                  <div
                    key={angle}
                    className="absolute"
                    style={{
                      width: 2,
                      height: 2,
                      borderRadius: '50%',
                      background: 'rgba(201,169,110,0.18)',
                      transform: `rotate(${angle}deg) translateY(-5px)`,
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}
