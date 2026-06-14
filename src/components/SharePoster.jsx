import { forwardRef, useMemo } from 'react'
import { Moon, Sparkles, Sun } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { SHARE_URL, POSITION_LABEL } from '../lib/constants'

// ===== 位置图标映射 =====
const POS_ICON = { past: Moon, present: Sparkles, future: Sun }

// ===== 星空粒子（确定性伪随机，确保每次渲染一致）=====
const STARS = Array.from({ length: 36 }, (_, i) => ({
  x: ((i * 137.508 + 42) % 1000) / 1000 * 100,
  y: ((i * 271.828 + 31) % 1000) / 1000 * 100,
  size: ((i * 314.159 + 7) % 1000) / 1000 * 2 + 0.6,
  opacity: ((i * 161.803 + 13) % 1000) / 1000 * 0.4 + 0.15,
  gold: i % 5 !== 0,
}))

// ===== 星云光斑位置 =====
const NEBULAS = [
  { x: '15%', y: '20%', size: 220, color: 'rgba(139,92,246,0.04)' },
  { x: '75%', y: '50%', size: 260, color: 'rgba(201,169,110,0.03)' },
  { x: '25%', y: '78%', size: 200, color: 'rgba(139,92,246,0.035)' },
]

/**
 * 分享海报 —— P3-7 v0.9
 *
 * 纯 HTML 结构，供 html-to-image 导出 PNG。
 * 固定 375×667 逻辑像素（pixelRatio:2 → 750×1334）。
 *
 * 视觉结构（自上而下）：
 * 品牌头 → 分隔线 → 问题 → 三张牌 → 关键词脉络 → 金句 → 浓缩叙事 → 分隔线 → 二维码+水印
 *
 * Props:
 * - question: string
 * - cards: Array — 合并后的牌数据 { image, name, isReversed, keyword, position }
 * - shareQuote: string | null
 * - shareNarrative: string | null
 * - posterRef: React.RefObject（供 html-to-image 截图）
 */
