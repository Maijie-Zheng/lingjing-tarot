import { POSITION_LABEL } from '../lib/constants'

/**
 * 三牌关键词脉络 —— P3-5 v0.6
 *
 * 过去 / 现在 / 未来三个节点连成一条金色线
 * 每个节点：圆点 + 位置名（小，金）+ 关键词（2 字）
 * 中间「现在」节点略大、光晕略强
 *
 * 显示关键词而非牌名——不剧透，只给情绪弧线
 */
export default function NarrativeThread({ cards }) {
  if (!cards || cards.length !== 3) return null

  return (
    <div className="relative px-1 pb-1 pt-0.5">
      {/* 连接线 */}
      <div
        className="absolute left-[16%] right-[16%] top-[7px] h-px"
        style={{
          background:
            'linear-gradient(90deg, rgba(230,201,130,.15), rgba(230,201,130,.5), rgba(230,201,130,.15))',
        }}
      />
      <div className="relative flex justify-between">
        {cards.map((c, i) => {
          const mid = i === 1
          return (
            <div key={c.position || i} className="flex w-1/3 flex-col items-center">
              <div
                className="rounded-full border bg-[#171030]"
                style={{
                  width: mid ? 13 : 11,
                  height: mid ? 13 : 11,
                  borderColor: mid
                    ? 'rgba(230,201,130,.85)'
                    : 'rgba(230,201,130,.6)',
                  boxShadow: mid
                    ? '0 0 12px rgba(230,201,130,.45)'
                    : '0 0 8px rgba(230,201,130,.25)',
                  marginTop: mid ? -1 : 0,
                }}
              />
              <div className="mt-2 text-[10px] tracking-[2px] text-gold-200/60">
                {POSITION_LABEL[c.position] || c.position}
              </div>
              {c.keyword && (
                <div className="mt-0.5 text-[12px] text-white/[.82]">
                  {c.keyword}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
