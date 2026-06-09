import { motion } from 'framer-motion'

// 漂浮粒子配置
const PARTICLES = [
  { x: '12%', y: '25%', size: 3, delay: 0, duration: 2.5 },
  { x: '82%', y: '18%', size: 2, delay: 0.6, duration: 3.1 },
  { x: '75%', y: '78%', size: 3, delay: 1.2, duration: 2.7 },
  { x: '20%', y: '75%', size: 2, delay: 1.8, duration: 3.3 },
  { x: '48%', y: '88%', size: 2.5, delay: 0.3, duration: 2.9 },
  { x: '88%', y: '52%', size: 2, delay: 0.9, duration: 3.5 },
  { x: '10%', y: '50%', size: 2.5, delay: 1.5, duration: 2.6 },
  { x: '55%', y: '8%', size: 2, delay: 2.0, duration: 3.0 },
]

// 外层环标记角度（8 个，每 45°）
const OUTER_MARKS = [0, 45, 90, 135, 180, 225, 270, 315]
// 内层环标记角度（8 个，偏移 22.5°）
const INNER_MARKS = [22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5]

/**
 * 灵境之眼 —— 首页主视觉符号
 *
 * 双层旋转金色星环 + 中心发光菱形 + 漂浮粒子。
 * 纯 CSS + Framer Motion 实现，无图片依赖。
 *
 * 灵感：占星仪 / 星盘，传递"神秘、高级、灵境品牌"的感觉。
 */
export default function StarEye({ className = '' }) {
  return (
    <div className={`relative ${className}`} style={{ width: 220, height: 220 }}>
      {/* ===== 底层光晕 ===== */}
      <div
        className="absolute rounded-full"
        style={{
          width: 180,
          height: 180,
          top: 20,
          left: 20,
          background:
            'radial-gradient(circle, rgba(201,169,110,0.12) 0%, rgba(201,169,110,0.03) 40%, transparent 70%)',
        }}
      />

      {/* ===== 外层星环（顺时针 20s） ===== */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 200,
          height: 200,
          top: 10,
          left: 10,
          border: '1px solid rgba(201, 169, 110, 0.45)',
          boxShadow:
            '0 0 20px rgba(201, 169, 110, 0.1), inset 0 0 20px rgba(201, 169, 110, 0.05)',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      >
        {OUTER_MARKS.map((deg) => (
          <div
            key={deg}
            className="absolute"
            style={{
              width: 4,
              height: 4,
              background: '#c9a96e',
              transform: `rotate(${deg}deg) translateY(-98px)`,
              left: 'calc(50% - 2px)',
              top: 'calc(50% - 2px)',
              boxShadow: '0 0 4px rgba(201,169,110,0.5)',
            }}
          />
        ))}
      </motion.div>

      {/* ===== 内层星环（逆时针 15s） ===== */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 140,
          height: 140,
          top: 40,
          left: 40,
          border: '1px solid rgba(201, 169, 110, 0.35)',
          boxShadow: '0 0 12px rgba(201, 169, 110, 0.08)',
        }}
        animate={{ rotate: -360 }}
        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
      >
        {INNER_MARKS.map((deg) => (
          <div
            key={deg}
            className="absolute"
            style={{
              width: 3,
              height: 3,
              background: '#c9a96e',
              opacity: 0.7,
              transform: `rotate(${deg}deg) translateY(-69px)`,
              left: 'calc(50% - 1.5px)',
              top: 'calc(50% - 1.5px)',
            }}
          />
        ))}
      </motion.div>

      {/* ===== 中心发光菱形（呼吸 3s） ===== */}
      <motion.div
        className="absolute"
        style={{
          width: 24,
          height: 24,
          top: 'calc(50% - 12px)',
          left: 'calc(50% - 12px)',
          background: 'rgba(201, 169, 110, 0.9)',
          transform: 'rotate(45deg)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
        }}
        animate={{
          scale: [1, 1.08, 1],
          boxShadow: [
            '0 0 20px rgba(201, 169, 110, 0.5), 0 0 40px rgba(201, 169, 110, 0.25)',
            '0 0 32px rgba(201, 169, 110, 0.7), 0 0 60px rgba(201, 169, 110, 0.35)',
            '0 0 20px rgba(201, 169, 110, 0.5), 0 0 40px rgba(201, 169, 110, 0.25)',
          ],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* ===== 中心亮点（小白色菱形，不旋转） ===== */}
      <div
        className="absolute"
        style={{
          width: 8,
          height: 8,
          top: 'calc(50% - 4px)',
          left: 'calc(50% - 4px)',
          transform: 'rotate(45deg)',
          background: '#f0e6d8',
          boxShadow: '0 0 8px rgba(240, 230, 216, 0.7)',
        }}
      />

      {/* ===== 漂浮粒子 ===== */}
      {PARTICLES.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            left: p.x,
            top: p.y,
            background: i % 3 === 0 ? '#c9a96e' : '#f0e6d8',
          }}
          animate={{
            y: [0, -8, 0, 6, 0],
            opacity: [0.3, 0.9, 0.3, 0.7, 0.3],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: p.delay,
          }}
        />
      ))}
    </div>
  )
}