const SharePoster = forwardRef(function SharePoster(
  { question, cards = [], shareQuote, shareNarrative },
  ref
) {
  // 关键词脉络：取每张牌的 keyword 用 · 连接
  const keywordThread = useMemo(() => {
    if (!cards || cards.length === 0) return null
    const keywords = cards.map((c) => c.keyword).filter(Boolean)
    return keywords.length > 0 ? keywords.join(' · ') : null
  }, [cards])

  return (
    <div
      ref={ref}
      style={{
        width: 375,
        minHeight: 667,
        background: 'linear-gradient(180deg, #1a0a2e 0%, #150830 40%, #0d0221 100%)',
        fontFamily: "'PingFang SC', 'Noto Sans SC', sans-serif",
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        padding: '40px 28px 28px',
        boxSizing: 'border-box',
      }}
    >
      {/* ===== 星云光斑 ===== */}
      {NEBULAS.map((n, i) => (
        <div
          key={`nebula-${i}`}
          style={{
            position: 'absolute',
            left: n.x,
            top: n.y,
            width: n.size,
            height: n.size,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${n.color} 0%, transparent 60%)`,
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* ===== 星空粒子 ===== */}
      {STARS.map((s, i) => (
        <div
          key={`star-${i}`}
          style={{
            position: 'absolute',
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            borderRadius: '50%',
            background: s.gold
              ? `rgba(201,169,110,${s.opacity})`
              : `rgba(255,255,255,${s.opacity})`,
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* ===== 1. 品牌头 ===== */}
      <h1
        style={{
          fontSize: 48,
          fontWeight: 'bold',
          fontFamily: "'Noto Serif SC', serif",
          background: 'linear-gradient(180deg, #E6C982 0%, #c9a96e 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: 9,
          margin: 0,
          lineHeight: 1.2,
          textAlign: 'center',
        }}
      >
        灵 境
      </h1>

      <p
        style={{
          fontSize: 14,
          color: 'rgba(255,255,255,0.55)',
          marginTop: 8,
          marginBottom: 0,
          textAlign: 'center',
        }}
      >
        解锁灵境，让心事皆有回响
      </p>

      {/* ===== 2. 装饰分隔线 ===== */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          marginTop: 20,
          width: '60%',
        }}
      >
        <div
          style={{
            flex: 1,
            height: 1,
            background:
              'linear-gradient(90deg, transparent, rgba(201,169,110,0.35), rgba(201,169,110,0.15))',
          }}
        />
        <div
          style={{
            width: 6,
            height: 6,
            background: 'rgba(201,169,110,0.5)',
            transform: 'rotate(45deg)',
            flexShrink: 0,
          }}
        />
        <div
          style={{
            flex: 1,
            height: 1,
            background:
              'linear-gradient(90deg, rgba(201,169,110,0.15), rgba(201,169,110,0.35), transparent)',
          }}
        />
      </div>

      {/* ===== 3. 问题 ===== */}
      <p
        style={{
          fontSize: 12,
          color: 'rgba(255,255,255,0.3)',
          marginTop: 24,
          marginBottom: 0,
          textAlign: 'center',
        }}
      >
        关于
      </p>
      <p
        style={{
          fontSize: 18,
          fontWeight: 500,
          fontFamily: "'Noto Serif SC', serif",
          color: 'rgba(255,255,255,0.88)',
          marginTop: 6,
          marginBottom: 0,
          textAlign: 'center',
          maxWidth: '90%',
          lineHeight: 1.5,
        }}
      >
        「{question || ''}」
      </p>

      {/* ===== 4. 三张牌 ===== */}
      {cards.length === 3 && (
        <div
          style={{
            display: 'flex',
            gap: 18,
            marginTop: 28,
            justifyContent: 'center',
          }}
        >
          {cards.map((card, i) => {
            const IconComp = POS_ICON[card.position] || Sparkles
            const isReversed = card.isReversed

            return (
              <div
                key={card.position || i}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                {/* 牌面容器 */}
                <div
                  style={{
                    width: 100,
                    height: 148,
                    borderRadius: 8,
                    border: '1.5px solid rgba(201,169,110,0.45)',
                    overflow: 'hidden',
                    position: 'relative',
                    boxShadow:
                      '0 0 16px rgba(201,169,110,0.15), 0 0 32px rgba(201,169,110,0.05)',
                    background: '#1e1050',
                    flexShrink: 0,
                  }}
                >
                  {card.image ? (
                    <img
                      src={card.image}
                      alt={card.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transform: isReversed ? 'rotate(180deg)' : 'none',
                      }}
                    />
                  ) : (
                    /* 兜底：渐变 + 牌名 */
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background:
                          'linear-gradient(135deg, #1e1050, #0d1b3e)',
                      }}
                    >
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 'bold',
                          fontFamily: "'Noto Serif SC', serif",
                          color: '#c9a96e',
                        }}
                      >
                        {card.name || '?'}
                      </span>
                    </div>
                  )}

                  {/* 逆位标签（金色胶囊，牌面右上角） */}
                  {isReversed && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 5,
                        right: 5,
                        padding: '2px 8px',
                        borderRadius: 10,
                        border: '1px solid rgba(201,169,110,0.5)',
                        background: 'rgba(201,169,110,0.18)',
                        color: '#c9a96e',
                        fontSize: 10,
                        fontFamily: "'PingFang SC', 'Noto Sans SC', sans-serif",
                        fontWeight: 500,
                      }}
                    >
                      逆
                    </div>
                  )}
                </div>

                {/* 位置图标 + 标签 */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                  }}
                >
                  <IconComp
                    size={13}
                    strokeWidth={1.6}
                    color="#c9a96e"
                    style={{ flexShrink: 0 }}
                  />
                  <span
                    style={{
                      fontSize: 11,
                      color: 'rgba(201,169,110,0.7)',
                    }}
                  >
                    {POSITION_LABEL[card.position] || card.position}
                  </span>
                </div>

                {/* 牌名 */}
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    fontFamily: "'Noto Serif SC', serif",
                    color: '#ffffff',
                    textAlign: 'center',
                    lineHeight: 1.3,
                  }}
                >
                  {card.name}
                  {isReversed && (
                    <span
                      style={{
                        fontSize: 10,
                        color: 'rgba(201,169,110,0.75)',
                        marginLeft: 3,
                      }}
                    >
                      逆
                    </span>
                  )}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* ===== 5. 关键词脉络 ===== */}
      {keywordThread && (
        <p
          style={{
            fontSize: 11,
            color: 'rgba(201,169,110,0.6)',
            letterSpacing: 3,
            marginTop: 20,
            marginBottom: 0,
            textAlign: 'center',
          }}
        >
          {keywordThread}
        </p>
      )}

      {/* ===== 6. 金句 ===== */}
      {shareQuote && (
        <p
          style={{
            fontSize: 16,
            fontFamily: "'Noto Serif SC', serif",
            color: '#F1DCA0',
            lineHeight: 1.85,
            marginTop: 18,
            marginBottom: 0,
            textAlign: 'center',
            maxWidth: '85%',
          }}
        >
          {shareQuote}
        </p>
      )}

      {/* ===== 7. 浓缩叙事 ===== */}
      {shareNarrative && (
        <p
          style={{
            fontSize: 12.5,
            color: 'rgba(255,255,255,0.72)',
            lineHeight: 2,
            marginTop: shareQuote ? 12 : 18,
            marginBottom: 0,
            textAlign: 'center',
            maxWidth: '85%',
          }}
        >
          {shareNarrative}
        </p>
      )}

      {/* ===== 8. 底部分隔线 ===== */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          marginTop: 24,
          width: '60%',
        }}
      >
        <div
          style={{
            flex: 1,
            height: 1,
            background:
              'linear-gradient(90deg, transparent, rgba(201,169,110,0.35), rgba(201,169,110,0.15))',
          }}
        />
        <div
          style={{
            width: 6,
            height: 6,
            background: 'rgba(201,169,110,0.5)',
            transform: 'rotate(45deg)',
            flexShrink: 0,
          }}
        />
        <div
          style={{
            flex: 1,
            height: 1,
            background:
              'linear-gradient(90deg, rgba(201,169,110,0.15), rgba(201,169,110,0.35), transparent)',
          }}
        />
      </div>

      {/* ===== 9. 底部：水印 + 二维码 ===== */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          width: '100%',
          marginTop: 20,
        }}
      >
        {/* 左：水印 */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span
            style={{
              fontSize: 20,
              fontWeight: 'bold',
              fontFamily: "'Noto Serif SC', serif",
              color: '#c9a96e',
              letterSpacing: 4,
            }}
          >
            灵境
          </span>
          <span
            style={{
              fontSize: 10,
              color: 'rgba(255,255,255,0.35)',
              marginTop: 2,
            }}
          >
            让心事皆有回响
          </span>
        </div>

        {/* 右：二维码 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <div
            style={{
              padding: 5,
              background: '#f3eede',
              borderRadius: 4,
              lineHeight: 0,
            }}
          >
            <QRCodeSVG
              value={SHARE_URL}
              size={42}
              bgColor="#f3eede"
              fgColor="#1a1338"
              level="M"
            />
          </div>
          <span
            style={{
              fontSize: 9,
              color: 'rgba(201,169,110,0.55)',
            }}
          >
            扫码 · 抽你的牌
          </span>
        </div>
      </div>
    </div>
  )
})

export default SharePoster
