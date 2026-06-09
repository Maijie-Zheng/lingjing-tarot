import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import TarotCard from './TarotCard'

/**
 * 解读等待时的 Loading 动画 —— P0-9 重写
 *
 * 三层动画组合：
 * 1. 星轨双环：2 个同心圆环以不同速度旋转，环上有金色光点
 * 2. 塔罗牌浮现：牌背居中悬浮，上下微浮动 + 金色外发光
 * 3. 诗意文案：4 条轮换文案，AnimatePresence 淡入淡出
 * 4. 中心光晕：紫色径向渐变呼吸光晕
 */

const LOADING_MESSAGES = [
  '✨ 灵境读取中，牌意正在浮现…',
  '🔮 三张牌正在低语，讲述你的故事…',
  '🌙 倾听你心底的声音…',
  '💫 星图已显现，解读即将揭晓…',
]

const MESSAGE_INTERVAL = 2500 // 每条文案显示 2.5 秒

// 星轨光点角度（相对位置）
const ORBIT_DOTS_OUTER = [0, 72, 144, 216, 288] // 外环 5 颗
const ORBIT_DOTS_INNER = [30, 120, 210, 300]     // 内环 4 颗

// 星点粒子初始位置（8 个方向）
const STAR_PARTICLES = [0, 45, 90, 135, 180, 225, 270, 315]

export default function LoadingSpinner({ visible = true }) {
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    if (!visible) return
    const timer = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length)
    }, MESSAGE_INTERVAL)
    return () => clearInterval(timer)
  }, [visible])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="flex flex-col items-center justify-center gap-8 py-8 relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* ===== 中心光晕背景 ===== */}
          <motion.div
            className="absolute pointer-events-none"
            style={{
              width: 400,
              height: 400,
              borderRadius: '50%',
              background:
                'radial-gradient(circle, rgba(139,92,246,0.05) 0%, rgba(139,92,246,0.02) 40%, transparent 60%)',
            }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* ===== 星轨 + 牌面区域 ===== */}
          <div className="relative w-[220px] h-[260px] flex items-center justify-center">
            {/* --- 外环星轨 --- */}
            <motion.div
              className="absolute rounded-full pointer-events-none"
              style={{
                width: 200,
                height: 200,
                border: '1px solid rgba(201,169,110,0.15)',
              }}
              animate={{
                rotate: 360,
                opacity: [0.4, 0.75, 0.4],
              }}
              transition={{
                rotate: { duration: 10, repeat: Infinity, ease: 'linear' },
                opacity: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
              }}
            >
              {/* 外环光点 */}
              {ORBIT_DOTS_OUTER.map((angle) => (
                <div
                  key={angle}
                  className="absolute"
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    background: 'rgba(201,169,110,0.6)',
                    boxShadow: '0 0 6px rgba(201,169,110,0.4)',
                    left: '50%',
                    top: 0,
                    marginLeft: -2,
                    marginTop: -2,
                    transform: `rotate(${angle}deg) translateY(-100px)`,
                  }}
                />
              ))}
            </motion.div>

            {/* --- 内环星轨 --- */}
            <motion.div
              className="absolute rounded-full pointer-events-none"
              style={{
                width: 150,
                height: 150,
                border: '1px solid rgba(201,169,110,0.12)',
              }}
              animate={{
                rotate: -360,
                opacity: [0.5, 0.85, 0.5],
              }}
              transition={{
                rotate: { duration: 7, repeat: Infinity, ease: 'linear' },
                opacity: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' },
              }}
            >
              {/* 内环光点 */}
              {ORBIT_DOTS_INNER.map((angle) => (
                <div
                  key={angle}
                  className="absolute"
                  style={{
                    width: 3,
                    height: 3,
                    borderRadius: '50%',
                    background: 'rgba(201,169,110,0.5)',
                    boxShadow: '0 0 5px rgba(201,169,110,0.3)',
                    left: '50%',
                    top: 0,
                    marginLeft: -1.5,
                    marginTop: -1.5,
                    transform: `rotate(${angle}deg) translateY(-75px)`,
                  }}
                />
              ))}
            </motion.div>

            {/* --- 星点粒子汇聚（8 颗）--- */}
            {STAR_PARTICLES.map((angle) => (
              <motion.div
                key={`star-${angle}`}
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: 2.5,
                  height: 2.5,
                  background: '#c9a96e',
                  boxShadow: '0 0 4px rgba(201,169,110,0.5)',
                  left: '50%',
                  top: '50%',
                }}
                animate={{
                  x: [
                    Math.cos((angle * Math.PI) / 180) * 80,
                    Math.cos((angle * Math.PI) / 180) * 20,
                    Math.cos((angle * Math.PI) / 180) * 80,
                  ],
                  y: [
                    Math.sin((angle * Math.PI) / 180) * 100,
                    Math.sin((angle * Math.PI) / 180) * 25,
                    Math.sin((angle * Math.PI) / 180) * 100,
                  ],
                  opacity: [0, 0.7, 0],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: angle * 0.03,
                }}
              />
            ))}

            {/* --- 塔罗牌浮现（中心）--- */}
            <motion.div
              animate={{
                y: [0, -6, 0],
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{
                boxShadow:
                  '0 0 30px rgba(201,169,110,0.15), 0 0 60px rgba(201,169,110,0.06)',
                borderRadius: 12,
              }}
            >
              <TarotCard size="lg" />
            </motion.div>
          </div>

          {/* ===== 诗意文案轮换 ===== */}
          <div className="h-8 relative flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={messageIndex}
                className="text-white/50 text-sm absolute whitespace-nowrap"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              >
                {LOADING_MESSAGES[messageIndex]}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* ===== 进度指示器：过去/现在/未来 ===== */}
          <div className="flex items-center gap-6">
            {[
              { emoji: '🌙', label: '过去·溯源' },
              { emoji: '✨', label: '现在·当下' },
              { emoji: '🌟', label: '未来·趋势' },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                className="flex flex-col items-center gap-0.5"
                animate={{ opacity: [0.2, 0.7, 0.2] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.4, // 相位差制造波浪效果
                }}
              >
                <span className="text-sm">{item.emoji}</span>
                <span
                  className="text-xs"
                  style={{ color: 'rgba(255,255,255,0.2)' }}
                >
                  {item.label}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
