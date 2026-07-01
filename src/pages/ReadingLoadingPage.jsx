import { useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Moon, Sparkles, Sun } from 'lucide-react'
import StarField from '../components/StarField'
import CardBack from '../components/CardBack'
import { getSystemPrompt, buildUserPrompt } from '../utils/promptBuilder'
import { callDeepSeek } from '../utils/api'

// ===== 三牌位配置（图标 + 标签 + 动画延迟）=====
const SLOTS = [
  { icon: Moon, label: '过去 · 溯源', delay: '0s' },
  { icon: Sparkles, label: '现在 · 当下', delay: '1.2s' },
  { icon: Sun, label: '未来 · 趋势', delay: '2.4s' },
]

/**
 * 读取过渡页 —— P3-6 v0.7
 *
 * 抽完三张牌后、解读页之前的视觉过渡：
 * - 中央 CardBack 浮动 + 呼吸光晕 + 辉光，营造"悬停读取"感
 * - 底部三牌位依次点亮（过去→现在→未来循环）暗示"正在逐张解读"
 * - 全页无 emoji，统一金色细线图标
 * - 异步状态机（最短停留、超时、失败重试）本期不实现，仅留 TODO
 *
 * 最小接口：拿到解读结果就跳解读页。
 */
export default function ReadingLoadingPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { question = '', picks } = location.state ?? {}
  const startedRef = useRef(false)

  // ===== 发起 AI 请求，拿到结果就跳解读页 =====
  // 当前实现：进入页面即发起请求，结果返回后跳转 ReadingPage
  // 已知可优化点（非阻塞，后续迭代）:
  //   - 最短停留：结果再快也至少停留 ~1.5s，避免一闪而过失去仪式感
  //   - 超时安抚：约 8s 未回 → 切换更耐心的文案
  //   - 失败态增强：显示具体失败原因 + 重试按钮（重试只重发请求，不重新抽牌）
  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true

    if (!question || !picks || picks.length !== 3) {
      navigate('/reading', {
        replace: true,
        state: { question, cards: picks || [], preError: '缺少抽牌数据，请从洗牌页重新进入' },
      })
      return
    }

    const fetchReading = async () => {
      try {
        const systemPrompt = getSystemPrompt()
        const userPrompt = buildUserPrompt(question, picks)
        const text = await callDeepSeek(systemPrompt, userPrompt)
        navigate('/reading', {
          replace: true,
          state: { question, cards: picks, preReading: text },
        })
      } catch (err) {
        console.error('AI 解读失败:', err)
        navigate('/reading', {
          replace: true,
          state: {
            question,
            cards: picks,
            preError: err.message || '牌面能量有点波动，请再试一次',
          },
        })
      }
    }

    fetchReading()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      className="relative min-h-[100dvh] overflow-hidden"
      style={{
        background:
          'radial-gradient(120% 80% at 50% 40%, #211748 0%, #150E30 52%, #0C0820 100%)',
      }}
    >
      <StarField density={4200} goldRatio={0.32} />

      <div className="relative z-10 flex min-h-[100dvh] flex-col p-[18px]">
        {/* 顶栏：重新抽牌 */}
        <button
          onClick={() =>
            navigate('/draw', { replace: true, state: { question } })
          }
          className="flex w-fit items-center gap-1.5 text-[13px] text-gold-200/55 hover:text-gold-200/85 transition-colors"
        >
          <ArrowLeft size={16} strokeWidth={1.6} aria-hidden /> 重新抽牌
        </button>

        {/* 问题卡 */}
        <div className="mt-3 rounded-2xl border border-gold/[.16] bg-white/[0.03] px-4 py-[11px] text-center">
          <div className="text-[11px] tracking-wide text-white/40">你问的是</div>
          <div className="mt-0.5 text-[14px] text-white/85">
            {question || '此刻的心事'}
          </div>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center">
          {/* 中央牌背：浮动 + 光晕 + 辉光 */}
          <div className="relative flex h-[230px] w-[200px] items-center justify-center animate-floaty">
            {/* 呼吸光晕 */}
            <div
              className="absolute left-1/2 top-1/2 h-[200px] w-[200px] rounded-full animate-halo"
              style={{
                background:
                  'radial-gradient(circle, rgba(230,201,130,.22) 0%, rgba(230,201,130,0) 64%)',
              }}
            />
            {/* 牌背 + 牌身辉光 */}
            <div className="relative h-[174px] w-[118px] animate-cardglow rounded-[9px]">
              <CardBack showStar className="h-full w-full" />
            </div>
          </div>

          {/* 文案：星芒 SVG + 呼吸文字 */}
          <div className="mt-[30px] flex items-center gap-2 font-serif text-[15px] tracking-[2px] text-gold-200/80 animate-txtbreathe">
            <svg
              width="14"
              height="14"
              viewBox="0 0 64 64"
              aria-hidden
            >
              <path
                d="M32,6 C33,28 36,31 58,32 C36,33 33,36 32,58 C31,36 28,33 6,32 C28,31 31,28 32,6 Z"
                fill="#E6C982"
              />
            </svg>
            灵境读取中，牌意正在浮现…
          </div>

          {/* 三牌位依次点亮 */}
          <div className="mt-[38px] flex gap-10">
            {SLOTS.map(({ icon: Icon, label, delay }) => (
              <div key={label} className="flex flex-col items-center gap-[7px]">
                <Icon
                  size={24}
                  strokeWidth={1.6}
                  className="animate-slotcycle"
                  style={{ animationDelay: delay }}
                  aria-hidden
                />
                <span className="text-[11px] text-white/40">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
