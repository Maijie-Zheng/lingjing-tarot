/**
 * 金色渐变装饰分隔线
 *
 * 两条向中心渐隐的发丝线 + 中央 45° 金色小菱形
 * 用于整体叙事与行动建议模块内标题与正文之间
 */
export default function Divider() {
  return (
    <div className="flex items-center justify-center gap-2 py-2">
      {/* 左发丝线 */}
      <div
        className="h-px flex-1"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(201,169,110,0.35))',
        }}
      />
      {/* 中央金色菱形 */}
      <div
        className="shrink-0"
        style={{
          width: 7,
          height: 7,
          background:
            'linear-gradient(135deg, rgba(230,201,130,0.7), rgba(201,169,110,0.4))',
          transform: 'rotate(45deg)',
          boxShadow: '0 0 6px rgba(201,169,110,0.3)',
        }}
      />
      {/* 右发丝线 */}
      <div
        className="h-px flex-1"
        style={{
          background:
            'linear-gradient(90deg, rgba(201,169,110,0.35), transparent)',
        }}
      />
    </div>
  )
}
