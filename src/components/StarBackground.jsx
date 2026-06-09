import { useEffect, useRef } from 'react'

/**
 * 星空粒子背景 —— Canvas 实现
 * 30-50 个金色/白色粒子，缓慢飘动
 * 作为全局背景在所有页面使用
 */
export default function StarBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let animationId
    let particles = []

    // 适配屏幕尺寸
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // 创建粒子
    const PARTICLE_COUNT = 40
    const initParticles = () => {
      particles = []
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: Math.random() * 1.5 + 0.5,          // 半径 0.5-2px
          speedX: (Math.random() - 0.5) * 0.3,    // 水平漂移
          speedY: (Math.random() - 0.5) * 0.3,    // 垂直漂移
          opacity: Math.random() * 0.6 + 0.2,     // 基础透明度 0.2-0.8
          twinkleSpeed: Math.random() * 0.02 + 0.005,
          twinkleOffset: Math.random() * Math.PI * 2,
          // 80% 金色 / 20% 白色
          color: Math.random() < 0.8
            ? { r: 201, g: 169, b: 110 }   // 品牌金 #c9a96e
            : { r: 255, g: 255, b: 255 },  // 白色
        })
      }
    }
    initParticles()

    // 动画循环
    const animate = (timestamp) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((p) => {
        // 位置更新
        p.x += p.speedX
        p.y += p.speedY

        // 边界循环——飘出屏幕后从另一边回来
        if (p.x < -10) p.x = canvas.width + 10
        if (p.x > canvas.width + 10) p.x = -10
        if (p.y < -10) p.y = canvas.height + 10
        if (p.y > canvas.height + 10) p.y = -10

        // 闪烁效果——透明度随正弦波变化
        const twinkle = Math.sin(timestamp * p.twinkleSpeed + p.twinkleOffset)
        const currentOpacity = p.opacity + twinkle * 0.2
        const alpha = Math.max(0, Math.min(1, currentOpacity))

        // 绘制粒子
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${alpha})`
        ctx.fill()

        // 稍大粒子加光晕
        if (p.r > 1.2) {
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.r * 2.5, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${alpha * 0.15})`
          ctx.fill()
        }
      })

      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  )
}
